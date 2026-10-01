import React, { useState, useEffect, useCallback, createContext, useContext, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';
import { setSEO } from './services/seo';
import { SiteProvider, useSite } from './context/SiteContext';
import { MessageSquare } from 'lucide-react';

// ── Lazy-loaded pages (code-splitting) ──
const HomePage = lazy(() => import('./pages/HomePage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const CataloguePage = lazy(() => import('./pages/CataloguePage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const RequestQuotePage = lazy(() => import('./pages/RequestQuotePage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));

// ── Navigation Context ──
export const NavContext = createContext();

export function useNav() { return useContext(NavContext); }

// ── URL Router ──
function parseRoute(pathname) {
  if (pathname === '/' || pathname === '') return { page: 'home', params: {} };
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'admin') {
    if (parts[1] === 'login') return { page: 'admin-login', params: {} };
    return { page: 'admin', params: { section: parts[1] || 'dashboard' } };
  }

  if (parts[0] === 'collections') {
    if (parts[1]) return { page: 'collection-detail', params: { slug: parts[1] } };
    return { page: 'collections', params: {} };
  }

  if ((parts[0] === 'product' || parts[0] === 'products') && parts[1]) {
    return { page: 'product-detail', params: { code: parts.slice(1).join('/') } };
  }
  if (parts[0] === 'products' || parts[0] === 'all-doors' || parts[0] === 'doors') {
    return { page: 'collections', params: {} };
  }

  if (parts[0] === 'about' || parts[0] === 'about-us') return { page: 'about', params: {} };
  if (parts[0] === 'testimonials' || parts[0] === 'reviews') return { page: 'testimonials', params: {} };
  if (parts[0] === 'branches' || parts[0] === 'showrooms' || parts[0] === 'locations') return { page: 'branches', params: {} };
  if (parts[0] === 'catalogue' || parts[0] === 'catalog') return { page: 'catalogue', params: {} };
  if (parts[0] === 'contact' || parts[0] === 'contact-us') return { page: 'contact', params: {} };
  if (parts[0] === 'request-quote' || parts[0] === 'quote' || parts[0] === 'enquiry') return { page: 'request-quote', params: {} };

  return { page: '404', params: {} };
}

// ── Suspense fallback (matches site aesthetic) ──
function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 32, height: 32,
        border: '2px solid var(--border-light)',
        borderTopColor: 'var(--color-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

// ── 404 Page ──
function NotFoundPage() {
  const { navigate } = useNav();
  useEffect(() => {
    setSEO({ title: '404 Page Not Found', robots: 'noindex, nofollow' });
  }, []);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, marginBottom: '1rem', letterSpacing: '0.02em' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="btn btn-dark"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

function MainApp() {
  const { settings } = useSite();
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteProducts, setQuoteProducts] = useState([]);
  const [pageTransition, setPageTransition] = useState(false);

  // ── Navigate with pushState ──
  const navigate = useCallback((path, replace = false) => {
    if (path === window.location.pathname) return;

    setPageTransition(true);
    setTimeout(() => {
      if (replace) window.history.replaceState({}, '', path);
      else window.history.pushState({}, '', path);
      setRoute(parseRoute(path));
      window.scrollTo({ top: 0 });
      setTimeout(() => setPageTransition(false), 50);
    }, 150);
  }, []);

  // ── Handle browser back/forward ──
  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute(window.location.pathname));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Quote handlers ──
  const addToQuote = useCallback((product) => {
    setQuoteProducts(prev => {
      if (prev.some(p => p.code === product.code)) return prev;
      return [...prev, product];
    });
    setIsQuoteOpen(true);
  }, []);

  const removeFromQuote = useCallback((code) => {
    setQuoteProducts(prev => prev.filter(p => p.code !== code));
  }, []);

  const openQuote = useCallback(() => setIsQuoteOpen(true), []);

  // ── Context value ──
  const navCtx = { navigate, addToQuote, removeFromQuote, openQuote, quoteProducts };

  // ── Render page ──
  const { page, params } = route;
  const isAdmin = page === 'admin' || page === 'admin-login';

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />;
      case 'collections': return <CollectionsPage />;
      case 'collection-detail': return <CollectionDetailPage slug={params.slug} />;
      case 'product-detail': return <ProductDetailPage code={params.code} />;
      case 'about': return <AboutPage />;
      case 'testimonials': return <TestimonialsPage />;
      case 'branches': return <BranchesPage />;
      case 'catalogue': return <CataloguePage />;
      case 'contact': return <ContactPage />;
      case 'request-quote': return <RequestQuotePage />;
      case 'admin-login': return <AdminLoginPage />;
      case 'admin': return <AdminLayout section={params.section} />;
      case '404': return <NotFoundPage />;
      default: return <NotFoundPage />;
    }
  };

  const whatsappPhone = (settings.whatsapp || '9842445353').replace(/[^0-9]/g, '');

  return (
    <NavContext.Provider value={navCtx}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {!isAdmin && <Navbar currentPage={page} quoteCount={quoteProducts.length} />}

        <main style={{
          flex: 1,
          opacity: pageTransition ? 0 : 1,
          transition: 'opacity 0.15s ease',
        }}>
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </main>

        {!isAdmin && <Footer />}

        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          products={quoteProducts}
          onRemove={removeFromQuote}
        />

        {/* Floating WhatsApp FAB */}
        {!isAdmin && (
          <a
            href={`https://wa.me/91${whatsappPhone}?text=Hi%20New%20Ikon%20Doors%2C%20I%27m%20interested%20in%20your%20door%20collections.`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 900,
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#25D366',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquare size={24} />
          </a>
        )}
      </div>
    </NavContext.Provider>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <MainApp />
    </SiteProvider>
  );
}

