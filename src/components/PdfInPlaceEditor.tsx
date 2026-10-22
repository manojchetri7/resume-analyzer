import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import type { ResumeData } from '../types';

const DISPLAY_SCALE = 96 / 72; // PDF points -> CSS px
const CANVAS_SCALE = 2; // extra sharpness for the design bitmap

interface Box { id: string; page: number; x: number; y: number; w: number; fs: number; text: string; color: string; bold: boolean; italic: boolean; family: string }
interface PageInfo { w: number; h: number; src: string }
interface Leaf { path: string; value: string; n: string }
interface Group { path: string; value: string; boxes: Box[] }
interface Item { key: string; page: number; x: number; y: number; text: string; b: Box; width?: number; lineH?: number }
export interface PdfEditorHandle { exportPdf: (filename: string) => Promise<void> }
interface Props { pdfData: string; data: ResumeData; baseData: ResumeData | null }
type RGB = [number, number, number];

const toCss = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
const dist = (a: RGB, b: RGB) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
function medoid(s: RGB[]): RGB {
  let best = s[0], bs = Infinity;
  for (const a of s) { const sc = s.reduce((t, o) => t + dist(a, o), 0); if (sc < bs) { bs = sc; best = a; } }
  return best;
}
function fontStack(f: string): string {
  if (/mono/i.test(f)) return "'Courier New', monospace";
  if (/serif/i.test(f) && !/sans/i.test(f)) return "Georgia, 'Times New Roman', serif";
  return 'Arial, Helvetica, sans-serif';
}

// ---------- form data <-> PDF text matching ----------
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function getPath(o: any, path: string): string {
  let cur = o;
  for (const k of path.split('.')) { if (cur == null) return ''; cur = cur[k]; }
  return typeof cur === 'string' ? cur : '';
}
function collectLeaves(obj: any, path: string, out: Leaf[]) {
  if (typeof obj === 'string') {
    const v = obj.trim();
    if (v.length >= 2) out.push({ path, value: v, n: norm(v) });
  } else if (Array.isArray(obj)) {
    obj.forEach((o, i) => collectLeaves(o, path ? `${path}.${i}` : `${i}`, out));
  } else if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (k === 'id' || k === 'photoUrl' || k === 'photoPosition' || k === 'photoShape') continue;
      collectLeaves(obj[k], path ? `${path}.${k}` : k, out);
    }
  }
}
const BULLET = /^[•●▪■◦·∙○\-–—*]$/;

export function buildLayout(boxes: Box[], baseData: ResumeData | null, data: ResumeData): { items: Item[]; linked: number } {
  const st = (b: Box, text = b.text): Item => ({ key: b.id, page: b.page, x: b.x, y: b.y, text, b });
  if (!baseData) return { items: boxes.map((b) => st(b)), linked: 0 };

  const leaves: Leaf[] = [];
  collectLeaves(baseData, '', leaves);
  const sorted = [...boxes].sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
  const used = new Set<string>();
  const chains: Group[] = [];

  // 1) Whole field values spread over one or more lines (name, summary, skills, ...)
  for (const l of [...leaves].filter((x) => x.n).sort((a, b) => b.n.length - a.n.length)) {
    for (const s of sorted) {
      if (used.has(s.id)) continue;
      const sn = norm(s.text);
      if (!sn || !(l.n === sn || l.n.startsWith(sn + ' '))) continue;
      const chain = [s];
      let acc = sn;
      let last = s;
      while (acc !== l.n) {
        const next = sorted.find((t) => {
          if (used.has(t.id) || chain.includes(t) || t.page !== last.page) return false;
          if (!(t.y > last.y + 1 && t.y - last.y < last.fs * 3.2 && Math.abs(t.x - last.x) < last.fs * 2.5)) return false;
          const tn = norm(t.text);
          const a2 = acc + ' ' + tn;
          return !!tn && (l.n === a2 || l.n.startsWith(a2 + ' '));
        });
        if (!next) break;
        chain.push(next);
        acc += ' ' + norm(next.text);
        last = next;
      }
      if (acc === l.n) {
        chain.forEach((c) => used.add(c.id));
        chains.push({ path: l.path, value: l.value, boxes: chain });
        break;
      }
    }
  }

  // 2) Field value sitting inside a bigger text (e.g. "Course : BCA")
  const inlines: Group[] = [];
  const stat: Box[] = [];
  for (const b of sorted) {
    if (used.has(b.id)) continue;
    const tl = b.text.toLowerCase();
    let best: Leaf | null = null;
    for (const l of leaves) {
      if (l.value.length >= 3 && tl.includes(l.value.toLowerCase()) && (!best || l.value.length > best.value.length)) best = l;
    }
    if (best) inlines.push({ path: best.path, value: best.value, boxes: [b] });
    else stat.push(b);
  }

  const items: Item[] = [];
  const hidden = new Set<string>();

  for (const g of chains) {
    const cur = getPath(data, g.path).trim();
    if (cur === g.value) { g.boxes.forEach((b) => items.push(st(b))); continue; }
    if (!cur) continue;
    const f = g.boxes[0];
    if (g.boxes.length === 1) { items.push(st(f, cur)); continue; }
    const lineH = g.boxes.length > 1 ? Math.max(f.fs, g.boxes[1].y - f.y) : f.fs * 1.25;
    items.push({ key: 'g_' + g.path, page: f.page, x: f.x, y: f.y - (lineH - f.fs) / 2, text: cur, b: f, width: Math.max(...g.boxes.map((x) => x.w)) * 1.05 + 4, lineH });
  }
  for (const g of inlines) {
    const cur = getPath(data, g.path).trim();
    const b = g.boxes[0];
    items.push(cur === g.value ? st(b) : st(b, b.text.replace(new RegExp(escapeRe(g.value), 'i'), () => cur)));
  }

  // 3) Lists: new skills / languages are added below the existing ones, removed ones disappear
  const extras: Item[] = [];
  const specs: Array<[string, string]> = [['skills', ''], ['languages', '.language']];
  for (const [key, suffix] of specs) {
    const slots: Record<number, Group> = {};
    const re = new RegExp(`^${key}\\.(\\d+)${suffix.replace('.', '\\.')}$`);
    chains.forEach((g) => { const m = g.path.match(re); if (m) slots[+m[1]] = g; });
    const idxs = Object.keys(slots).map(Number).sort((a, b) => a - b);
    if (!idxs.length || idxs[0] !== 0) continue;
    const g0 = slots[0];
    const f0 = g0.boxes[0];
    const lineH = g0.boxes.length > 1 ? Math.max(f0.fs, g0.boxes[1].y - f0.y) : f0.fs * 1.3;
    const g1 = slots[1];
    const pitch = g1 && g1.boxes[0].page === f0.page && g1.boxes[0].y > f0.y ? g1.boxes[0].y - f0.y : g0.boxes.length * lineH + f0.fs * 0.6;
    const bulletOf = (g: Group) => {
      const f = g.boxes[0];
      return stat.find((b) => b.page === f.page && BULLET.test(b.text.trim()) && Math.abs(b.y - f.y) < f.fs * 0.9 && f.x - b.x > 0 && f.x - b.x < f.fs * 3);
    };
    idxs.forEach((i) => {
      if (!getPath(data, `${key}.${i}${suffix}`).trim()) { const bl = bulletOf(slots[i]); if (bl) hidden.add(bl.id); }
    });
    const bullet0 = bulletOf(g0);
    const arr: any[] = (data as any)[key] || [];
    for (let i = idxs[idxs.length - 1] + 1; i < arr.length; i++) {
      const t = getPath(data, `${key}.${i}${suffix}`).trim();
      if (!t) continue;
      const multi = g0.boxes.length > 1;
      extras.push({ key: `x_${key}_${i}`, page: f0.page, x: f0.x, y: (multi ? f0.y - (lineH - f0.fs) / 2 : f0.y) + i * pitch, text: t, b: f0, width: multi ? Math.max(...g0.boxes.map((x) => x.w)) * 1.05 + 4 : undefined, lineH: multi ? lineH : undefined });
      if (bullet0) extras.push({ key: `xb_${key}_${i}`, page: f0.page, x: bullet0.x, y: bullet0.y + i * pitch, text: bullet0.text, b: bullet0 });
    }
  }

  stat.forEach((b) => { if (!hidden.has(b.id)) items.push(st(b)); });
  return { items: [...items, ...extras], linked: chains.length + inlines.length };
}

export const PdfInPlaceEditor = forwardRef<PdfEditorHandle, Props>(function PdfInPlaceEditor({ pdfData, data, baseData }, handleRef) {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fit, setFit] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Render the PDF, erase its text from the bitmap and keep every text line as a box
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const pdfjs: any = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
        const bin = atob(pdfData.split(',')[1] || '');
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const pdf = await pdfjs.getDocument({ data: bytes, cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`, cMapPacked: true }).promise;

        const outPages: PageInfo[] = [];
        const outBoxes: Box[] = [];
        const k = CANVAS_SCALE;

        for (let p = 0; p < pdf.numPages; p++) {
          const page = await pdf.getPage(p + 1);
          const vp = page.getViewport({ scale: DISPLAY_SCALE });
          const cvs = document.createElement('canvas');
          cvs.width = Math.floor(vp.width * k);
          cvs.height = Math.floor(vp.height * k);
          const ctx = cvs.getContext('2d', { willReadFrequently: true })!;
          await page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: DISPLAY_SCALE * k }) }).promise;
          if (cancelled) return;

          const tc = await page.getTextContent();
          const raw: any[] = [];
          for (const it of tc.items as any[]) {
            if (typeof it.str !== 'string' || !it.str.trim()) continue;
            const t = pdfjs.Util.transform(vp.transform, it.transform);
            let fname = '';
            try { fname = page.commonObjs.get(it.fontName)?.name || ''; } catch { /* ignore */ }
            raw.push({ str: it.str, x: t[4], base: t[5], w: it.width * DISPLAY_SCALE, fs: Math.hypot(t[2], t[3]), fname, family: tc.styles?.[it.fontName]?.fontFamily || 'sans-serif' });
          }
          raw.sort((a, b) => (Math.abs(a.base - b.base) < 2 ? a.x - b.x : a.base - b.base));

          const merged: any[] = [];
          for (const it of raw) {
            const prev = merged[merged.length - 1];
            const gap = prev ? it.x - (prev.x + prev.w) : 0;
            if (prev && Math.abs(prev.base - it.base) < 2 && Math.abs(prev.fs - it.fs) < 1 && gap < it.fs * 0.35 && it.x >= prev.x) {
              prev.str += (gap > it.fs * 0.12 ? ' ' : '') + it.str;
              prev.w = it.x + it.w - prev.x;
            } else merged.push({ ...it });
          }

          const img = ctx.getImageData(0, 0, cvs.width, cvs.height);
          const px = (x: number, y: number): RGB => {
            const xi = Math.min(cvs.width - 1, Math.max(0, Math.round(x * k)));
            const yi = Math.min(cvs.height - 1, Math.max(0, Math.round(y * k)));
            const i = (yi * cvs.width + xi) * 4;
            return [img.data[i], img.data[i + 1], img.data[i + 2]];
          };

          merged.forEach((it, idx) => {
            const bx = it.x - 1, by = it.base - it.fs * 0.95, bw = it.w + 2, bh = it.fs * 1.3;
            const bg = medoid([px(bx - 3, by + bh / 2), px(bx + bw + 3, by + bh / 2), px(bx + bw / 2, by - 2), px(bx + bw / 2, by + bh + 2)]);
            let fg: RGB = [20, 20, 20];
            let far = 0;
            for (let yy = by; yy < by + bh; yy += 1.5) {
              for (let xx = bx; xx < bx + bw; xx += 1.5) {
                const c = px(xx, yy);
                const d = dist(c, bg);
                if (d > far) { far = d; fg = c; }
              }
            }
            ctx.fillStyle = toCss(bg);
            ctx.fillRect(bx * k, by * k, bw * k, bh * k);
            outBoxes.push({
              id: `p${p}_${idx}`, page: p, x: it.x, y: it.base - it.fs * 0.85, w: it.w, fs: it.fs, text: it.str,
              color: far > 60 ? toCss(fg) : '#111111',
              bold: /bold|black|heavy|semibold/i.test(it.fname),
              italic: /italic|oblique/i.test(it.fname),
              family: it.family,
            });
          });
          outPages.push({ w: vp.width, h: vp.height, src: cvs.toDataURL('image/jpeg', 0.92) });
        }
        if (!cancelled) { setPages(outPages); setBoxes(outBoxes); setLoading(false); }
      } catch (err: any) {
        if (!cancelled) { console.error('PDF design error:', err); setError(err?.message || 'Unable to open this PDF.'); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [pdfData]);

  useEffect(() => {
    if (!wrapRef.current || pages.length === 0) return;
    const el = wrapRef.current;
    const update = () => { const avail = el.clientWidth - 8; if (avail > 100) setFit(Math.min(1, avail / pages[0].w)); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pages]);

  const { items, linked } = useMemo(() => buildLayout(boxes, baseData, data), [boxes, baseData, data]);

  useImperativeHandle(handleRef, () => ({
    exportPdf: async (filename: string) => {
      if (exportRef.current) await downloadElementAsPdf({ element: exportRef.current, filename });
    },
  }), []);

  const totalH = pages.reduce((s, p) => s + p.h, 0);

  return (
    <div ref={wrapRef} className="w-full flex flex-col items-center">
      <div className="w-full mb-3 px-3 py-2 rounded-xl bg-[#07132E]/90 border border-[#53D8FF]/20 text-[11px] text-[#A7B6D4]">
        {!baseData
          ? 'Resume fields read ho rahe hain... thoda ruko'
          : linked > 0
          ? `Left form mein jo badlo, wo isi original design mein dikhega (${linked} fields linked)`
          : 'Is PDF ke fields design se link nahi ho paye. Reconstructed view use karo.'}
      </div>

      {loading && (
        <div className="py-24 flex flex-col items-center gap-3 text-[#53D8FF]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs">Preparing original design...</span>
        </div>
      )}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0A1633] border border-rose-500/30 text-rose-300 text-xs flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {pages.length > 0 && (
        <div style={{ width: pages[0].w * fit, height: totalH * fit, position: 'relative' }} className="shadow-2xl">
          <div ref={exportRef} style={{ position: 'absolute', left: 0, top: 0, width: pages[0].w, transform: `scale(${fit})`, transformOrigin: 'top left', background: '#fff' }}>
            {pages.map((pg, pi) => (
              <div key={pi} style={{ position: 'relative', width: pg.w, height: pg.h, overflow: 'hidden' }}>
                <img src={pg.src} width={pg.w} height={pg.h} alt="" draggable={false} style={{ display: 'block' }} />
                {items.filter((it) => it.page === pi).map((it) => (
                  <div
                    key={it.key}
                    style={{
                      position: 'absolute', left: it.x, top: it.y, width: it.width, fontSize: it.b.fs,
                      lineHeight: it.lineH ? `${it.lineH}px` : 1,
                      whiteSpace: it.width ? 'normal' : 'pre', overflowWrap: 'anywhere',
                      color: it.b.color, fontFamily: fontStack(it.b.family),
                      fontWeight: it.b.bold ? 700 : 400, fontStyle: it.b.italic ? 'italic' : 'normal',
                    }}
                  >
                    {it.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});