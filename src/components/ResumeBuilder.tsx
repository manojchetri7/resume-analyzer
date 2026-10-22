import React, { useState, useRef } from 'react';
import { ResumeData } from '../types';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import PdfInPlaceEditor, { PdfEditorHandle } from './PdfInPlaceEditor';
import AiResumeEditor from './AiResumeEditor';
import { INITIAL_EMPTY_RESUME } from '../data/starterResume';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import { Download, Eye, Edit3, Sparkles, Upload, Trash2 } from 'lucide-react';

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_EMPTY_RESUME);
  const [history, setHistory] = useState<ResumeData[]>([]);
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string | null>(null);
  const [pdfBaseData, setPdfBaseData] = useState<ResumeData | null>(null);
  const [previewMode, setPreviewMode] = useState<'original' | 'reconstructed'>('reconstructed');
  const [isParsing, setIsParsing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const pdfEditorRef = useRef<PdfEditorHandle>(null);
  const reconstructedRef = useRef<HTMLDivElement>(null);

  const handleUpdateResume = (newData: ResumeData) => {
    setHistory((prev) => [...prev, resumeData]);
    setResumeData(newData);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setResumeData(previous);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Kripya sirf PDF file upload karein.');
      return;
    }

    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setUploadedPdfBase64(base64);

        // API Call to parse resume details
        try {
          const res = await fetch('/api/parse-resume-to-builder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfBase64: base64 }),
          });

          if (res.ok) {
            const parsedData: ResumeData = await res.json();
            setPdfBaseData(parsedData);
            setResumeData(parsedData);
            setPreviewMode('original');
          } else {
            console.error('PDF parsing server error');
            setPreviewMode('original');
          }
        } catch (err) {
          console.error('Error contacting parse endpoint:', err);
          setPreviewMode('original');
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      setIsParsing(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('Kya aap saara data clear karna chahte hain?')) {
      setResumeData(INITIAL_EMPTY_RESUME);
      setUploadedPdfBase64(null);
      setPdfBaseData(null);
      setPreviewMode('reconstructed');
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const fileName = `${resumeData.contact.fullName || 'Resume'}_CosmicCareer.pdf`;
      if (previewMode === 'original' && uploadedPdfBase64 && pdfEditorRef.current) {
        await pdfEditorRef.current.exportPdf(fileName);
      } else if (reconstructedRef.current) {
        await downloadElementAsPdf({
          element: reconstructedRef.current,
          filename: fileName,
        });
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('PDF download karne mein samasya aayi. Kripya dubara koshish karein.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Cosmic Career AI Builder
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* File Upload Button */}
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-slate-700">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{isParsing ? 'Uploading & Reading...' : 'Upload Template PDF'}</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* View Mode Tabs */}
          {uploadedPdfBase64 && (
            <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setPreviewMode('original')}
                className={`px-3 py-1 rounded-md transition ${
                  previewMode === 'original' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original PDF
              </button>
              <button
                onClick={() => setPreviewMode('reconstructed')}
                className={`px-3 py-1 rounded-md transition ${
                  previewMode === 'reconstructed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reconstructed
              </button>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearAll}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            title="Clear Data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace split into 2 scrollable areas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Controls + AI Box */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto space-y-6 border-r border-slate-800 bg-slate-900">
          <AiResumeEditor
            currentData={resumeData}
            onApplyChanges={handleUpdateResume}
            onUndo={handleUndo}
            canUndo={history.length > 0}
          />

          <ResumeForm data={resumeData} onChange={handleUpdateResume} />
        </div>

        {/* Right Side: Visual Preview */}
        <div className="w-full lg:w-1/2 bg-slate-950 p-4 lg:p-6 overflow-y-auto flex flex-col items-center justify-start">
          {previewMode === 'original' && uploadedPdfBase64 ? (
            <PdfInPlaceEditor
              ref={pdfEditorRef}
              pdfData={uploadedPdfBase64}
              data={resumeData}
              baseData={pdfBaseData}
            />
          ) : (
            <div ref={reconstructedRef} className="w-full max-w-[800px] bg-white text-slate-900 rounded-lg shadow-xl overflow-hidden">
              <ResumePreview data={resumeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}