import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GeneratePdfOptions {
  element: HTMLElement;
  filename?: string;
  onProgress?: (status: string) => void;
}

// ============================================================================
// 1. MATHEMATICAL & BROWSER COLOR SANITIZERS (OKLCH / OKLAB / LAB / LCH -> RGB)
// ============================================================================

/**
 * Accurately converts an OKLCH color string into a standard rgb(...) or rgba(...) string
 * based on the W3C CSS Color Module Level 4 specification.
 */
export function oklchToRgb(
  lRaw: string | number,
  cRaw: string | number,
  hRaw: string | number,
  aRaw?: string | number
): string {
  let l = typeof lRaw === 'string' && lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(String(lRaw));
  if (isNaN(l)) l = 0;

  let c = 0;
  if (cRaw !== 'none') {
    const cStr = String(cRaw);
    c = cStr.endsWith('%') ? (parseFloat(cStr) / 100) * 0.4 : parseFloat(cStr);
  }
  if (isNaN(c)) c = 0;

  let h = 0;
  if (hRaw !== 'none') {
    const hStr = String(hRaw);
    if (hStr.endsWith('deg')) h = parseFloat(hStr);
    else if (hStr.endsWith('rad')) h = (parseFloat(hStr) * 180) / Math.PI;
    else if (hStr.endsWith('turn')) h = parseFloat(hStr) * 360;
    else h = parseFloat(hStr);
  }
  if (isNaN(h)) h = 0;

  let alpha = 1;
  if (aRaw !== undefined && aRaw !== null) {
    const aStr = String(aRaw);
    alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
  }
  if (isNaN(alpha)) alpha = 1;

  // OKLCH -> OKLAB coordinates
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLAB -> Linear sRGB cone responses
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lLin = l_ * l_ * l_;
  const mLin = m_ * m_ * m_;
  const sLin = s_ * s_ * s_;

  const rLin = +4.0767416621 * lLin - 3.3077115913 * mLin + 0.2309699292 * sLin;
  const gLin = -1.2684380046 * lLin + 2.6097574011 * mLin - 0.3413193965 * sLin;
  const bLin = -0.0041960863 * lLin - 0.7034186147 * mLin + 1.7076147010 * sLin;

  // sRGB transfer function (gamma companding)
  const toSrgb = (val: number): number => {
    val = Math.max(0, Math.min(1, val));
    return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const r = Math.round(Math.max(0, Math.min(255, toSrgb(rLin) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, toSrgb(gLin) * 255)));
  const bVal = Math.round(Math.max(0, Math.min(255, toSrgb(bLin) * 255)));

  if (alpha < 0.999) {
    const formattedAlpha = Math.round(alpha * 1000) / 1000;
    return `rgba(${r}, ${g}, ${bVal}, ${formattedAlpha})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

/**
 * Fallback browser canvas color resolver: draws a 1x1 pixel on an offscreen canvas
 * to convert any modern CSS color string supported by the host browser engine into RGB/RGBA.
 */
let cachedCanvasCtx: CanvasRenderingContext2D | null = null;
function browserColorToRgb(colorStr: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    if (!cachedCanvasCtx) {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      cachedCanvasCtx = c.getContext('2d', { willReadFrequently: true });
    }
    if (!cachedCanvasCtx) return null;

    cachedCanvasCtx.clearRect(0, 0, 1, 1);
    cachedCanvasCtx.fillStyle = '#000000';
    cachedCanvasCtx.fillStyle = colorStr;

    // If canvas directly formatted it to rgb/hex/rgba
    const fill = cachedCanvasCtx.fillStyle;
    if (typeof fill === 'string' && !fill.includes('oklch') && !fill.includes('oklab')) {
      if (fill.startsWith('#') || fill.startsWith('rgb')) {
        return fill;
      }
    }

    // Read pixel data
    cachedCanvasCtx.fillRect(0, 0, 1, 1);
    const imgData = cachedCanvasCtx.getImageData(0, 0, 1, 1).data;
    const r = imgData[0];
    const g = imgData[1];
    const b = imgData[2];
    const a = imgData[3];

    if (a === 255) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    const alphaFormatted = Math.round((a / 255) * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alphaFormatted})`;
  } catch {
    return null;
  }
}

/**
 * Converts all oklch(...) expressions inside a CSS text block to rgb/rgba.
 */
export function sanitizeCssText(cssText: string): string {
  if (!cssText || typeof cssText !== 'string' || !cssText.includes('oklch')) {
    return cssText;
  }

  // Matches oklch(L C H [ / A ])
  const oklchRegex = /oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?|none)\s+([0-9.]+(?:deg|rad|turn)?|none)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi;

  return cssText.replace(oklchRegex, (_match, l, c, h, a) => {
    try {
      return oklchToRgb(l, c, h, a);
    } catch {
      return browserColorToRgb(_match) || '#0f172a';
    }
  });
}

/**
 * List of CSS properties checked for color values
 */
const COLOR_PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-shadow',
];

/**
 * Sanitizes all elements in an element subtree by resolving any oklch() color property
 * to a concrete RGB/RGBA value directly on el.style.
 */
function sanitizeElementTreeColors(rootEl: HTMLElement, win: Window = window) {
  try {
    const allEls = [rootEl, ...Array.from(rootEl.querySelectorAll('*'))] as HTMLElement[];

    for (const el of allEls) {
      // 1. Sanitize existing inline style attribute
      const inlineStyle = el.getAttribute('style');
      if (inlineStyle && inlineStyle.includes('oklch')) {
        el.setAttribute('style', sanitizeCssText(inlineStyle));
      }

      // 2. Check computed styles
      try {
        const computed = win.getComputedStyle(el);
        for (const prop of COLOR_PROPERTIES) {
          const val = computed.getPropertyValue(prop);
          if (val && val.includes('oklch')) {
            const sanitized = sanitizeCssText(val);
            if (sanitized && sanitized !== val) {
              el.style.setProperty(prop, sanitized, 'important');
            }
          }
        }
      } catch {
        // Continue if getComputedStyle throws on detached SVG nodes
      }
    }
  } catch (err) {
    console.warn('Error during element tree color sanitization:', err);
  }
}

// ============================================================================
// 2. DIRECT CLIENT-SIDE PDF GENERATOR
// ============================================================================

/**
 * Generates and triggers a direct PDF file download in the browser.
 * - Does not trigger window.print() or browser print preview dialog.
 * - Converts any unsupported modern CSS color function (like oklch) into RGB/RGBA
 *   prior to and during html2canvas rasterization without affecting the rest of the website.
 * - Renders high-resolution raster pages mapped to ISO standard A4 dimensions.
 * - Handles multi-page documents without content cutoff or overlap.
 */
export async function downloadElementAsPdf({
  element,
  filename = 'Resume.pdf',
  onProgress,
}: GeneratePdfOptions): Promise<void> {
  if (!element) {
    throw new Error('Target element to export as PDF was not provided.');
  }

  onProgress?.('Preparing document for PDF export...');

  // 1. Create an offscreen isolated clone to capture unscaled at 100% resolution (A4 width: 794px)
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'resume-export-clone';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = '794px'; // 210mm at 96 DPI
  clone.style.minHeight = '1123px'; // 297mm at 96 DPI
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.zIndex = '-9999';
  clone.style.backgroundColor = '#ffffff';

  // Sanitize the clone tree before mounting
  sanitizeElementTreeColors(clone, window);

  document.body.appendChild(clone);

  try {
    onProgress?.('Normalizing document styles for PDF engine...');

    // Wait for DOM and fonts inside clone to settle
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Run a second pass once mounted so any inherited styles are sanitized
    sanitizeElementTreeColors(clone, window);

    onProgress?.('Rendering high-resolution vector layout...');

    // Render canvas via html2canvas with onclone hook to sanitize stylesheets and cloned iframe DOM
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        try {
          // 1. Sanitize all <style> elements in the cloned document iframe
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
              styleTag.textContent = sanitizeCssText(styleTag.textContent);
            }
          });

          // 2. Sanitize all elements in the cloned document
          const iframeWin = clonedDoc.defaultView || window;
          if (clonedElement) {
            sanitizeElementTreeColors(clonedElement, iframeWin);
          }
          if (clonedDoc.body) {
            sanitizeElementTreeColors(clonedDoc.body, iframeWin);
          }
        } catch (cloneErr) {
          console.warn('Warning during html2canvas onclone normalization:', cloneErr);
        }
      },
    });

    onProgress?.('Compiling A4 PDF pages...');

    // A4 dimensions in millimeters
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // Convert pixel measurements to PDF millimeters
    const imgWidthMm = a4WidthMm;
    const imgHeightMm = (canvas.height * a4WidthMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Check if single page fits (allow small tolerance of 3mm to prevent trivial second blank page)
    if (imgHeightMm <= a4HeightMm + 3) {
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
    } else {
      // Multi-page slicing: generate page by page from the master high-res canvas
      const pxPageHeight = Math.floor((canvas.width * a4HeightMm) / a4WidthMm);
      const totalPages = Math.ceil(canvas.height / pxPageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sourceY = page * pxPageHeight;
        const currentSliceHeight = Math.min(pxPageHeight, canvas.height - sourceY);

        // Render page slice onto temporary canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pxPageHeight;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );

          const pageData = pageCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(pageData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm);
        }
      }
    }

    onProgress?.('Downloading PDF file...');

    // Save and download directly without print preview dialog
    pdf.save(filename);
  } finally {
    // Guaranteed cleanup of temporary offscreen DOM node
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}
