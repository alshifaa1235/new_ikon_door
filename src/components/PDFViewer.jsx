import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, ExternalLink, BookOpen, Layers } from 'lucide-react';

export default function PDFViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('reader'); // 'reader' or 'native'
  const totalPages = 24;

  const pdfUrl = '/catalogue/NEW_IKON_DOORS.pdf';

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 60), 160));
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('pdf-canvas-container');
    if (!document.fullscreenElement) {
      elem?.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* Top Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--bg-dark)',
          color: '#FFFFFF',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold-light)', fontWeight: 600, fontSize: '0.9rem' }}>
            <BookOpen size={18} /> Official New Ikon Doors Catalogue
          </div>
          <span style={{ color: '#78716C' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#A8A29E' }}>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Navigation & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Mode Switcher */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-pill)', padding: '0.2rem', display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
            <button
              onClick={() => setViewMode('reader')}
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: viewMode === 'reader' ? 'var(--color-gold)' : 'transparent',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              Interactive Reader
            </button>
            <button
              onClick={() => setViewMode('native')}
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: viewMode === 'native' ? 'var(--color-gold)' : 'transparent',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              Native PDF Frame
            </button>
          </div>

          {viewMode === 'reader' && (
            <>
              <button
                onClick={() => handleZoom(-15)}
                title="Zoom Out"
                style={{ padding: '0.4rem', color: '#FFFFFF', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ fontSize: '0.78rem', minWidth: '42px', textAlign: 'center' }}>{zoomLevel}%</span>
              <button
                onClick={() => handleZoom(15)}
                title="Zoom In"
                style={{ padding: '0.4rem', color: '#FFFFFF', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={toggleFullscreen}
                title="Fullscreen"
                style={{ padding: '0.4rem', color: '#FFFFFF', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <Maximize2 size={16} />
              </button>
            </>
          )}

          {/* Download Button */}
          <a
            href={pdfUrl}
            download="NEW_IKON_DOORS_CATALOGUE.pdf"
            className="btn btn-gold"
            style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', marginLeft: '0.5rem' }}
          >
            <Download size={14} /> Download PDF (5.4 MB)
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="pdf-canvas-container" style={{ backgroundColor: '#262626', minHeight: '650px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {viewMode === 'reader' ? (
          <div style={{ padding: '2rem 1rem', width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
            <div
              style={{
                width: `${zoomLevel}%`,
                maxWidth: '1200px',
                transition: 'width 0.25s ease',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <img
                src={`/catalogue_pages/page_${String(currentPage).padStart(2, '0')}.jpg`}
                alt={`Catalogue Page ${currentPage}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            title="New Ikon Doors PDF Catalogue"
            style={{ width: '100%', height: '800px', border: 'none' }}
          />
        )}

        {/* Floating Prev/Next Controls for Reader Mode */}
        {viewMode === 'reader' && (
          <div
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              backgroundColor: 'rgba(18, 18, 18, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              color: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              zIndex: 10
            }}
          >
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', color: '#FFFFFF' }}
            >
              <ChevronLeft size={20} /> Prev Page
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold-light)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', color: '#FFFFFF' }}
            >
              Next Page <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div style={{ padding: '1.25rem', backgroundColor: '#EDE9E2', borderTop: '1px solid var(--border-light)', overflowX: 'auto', display: 'flex', gap: '0.75rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            style={{
              flexShrink: 0,
              width: '80px',
              borderRadius: '4px',
              overflow: 'hidden',
              border: currentPage === pageNum ? '2px solid var(--color-gold-dark)' : '1px solid #D6D3D1',
              boxShadow: currentPage === pageNum ? '0 4px 12px rgba(184, 151, 108, 0.4)' : 'none',
              transition: 'all 0.2s ease',
              backgroundColor: '#FFFFFF'
            }}
          >
            <img
              src={`/catalogue_pages/page_${String(pageNum).padStart(2, '0')}.jpg`}
              alt={`Page ${pageNum}`}
              style={{ width: '100%', height: '56px', objectFit: 'cover' }}
            />
            <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.2rem 0', fontWeight: currentPage === pageNum ? 700 : 500 }}>
              Page {pageNum}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
