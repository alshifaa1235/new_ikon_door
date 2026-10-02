// ── Production-Grade Client-side SEO utility ──
// Dynamically manages document title, meta descriptions, canonical link,
// Open Graph, Twitter cards, robots directives, and page-level JSON-LD structured data.

const SITE_NAME = 'New Ikon Doors';
const BASE_URL = 'https://www.newikondoors.co.in';
const DEFAULT_TITLE = 'New Ikon Doors | Architectural Door Manufacturer & Wholesaler • Trichy';
const DEFAULT_DESC  = 'New Ikon Doors: Precision architectural door manufacturing in Trichy, Tamil Nadu. Manufacturers & wholesalers of Marble Membrane, UV Membrane, Steel Patti, Teak, and WPVC Doors.';
const DEFAULT_IMAGE = `${BASE_URL}/new_ikon_logo.png`;

function setMetaTag(selector, attrName, attrVal, content) {
  let el = document.querySelector(selector);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href.startsWith('http') ? href : `${BASE_URL}${href}`);
}

function setStructuredData(data) {
  let script = document.getElementById('page-structured-data');
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = 'page-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Update all SEO head elements for the current page route.
 * @param {Object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.description]
 * @param {string} [opts.canonical]
 * @param {string} [opts.image]
 * @param {string} [opts.type]
 * @param {string} [opts.robots]
 * @param {Object|Array} [opts.structuredData]
 */
export function setSEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  robots,
  structuredData,
} = {}) {
  // Title
  const finalTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : DEFAULT_TITLE;
  document.title = finalTitle;

  // Description
  const finalDesc = description || DEFAULT_DESC;
  setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);
  setMetaTag('meta[name="title"]', 'name', 'title', finalTitle);

  // Canonical
  const finalCanonical = canonical || (window.location.pathname ? window.location.pathname : '/');
  setCanonical(finalCanonical);

  // Robots
  if (robots) {
    setMetaTag('meta[name="robots"]', 'name', 'robots', robots);
  } else {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  }

  // Open Graph
  const finalImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`) : DEFAULT_IMAGE;
  const finalUrl = `${BASE_URL}${window.location.pathname}`;

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);

  // Twitter
  setMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', finalTitle);
  setMetaTag('meta[property="twitter:description"]', 'property', 'twitter:description', finalDesc);
  setMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', finalImage);
  setMetaTag('meta[property="twitter:url"]', 'property', 'twitter:url', finalUrl);

  // Structured Data (JSON-LD)
  setStructuredData(structuredData);
}
