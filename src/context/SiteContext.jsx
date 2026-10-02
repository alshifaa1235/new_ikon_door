import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import companyData from '../data/company.json';
import productsData from '../data/products.json';

const defaultSettings = {
  company_name: companyData.name || 'New Ikon Doors',
  tagline: companyData.tagline || 'Elevate Your Space • Upgrade Your Entrance',
  phone: companyData.phone || '+91 98424 45353',
  phone_alt: companyData.phoneAlt || '+91 98424 43353',
  whatsapp: companyData.whatsapp || '9842445353',
  email: companyData.email || 'abbas43353@gmail.com',
  address: companyData.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India',
  specialization: companyData.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods',
  machinery: companyData.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology',
  timings: 'Mon – Sat: 9:00 AM – 8:30 PM',
  hq_city: 'Trichy, Tamil Nadu'
};

const defaultHomepage = {
  hero: {
    title: 'Doors that define the space.',
    subtitle: '',
    description: 'Engineered with CNC precision, kiln-seasoned hardwood cores, and vacuum-bonded membrane technology. Wholesale door manufacturer and supplier in Trichy, Tamil Nadu.',
    badge: 'New Ikon Doors • Manufacturing & Wholesale HQ',
    cta_primary: 'Explore Collections',
    cta_secondary: 'Request a Quote'
  },
  intro: {
    statement: 'Premium doors designed to become part of the architecture.',
    description: 'New Ikon Doors combines advanced CNC routing technology with traditional timber craftsmanship. Dealers in PVC, Teak, Rubber Wood, Mica, and Plywoods — serving architects, builders, and interior designers across Tamil Nadu.',
    cta: 'Discover New Ikon'
  },
  trust_stats: [
    { value: '130+', label: 'Catalogue Elevations' },
    { value: '3', label: 'Trichy Group Divisions' },
    { value: '10', label: 'Door Collections' }
  ]
};

const defaultUsps = [
  { id: 1, title: 'In-House CNC Precision', description: 'Computer numerical control routing and vacuum-press membrane bonding for crisp geometric motifs and structural consistency.', icon: 'Cpu', verified: true, published: true, sort_order: 1 },
  { id: 2, title: 'Water & Moisture Resistance', description: 'Multi-layer protective polymer coats and WPVC compositions engineered to endure humid regional climates.', icon: 'Droplets', verified: true, published: true, sort_order: 2 },
  { id: 3, title: 'Architectural Customization', description: 'Custom door dimensions, distinct wood-grain tones, authentic marble veining, and metallic stainless steel inlays.', icon: 'Layers', verified: true, published: true, sort_order: 3 },
  { id: 4, title: 'Wholesale Group Synergies', description: 'Direct coordination with sister divisions Classic Ply & Lam and Royal Lam & Ply for consolidated trade supply.', icon: 'ShieldCheck', verified: true, published: true, sort_order: 4 }
];

const SiteContext = createContext({
  settings: defaultSettings,
  collections: [],
  homepageContent: defaultHomepage,
  catalogue: { title: 'New Ikon Doors Catalogue', file_url: '/catalogue/NEW_IKON_DOORS.pdf', version: '2026.1' },
  usps: defaultUsps,
  refreshSiteData: () => {},
  loading: true
});

export function useSite() {
  return useContext(SiteContext);
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [collections, setCollections] = useState(() => (productsData.collections || []).map(c => ({
    ...c,
    product_count: c.products ? c.products.length : 0
  })));
  const [homepageContent, setHomepageContent] = useState(defaultHomepage);
  const [catalogue, setCatalogue] = useState({
    title: 'New Ikon Doors Official Catalogue',
    file_url: '/catalogue/NEW_IKON_DOORS.pdf',
    version: '2026.1'
  });
  const [usps, setUsps] = useState(defaultUsps);
  const [loading, setLoading] = useState(true);

  const refreshSiteData = useCallback(async () => {
    try {
      const { api } = await import('../services/api');
      const [fetchedSettings, fetchedCollections, fetchedHomepage, fetchedCatalogue, fetchedUsps] = await Promise.allSettled([
        api.getSettings(),
        api.getCollections(),
        api.getHomepage(),
        api.getCatalogue(),
        api.getUsps()
      ]);

      if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value) {
        setSettings(prev => ({
          ...prev,
          ...fetchedSettings.value,
          timings: fetchedSettings.value.timings || prev.timings,
          phone: fetchedSettings.value.phone || prev.phone,
          whatsapp: fetchedSettings.value.whatsapp || prev.whatsapp
        }));
      }

      if (fetchedCollections.status === 'fulfilled' && Array.isArray(fetchedCollections.value) && fetchedCollections.value.length > 0) {
        setCollections(fetchedCollections.value);
      }

      if (fetchedHomepage.status === 'fulfilled' && fetchedHomepage.value && Object.keys(fetchedHomepage.value).length > 0) {
        setHomepageContent(prev => ({
          ...prev,
          ...fetchedHomepage.value,
          hero: { ...prev.hero, ...(fetchedHomepage.value.hero || {}) },
          intro: { ...prev.intro, ...(fetchedHomepage.value.intro || {}) }
        }));
      }

      if (fetchedCatalogue.status === 'fulfilled' && fetchedCatalogue.value && (fetchedCatalogue.value.file_url || fetchedCatalogue.value.pdf_url)) {
        setCatalogue(fetchedCatalogue.value);
      }

      if (fetchedUsps.status === 'fulfilled' && Array.isArray(fetchedUsps.value) && fetchedUsps.value.length > 0) {
        setUsps(fetchedUsps.value);
      }
    } catch (err) {
      console.warn('Error loading dynamic site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Non-blocking background sync: Initial static state renders in 0ms,
    // then cloud sync updates seamlessly without delaying First/Largest Contentful Paint.
    const runRefresh = () => {
      refreshSiteData();
    };

    let idleRefreshId = null;
    let timerRefreshId = null;
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleRefreshId = window.requestIdleCallback(runRefresh, { timeout: 1200 });
      } else {
        timerRefreshId = setTimeout(runRefresh, 300);
      }
    } else {
      refreshSiteData();
    }

    // Listen to local admin update events
    const handleDataChanged = () => {
      refreshSiteData();
    };

    window.addEventListener('nid:data-changed', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);
    document.addEventListener('visibilitychange', handleDataChanged);

    // Supabase Real-time Cloud Synchronization across ALL devices
    let channel = null;
    let supabaseClient = null;
    const setupRealtime = async () => {
      try {
        const { supabase } = await import('../services/supabaseClient');
        if (supabase) {
          supabaseClient = supabase;
          channel = supabase
            .channel('public:db-sync')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
              refreshSiteData();
            })
            .subscribe();
        }
      } catch (e) {
        console.warn('Realtime subscription issue:', e);
      }
    };

    let idleRealtimeId = null;
    let timerRealtimeId = null;
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleRealtimeId = window.requestIdleCallback(setupRealtime, { timeout: 2000 });
      } else {
        timerRealtimeId = setTimeout(setupRealtime, 600);
      }
    }

    return () => {
      window.removeEventListener('nid:data-changed', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
      document.removeEventListener('visibilitychange', handleDataChanged);
      if (idleRefreshId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleRefreshId);
      if (timerRefreshId) clearTimeout(timerRefreshId);
      if (idleRealtimeId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleRealtimeId);
      if (timerRealtimeId) clearTimeout(timerRealtimeId);
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [refreshSiteData]);

  return (
    <SiteContext.Provider value={{
      settings,
      collections,
      homepageContent,
      catalogue,
      usps,
      refreshSiteData,
      loading
    }}>
      {children}
    </SiteContext.Provider>
  );
}
