import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  pdfData: string; // base64 data URL (e.g. data:application/pdf;base64,...) or blob URL
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfData, className = '' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0); // 1.0 = 100% Fit Width
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Monitor container width for responsive fit-width scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!pdfData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Dynamically import pdfjs-dist
        const pdfjs = await import('pdfjs-dist');
        
        // Configure standard worker
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        // Convert data URL / base64 to Uint8Array
        let sourceData: Uint8Array;
        if (pdfData.startsWith('data:')) {
          const base64 = pdfData.split(',')[1] || '';
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          sourceData = bytes;
        } else {
          // If URL
          const res = await fetch(pdfData);
          const buf = await res.arrayBuffer();
          sourceData = new Uint8Array(buf);
        }

        const loadingTask = pdfjs.getDocument({
          data: sourceData,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('PDF.js rendering error:', err);
          setError(err.message || 'Unable to render original PDF visual.');
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfData]);

  // Render current page onto canvas with object-fit: contain and fit-width scaling
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // 1. Calculate unscaled base viewport (scale 1.0)
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // 2. Measure available container width (default to 640 if not yet measured)
        const availableWidth = containerWidth || containerRef.current?.clientWidth || 640;
        const padding = 32; // Comfortable margin inside card
        const targetWidth = Math.max(260, availableWidth - padding);

        // 3. Fit-width scale calculation: 1.0 zoom scale = exactly 100% of container width
        const fitWidthRatio = targetWidth / unscaledViewport.width;
        const effectiveScale = fitWidthRatio * scale;

        // 4. Create viewport with effective scale
        const viewport = page.getViewport({ scale: effectiveScale });

        // 5. High-DPI support for crisp, readable text rendering
        const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        // Responsive styling with object-fit: contain and auto height
        canvas.style.width = '100%';
        canvas.style.maxWidth = `${Math.floor(viewport.width)}px`;
        canvas.style.height = 'auto';
        canvas.style.objectFit = 'contain';

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          console.warn('Canvas page render error:', err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, scale, numPages, containerWidth]);

  return (
    <div ref={containerRef} className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Floating Toolbar with Navigation, Zoom, and Fit-Width controls */}
      <div className="w-full mb-3 flex items-center justify-between px-3 py-2 rounded-xl bg-[#07132E]/90 border border-[#53D8FF]/20 text-xs text-[#F4F7FF] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#53D8FF]">Original Document</span>
          {numPages > 0 && (
            <span className="text-[#A7B6D4] text-[11px]">
              Page {currentPage} of {numPages}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {numPages > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg bg-[#0A1633] hover:bg-slate-800 disabled:opacity-40 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-1 rounded-lg bg-[#0A1633] hover:bg-slate-800 disabled:opacity-40 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
            </>
          )}

          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
            className="p-1 rounded-lg bg-[#0A1633] hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-[#A7B6D4] min-w-[42px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.0, Number((s + 0.1).toFixed(2))))}
            className="p-1 rounded-lg bg-[#0A1633] hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="px-2 py-1 rounded-md bg-[#0A1633] hover:bg-[#238BFF]/20 border border-[#53D8FF]/20 text-[11px] text-[#53D8FF] font-medium transition-colors"
            title="Reset to 100% Fit Width"
          >
            Fit Width
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center text-[#53D8FF] gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs">Rendering original PDF document...</span>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0A1633] border border-rose-500/30 text-rose-300 text-xs flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <p>{error}</p>
          <p className="text-[#A7B6D4] text-[11px]">
            You can still edit and preview the reconstructed resume using our professional templates.
          </p>
        </div>
      )}

      {/* Document Canvas Container with object-fit: contain, auto height, and full page visibility */}
      <div
        className="w-full flex justify-center items-start overflow-auto p-2 sm:p-4 rounded-2xl bg-slate-950/60 border border-[#53D8FF]/15 shadow-inner"
        style={{
          display: isLoading || error ? 'none' : 'flex',
          minHeight: '350px',
          objectFit: 'contain',
        }}
      >
        <div
          className="relative shadow-2xl rounded-sm bg-white overflow-hidden max-w-full flex justify-center border border-slate-300"
          style={{
            width: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
            className="block max-w-full"
          />
        </div>
      </div>
    </div>
  );
};
