'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Maximize, Minimize, ZoomIn, ZoomOut, Play, Pause, RefreshCw, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DeckMetadata, RESOURCE_LEVEL_DISCLAIMER } from '@/lib/resources/decks';

interface DeckViewerProps {
  deck: DeckMetadata;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function DeckViewer({ deck }: DeckViewerProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  
  // Touch coordinates for swipe navigation
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // 1. Dynamically load PDF.js from CDN to bypass all Webpack/Next.js worker bundle issues
  useEffect(() => {
    if (window.pdfjsLib) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        setScriptLoaded(true);
      } else {
        setScriptError(true);
        setLoading(false);
      }
    };

    script.onerror = () => {
      setScriptError(true);
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Clean up script if needed, but keeping it loaded is usually fine.
    };
  }, []);

  // 2. Load the PDF document
  useEffect(() => {
    if (!scriptLoaded) return;

    const loadPdf = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const pdfjsLib = window.pdfjsLib;
        const loadedPdf = await pdfjsLib.getDocument(deck.pdfPath).promise;
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoadError('Failed to load presentation deck. The file may be temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [scriptLoaded, deck.pdfPath]);

  // 3. Render the active page on canvas
  const renderPage = async (pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      setRendering(true);
      
      // Cancel previous render task if active to avoid page flickering/overlap
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 800;
      const containerHeight = container?.clientHeight || 500;

      // Calculate perfect scale to fit-within-container (contain)
      const viewport = page.getViewport({ scale: 1.0 });
      const scaleX = containerWidth / viewport.width;
      const scaleY = containerHeight / viewport.height;
      const scale = Math.min(scaleX, scaleY) * 0.98; // Soft safety bounds

      const scaledViewport = page.getViewport({ scale: scale || 1.0 });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Clear standard context parameters
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    } finally {
      setRendering(false);
    }
  };

  // Trigger page render when page, doc, or fullscreen dimensions change
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, isFullscreen, focusMode]);

  // Handle browser resize events to recalculate scale
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc) {
        renderPage(currentPage);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, currentPage]);

  // 4. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop actions when user is typing inside input forms elsewhere
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault(); // Stop space page down scroll
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        }
        if (focusMode) {
          setFocusMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, currentPage, isFullscreen, focusMode]);

  // 5. Fullscreen API Handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    if (viewerContainerRef.current?.requestFullscreen) {
      viewerContainerRef.current.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // 6. Navigation Triggers
  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleJump = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 7. Swipe Handlers for Mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped Left -> Next Slide
      handleNext();
    } else if (diff < -50) {
      // Swiped Right -> Previous Slide
      handlePrev();
    }
  };

  // Custom slide progress percentage
  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* Dynamic Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link 
          href="/resources" 
          className="inline-flex items-center text-sm font-semibold text-[#0E5E5A] hover:text-[#E05E1B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resource Library
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              focusMode 
                ? 'bg-[#E05E1B] text-white border-[#E05E1B] shadow-md' 
                : 'bg-white text-[#122321] border-[#e2ded5] hover:bg-[#FAF9F6]'
            }`}
          >
            {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
          </button>
        </div>
      </div>

      {/* Presentation Viewer Frame */}
      <div 
        ref={viewerContainerRef}
        className={`relative flex flex-col w-full overflow-hidden transition-all duration-300 rounded-2xl ${
          isFullscreen 
            ? 'h-screen bg-[#122321] p-0' 
            : focusMode
              ? 'h-[75vh] bg-[#122321] shadow-2xl border border-[#0E5E5A]/20'
              : 'h-[50vh] md:h-[65vh] bg-[#1c3330] shadow-xl border border-[#e2ded5]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Fullscreen Header Control Bar */}
        {(isFullscreen || focusMode) && (
          <div className="flex items-center justify-between w-full px-6 py-4 bg-[#122321]/90 backdrop-blur-md border-b border-white/5 z-20">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-[#E05E1B] font-semibold">{deck.category}</span>
              <h2 className="text-sm font-bold text-white line-clamp-1">{deck.title}</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-white/60 font-mono">
                Slide {currentPage} of {totalPages}
              </span>
              {isFullscreen && (
                <button 
                  onClick={exitFullscreen}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Exit Fullscreen"
                >
                  <Minimize className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Presentation Canvas Area */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden w-full h-full">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#122321] text-white z-10 space-y-4">
              <RefreshCw className="w-8 h-8 text-[#E05E1B] animate-spin" />
              <p className="text-sm font-medium tracking-wide">Loading premium presentation assets...</p>
            </div>
          )}

          {scriptError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#122321] text-white z-10 p-6 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-[#E05E1B]" />
              <h3 className="text-lg font-bold">Failed to Initialize Presentation Engine</h3>
              <p className="text-sm text-white/60 max-w-md">There was a problem loading the script libraries. Please verify your internet connection and reload the page.</p>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#122321] text-white z-10 p-6 text-center space-y-4">
              <X className="w-12 h-12 text-[#E05E1B] border-2 border-[#E05E1B] rounded-full p-2" />
              <h3 className="text-lg font-bold">Document Access Restructured</h3>
              <p className="text-sm text-white/60 max-w-md">{loadError}</p>
            </div>
          )}

          {/* Canvas for rendering PDF page */}
          <canvas 
            ref={canvasRef} 
            className={`shadow-2xl transition-opacity duration-200 bg-white rounded-lg ${
              rendering ? 'opacity-80' : 'opacity-100'
            }`}
          />
        </div>

        {/* Solid Slider Progress Bar */}
        <div className="w-full bg-white/10 h-[3px]">
          <div 
            className="bg-[#E05E1B] h-full transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Deck Controller Interface (Sticky Footer) */}
        <div className="w-full px-6 py-4 bg-[#122321]/95 border-t border-white/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-10">
          
          {/* Slide Indicator Details */}
          <div className="flex items-center space-x-3 text-white">
            <span className="text-sm font-bold tracking-wide">
              Slide {currentPage} <span className="text-white/40 font-normal">of</span> {totalPages || deck.slideCount}
            </span>
          </div>

          {/* Core Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1 || loading}
              className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Slide (ArrowLeft)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages || loading}
              className="p-2.5 rounded-xl bg-[#0E5E5A] text-white hover:bg-[#E05E1B] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg"
              title="Next Slide (ArrowRight / Space)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Presentation Tools */}
          <div className="flex items-center space-x-3">
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                disabled={loading}
                className="p-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center space-x-1 text-xs font-semibold"
                title="Fullscreen Mode"
              >
                <Maximize className="w-4 h-4 mr-1" />
                <span>Fullscreen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jump-To-Slide Compact Navigator */}
      {totalPages > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2ded5] p-4 shadow-sm flex flex-col space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E5A]">Slide Navigator</span>
          <div className="flex items-center space-x-2 overflow-x-auto py-1 custom-scrollbar gap-1 max-w-full">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handleJump(pageNum)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#E05E1B] text-white shadow-md'
                    : 'bg-[#FAF9F6] text-[#122321] hover:bg-[#0E5E5A]/10'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Slide Disclaimer Cards */}
      <div className="bg-white rounded-2xl border border-[#e2ded5] p-6 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-[#122321] flex items-center">
          <AlertTriangle className="w-5 h-5 text-[#E05E1B] mr-2" />
          Usage Disclaimer & Integrity Guard
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#e2ded5] space-y-2">
            <span className="font-bold text-[#0E5E5A] block uppercase tracking-wider">Deck Specific Notice</span>
            <p className="editorial-text text-[#122321] font-medium leading-relaxed">{deck.disclaimer}</p>
          </div>
          
          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#e2ded5] space-y-2">
            <span className="font-bold text-[#0E5E5A] block uppercase tracking-wider">Strategic Knowledge Disclaimer</span>
            <p className="editorial-text text-[#122321] font-medium leading-relaxed">{RESOURCE_LEVEL_DISCLAIMER}</p>
          </div>
        </div>

        <div className="p-4 bg-[#0E5E5A]/5 rounded-xl border border-[#0E5E5A]/10 text-xs">
          <span className="font-bold text-[#0E5E5A] block uppercase tracking-wider mb-1">Secure Presentation Only</span>
          <p className="editorial-text text-[#122321]/80 leading-relaxed">
            In compliance with copyright and strategic ownership guidelines, download and extraction actions for this PDF deck are disabled in the user interface. This viewer functions purely as a polished presentation and curriculum reader.
          </p>
        </div>
      </div>
    </div>
  );
}
