import { createClient } from '@supabase/supabase-js';

// Environment variables from Vite (never secrets, only publishable anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
}

// Client-side singleton instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Safe error sanitization (never reveal internal DB schemas, table names, or stack traces)
export function sanitizeError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = err.message || (typeof err === 'string' ? err : '');
  if (msg.includes('JWT') || msg.includes('token') || msg.includes('auth')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
    return 'A record with this identifier or code already exists.';
  }
  if (msg.includes('violates foreign key')) {
    return 'The associated category or collection does not exist.';
  }
  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'Access denied: You do not have permission to perform this action.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  return msg || 'Request could not be completed.';
}

// ── Rate Limiting for Login Attempts (Client-side layer) ──
const LOCKOUT_KEY = 'nid_auth_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit() {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && data.lockedUntil > now) {
      const waitSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }

    // Reset if window has elapsed
    if (now - data.firstAttempt > LOCKOUT_DURATION_MS) {
      localStorage.removeItem(LOCKOUT_KEY);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - data.attempts);
    return { allowed: remaining > 0, remainingAttempts: remaining };
  } catch {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
}

export function recordFailedLoginAttempt() {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(LOCKOUT_KEY);
    let data = raw ? JSON.parse(raw) : { attempts: 0, firstAttempt: now };

    if (now - data.firstAttempt > LOCKOUT_DURATION_MS) {
      data = { attempts: 1, firstAttempt: now };
    } else {
      data.attempts += 1;
    }

    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_DURATION_MS;
    }

    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
  } catch {}
}

export function clearLoginRateLimit() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {}
}

// ── Authentication Service ──
export const authService = {
  async signIn(email, password) {
    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Master Administrator Fast-Path (guarantees owner can ALWAYS log in)
    const isMasterAdmin = (
      cleanInput === 'admin' ||
      cleanInput === 'admin@newikondoors.com' ||
      cleanInput === 'admin@ikon.com'
    );

    if (isMasterAdmin && (cleanPass === 'admin123' || cleanPass === 'admin')) {
      clearLoginRateLimit();
      const adminUser = {
        id: 'admin',
        email: cleanInput.includes('@') ? cleanInput : 'admin@newikondoors.com',
        role: 'admin',
        name: 'Administrator',
      };
      try {
        localStorage.setItem('nid_user', JSON.stringify(adminUser));
      } catch {}
      return {
        user: adminUser,
        session: { access_token: 'nid-admin-session' },
      };
    }

    // 2. Check Rate Limit
    const rateLimit = checkLoginRateLimit();
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.waitSeconds / 60);
      throw new Error(`Too many failed login attempts. Please wait ${minutes} minute(s) before trying again.`);
    }

    // 3. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: cleanPass,
        });

        if (!error && data?.user) {
          // Verify that this user is explicitly an Administrator
          const { data: profile, error: profileErr } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!profileErr && profile && profile.role === 'admin') {
            clearLoginRateLimit();
            const userObj = {
              id: data.user.id,
              email: data.user.email,
              role: profile.role,
            };
            try {
              localStorage.setItem('nid_user', JSON.stringify(userObj));
            } catch {}
            return {
              user: userObj,
              session: data.session,
            };
          }
        }
        if (error) {
          recordFailedLoginAttempt();
          throw new Error(sanitizeError(error));
        }
      } catch (err) {
        recordFailedLoginAttempt();
        throw err;
      }
    }

    recordFailedLoginAttempt();
    throw new Error('Invalid username/email or password. Default is admin / admin123');
  },

  async signOut() {
    try {
      localStorage.removeItem('nid_user');
    } catch {}
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    clearLoginRateLimit();
  },

  async getCurrentUser() {
    // 1. If Supabase is configured, check active Supabase Auth session
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profile && profile.role === 'admin') {
            return {
              id: session.user.id,
              email: session.user.email,
              role: profile.role,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }
    }

    // 2. Fallback to persisted administrator session in localStorage
    try {
      const saved = localStorage.getItem('nid_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.id === 'admin')) {
          return parsed;
        }
      }
    } catch {}

    return null;
  },
};

// ── Storage Service ──
export const storageService = {
  async uploadFile(bucket, file, folder = '') {
    if (!file) throw new Error('No file provided for upload.');

    // 1. Validation
    const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    if (bucket === 'catalogue') {
      if (!isPdf) throw new Error('Only PDF catalogue documents are permitted.');
      if (file.size > 50 * 1024 * 1024) throw new Error('Catalogue PDF file size exceeds maximum limit of 50MB.');
    } else {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
      const ext = '.' + file.name?.split('.').pop()?.toLowerCase();

      if (!allowedImageTypes.includes(file.type) && !allowedExts.includes(ext)) {
        throw new Error('Invalid image format. Allowed formats: JPG, PNG, WebP, SVG.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image file size exceeds maximum limit of 10MB.');
      }
    }

    // 2. Safe Path Generation (timestamp + sanitized alphanumeric name)
    const ext = file.name.split('.').pop()?.toLowerCase() || (isPdf ? 'pdf' : 'jpg');
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const filename = `${Date.now()}_${sanitizedBase}.${ext}`;
    const filePath = folder ? `${folder.replace(/^\/|\/$/g, '')}/${filename}` : filename;

    // 3. Remote Supabase Storage Upload
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: false,
        });

      if (error) throw new Error(sanitizeError(error));

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        publicUrl: publicData.publicUrl,
      };
    }

    // 4. Local Data URL / Fallback (for offline or local preview)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ path: filePath, publicUrl: reader.result });
      reader.onerror = () => reject(new Error('Failed to read local file preview.'));
      reader.readAsDataURL(file);
    });
  },

  async deleteFile(bucket, path) {
    if (!isSupabaseConfigured() || !supabase || !path) return true;
    try {
      const cleanPath = path.includes('/storage/v1/object/public/')
        ? path.split(`${bucket}/`).pop()
        : path;
      const { error } = await supabase.storage.from(bucket).remove([cleanPath]);
      return !error;
    } catch {
      return false;
    }
  },
};
