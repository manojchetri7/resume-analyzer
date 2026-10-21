import React, { useState, useRef, useEffect } from 'react';
import {
  ResumeData,
  ResumeStyling,
  ResumeTemplateId,
} from '../types';
import { ResumePreview } from './ResumePreview';
import { ResumeForm } from './ResumeForm';
import { AiResumeEditor } from './AiResumeEditor';
import { PdfViewer } from './PdfViewer';
import { PhotoCropModal } from './PhotoCropModal';
import { INITIAL_EMPTY_RESUME } from '../data/starterResume';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import {
  Download,
  Upload,
  Sparkles,
  Palette,
  Eye,
  Edit3,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  FileCode,
  Layers,
} from 'lucide-react';

interface ResumeBuilderProps {
  sharedResumeText?: string;
  sharedResumeName?: string;
  onSendToChat?: (resumeText: string, contextNote?: string) => void;
  onNavigateToAnalyzer?: () => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  sharedResumeText,
  sharedResumeName,
  onNavigateToAnalyzer,
}) => {
  // Resume Data State: Pristine empty state, zero hardcoded demo data
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_EMPTY_RESUME);

  // Resume Styling State
  const [styling, setStyling] = useState<ResumeStyling>({
    template: 'modern',
    accentColor: '#238BFF',
    fontFamily: 'inter',
    fontSize: 'normal',
    spacing: 'normal',
    sectionOrder: [
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'achievements',
      'languages',
    ],
  });

  // Uploaded Original PDF File Data & Mode
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  // View mode for the preview pane: 'original' (PDF.js viewer) or 'reconstructed' (editable live preview)
  const [previewMode, setPreviewMode] = useState<'reconstructed' | 'original'>('reconstructed');

  // Photo Cropper Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawPhotoForCrop, setRawPhotoForCrop] = useState<string | null>(null);

  // Mobile Active Tab (Edit vs Preview)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Preview Scale
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

  // Parsing & Download States
  const [isParsing, setIsParsing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Auto-fit zoom on window resize or container measurement
  const handleAutoFitZoom = () => {
    if (previewContainerRef.current) {
      const available = previewContainerRef.current.clientWidth - 40;
      if (available > 250) {
        const fit = Math.min(1.0, Math.max(0.4, Number((available / 794).toFixed(2))));
        setPreviewZoom(fit);
        return;
      }
    }
    if (window.innerWidth < 1024) {
      setPreviewZoom(0.65);
    } else if (window.innerWidth < 1440) {
      setPreviewZoom(0.78);
    } else {
      setPreviewZoom(0.92);
    }
  };

  useEffect(() => {
    handleAutoFitZoom();
    window.addEventListener('resize', handleAutoFitZoom);
    return () => window.removeEventListener('resize', handleAutoFitZoom);
  }, []);

  // Preset Colors
  const accentColors = [
    { name: 'Cosmic Blue', hex: '#238BFF' },
    { name: 'Stellar Purple', hex: '#7657FF' },
    { name: 'Electric Cyan', hex: '#06B6D4' },
    { name: 'Emerald Mint', hex: '#059669' },
    { name: 'Coral Rose', hex: '#E11D48' },
    { name: 'Deep Slate', hex: '#1E293B' },
  ];

  // Preset Templates
  const templates: Array<{ id: ResumeTemplateId; name: string; desc: string }> = [
    { id: 'modern', name: 'Modern', desc: 'Vibrant accents with sleek badge tags' },
    { id: 'classic', name: 'Classic', desc: 'Traditional Ivy-league editorial format' },
    { id: 'executive', name: 'Executive', desc: 'Dark header, crisp grid layout & premium typography' },
    { id: 'professional', name: 'Professional', desc: 'Executive sidebar stripe accent' },
    { id: 'minimal', name: 'Minimal', desc: 'Crisp whitespace and clean headings' },
  ];

  // ============================================
  // 1. PDF UPLOAD, ORIGINAL PREVIEW & STRUCTURED PARSING
  // ============================================
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setStatusMessage({
        type: 'error',
        text: 'Please upload a PDF document (.pdf format).',
      });
      return;
    }

    setIsParsing(true);
    setStatusMessage({
      type: 'info',
      text: `Reading "${file.name}" and extracting structured fields with Gemini AI...`,
    });

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string) || '';

        // Store original PDF base64 immediately for faithful visual rendering
        setUploadedPdfBase64(base64Data);
        setUploadedPdfName(file.name);
        // Switch preview to show original PDF immediately so user sees original layout
        setPreviewMode('original');

        const response = await fetch('/api/parse-resume-to-builder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeBase64: base64Data,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse resume.');
        }

        if (data.resumeData) {
          // Merge safely with structure defaults
          const parsed: ResumeData = {
            contact: {
              ...INITIAL_EMPTY_RESUME.contact,
              ...data.resumeData.contact,
              fullName: data.resumeData.contact?.fullName || '',
            },
            professionalSummary: data.resumeData.professionalSummary || '',
            education: Array.isArray(data.resumeData.education) ? data.resumeData.education : [],
            skills: Array.isArray(data.resumeData.skills) ? data.resumeData.skills : [],
            experience: Array.isArray(data.resumeData.experience) ? data.resumeData.experience : [],
            projects: Array.isArray(data.resumeData.projects) ? data.resumeData.projects : [],
            certifications: Array.isArray(data.resumeData.certifications)
              ? data.resumeData.certifications
              : [],
            achievements: Array.isArray(data.resumeData.achievements)
              ? data.resumeData.achievements
              : [],
            languages: Array.isArray(data.resumeData.languages) ? data.resumeData.languages : [],
          };

          setResumeData(parsed);
          setStatusMessage({
            type: 'success',
            text: `Successfully parsed "${file.name}"! Showing original visual preview. Switch to Reconstructed View to edit and customize templates.`,
          });
        }
      } catch (err: any) {
        console.error('PDF parsing error:', err);
        setStatusMessage({
          type: 'error',
          text: err.message || 'Unable to parse resume PDF. Original document view is still available, or enter details manually.',
        });
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Convert currently loaded text from ResumeAnalyzer if user already uploaded in Analyzer
  const handleLoadFromSharedText = async () => {
    if (!sharedResumeText) return;
    setIsParsing(true);
    setStatusMessage({
      type: 'info',
      text: 'Structuring resume from current session...',
    });

    try {
      const response = await fetch('/api/parse-resume-to-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: sharedResumeText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse text.');
      }

      if (data.resumeData) {
        setResumeData({
          contact: {
            ...INITIAL_EMPTY_RESUME.contact,
            ...data.resumeData.contact,
          },
          professionalSummary: data.resumeData.professionalSummary || '',
          education: data.resumeData.education || [],
          skills: data.resumeData.skills || [],
          experience: data.resumeData.experience || [],
          projects: data.resumeData.projects || [],
          certifications: data.resumeData.certifications || [],
          achievements: data.resumeData.achievements || [],
          languages: data.resumeData.languages || [],
        });
        setPreviewMode('reconstructed');
        setStatusMessage({
          type: 'success',
          text: 'Loaded and structured resume from current session!',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to parse shared resume text.',
      });
    } finally {
      setIsParsing(false);
    }
  };

  // ============================================
  // 2. PROFILE PHOTO UPLOAD WITH CROPPING
  // ============================================
  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please select a valid image file (JPG, PNG, WebP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Open crop editor modal first before applying
      setRawPhotoForCrop(base64);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = (croppedBase64: string) => {
    setResumeData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        photoUrl: croppedBase64,
        showPhoto: true,
      },
    }));
    setCropModalOpen(false);
    setStatusMessage({
      type: 'success',
      text: 'Profile photo cropped and applied to resume preview.',
    });
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
  };

  const handleOpenCropModalForExisting = () => {
    if (resumeData.contact.photoUrl) {
      setRawPhotoForCrop(resumeData.contact.photoUrl);
      setCropModalOpen(true);
    }
  };

  const handleRemovePhoto = () => {
    setResumeData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        photoUrl: '',
        showPhoto: false,
      },
    }));
  };

  // ============================================
  // 3. DIRECT CLIENT-SIDE PDF DOWNLOAD
  // ============================================
  const handleDownloadPdf = async () => {
    // Prevent duplicate downloads if one is already in flight
    if (isExportingPdf) return;

    // If currently viewing original PDF and element is not rendered, switch to reconstructed to export
    if (previewMode === 'original') {
      setPreviewMode('reconstructed');
      // Give a tick for DOM to mount
      await new Promise((r) => setTimeout(r, 60));
    }

    const element = document.getElementById('resume-export-target');
    if (!element) {
      setStatusMessage({
        type: 'error',
        text: 'Resume preview element not found for export. Please make sure Reconstructed View is visible.',
      });
      return;
    }

    setIsExportingPdf(true);
    const candidateName =
      (resumeData.contact.fullName || 'Candidate')
        .trim()
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
        .replace(/\s+/g, '_') || 'My';
    const filename = `${candidateName}_Resume.pdf`;

    setStatusMessage({
      type: 'info',
      text: `Preparing high-resolution PDF (${filename})...`,
    });

    try {
      await downloadElementAsPdf({
        element,
        filename,
        onProgress: (statusText) => {
          setStatusMessage({
            type: 'info',
            text: statusText,
          });
        },
      });

      setStatusMessage({
        type: 'success',
        text: `Downloaded ${filename} successfully! All editor features remain active.`,
      });
    } catch (err: any) {
      console.error('Direct PDF export error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to download PDF. Please check your browser permissions.',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all resume fields to start completely from scratch?')) {
      setResumeData(INITIAL_EMPTY_RESUME);
      setUploadedPdfBase64(null);
      setUploadedPdfName(null);
      setPreviewMode('reconstructed');
      setStatusMessage({
        type: 'info',
        text: 'Cleared all resume fields.',
      });
    }
  };

  const isResumeEmpty =
    !resumeData.contact.fullName?.trim() &&
    !resumeData.contact.jobTitle?.trim() &&
    !resumeData.contact.email?.trim() &&
    !resumeData.contact.phone?.trim() &&
    !resumeData.contact.location?.trim() &&
    !resumeData.professionalSummary?.trim() &&
    (!resumeData.education || resumeData.education.length === 0) &&
    (!resumeData.skills || resumeData.skills.length === 0) &&
    (!resumeData.experience || resumeData.experience.length === 0) &&
    (!resumeData.projects || resumeData.projects.length === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* PHOTO CROPPER MODAL */}
      {cropModalOpen && rawPhotoForCrop && (
        <PhotoCropModal
          imageSrc={rawPhotoForCrop}
          isOpen={cropModalOpen}
          onConfirm={handleConfirmCrop}
          onCancel={handleCancelCrop}
        />
      )}

      {/* HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#07132E] via-[#0A1633] to-[#07132E] border border-[#53D8FF]/20 shadow-[0_0_50px_rgba(35,139,255,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#238BFF]/15 border border-[#53D8FF]/30 text-[#53D8FF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Resume Editor & Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F4F7FF] tracking-tight">
              Build & Perfect Your <span className="text-[#53D8FF]">Resume</span>
            </h1>
            <p className="text-sm text-[#A7B6D4] max-w-2xl leading-relaxed">
              Upload any PDF resume to inspect the original design, parse it into structured editable fields, customize professional
              templates, crop your photo, command Gemini with natural language, and export directly to clean PDF.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isParsing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(35,139,255,0.4)] transition-all disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Resume...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Parse PDF</span>
                </>
              )}
            </button>
            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {sharedResumeText && (
              <button
                type="button"
                onClick={handleLoadFromSharedText}
                disabled={isParsing}
                className="px-3.5 py-2.5 rounded-xl bg-[#07132E] hover:bg-[#0A1633] border border-[#53D8FF]/30 text-[#53D8FF] text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Load resume text already analyzed in current session"
              >
                <FileCheck className="w-4 h-4" />
                <span>Load from Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-[#0A1633] border-[#53D8FF]/30 text-[#53D8FF]'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* MOBILE EDIT / PREVIEW TOGGLE TABS */}
      <div className="flex lg:hidden rounded-xl p-1 bg-[#07132E] border border-[#53D8FF]/20">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'edit'
              ? 'bg-[#238BFF] text-white shadow-sm'
              : 'text-[#A7B6D4] hover:text-[#F4F7FF]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor & AI Tools</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'preview'
              ? 'bg-[#238BFF] text-white shadow-sm'
              : 'text-[#A7B6D4] hover:text-[#F4F7FF]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Resume Preview</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT EDITOR & RIGHT LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS, AI PROMPT, & EDITABLE FORM */}
        <div
          className={`space-y-6 lg:col-span-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* GET STARTED BANNER (When no resume is uploaded/entered yet) */}
          {isResumeEmpty && !uploadedPdfBase64 && (
            <div className="rounded-2xl p-6 border border-dashed border-[#53D8FF]/40 bg-gradient-to-br from-[#07132E]/90 via-[#0A1633]/80 to-[#07132E]/90 text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#238BFF]/20 border border-[#53D8FF]/30 flex items-center justify-center mx-auto text-[#53D8FF]">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#F4F7FF]">
                  Upload your resume PDF to get started.
                </h3>
                <p className="text-xs text-[#A7B6D4] max-w-md mx-auto leading-relaxed">
                  Upload an existing resume PDF to automatically populate your information, or begin typing your details directly into the form fields below.
                </p>
              </div>
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(35,139,255,0.4)] transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Resume PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. NATURAL LANGUAGE AI INSTRUCTION BOX */}
          <AiResumeEditor
            currentResume={resumeData}
            onApplyChanges={(updated) => {
              setResumeData(updated);
              setPreviewMode('reconstructed');
              setStatusMessage({
                type: 'success',
                text: 'AI changes applied to resume fields. Review them below or customize further.',
              });
            }}
          />

          {/* 2. TEMPLATE, PALETTE & STYLING BAR */}
          <div className="cosmic-card rounded-2xl p-5 border border-[#53D8FF]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#53D8FF]" />
                <h3 className="font-bold text-sm text-[#F4F7FF]">Resume Styling & Templates</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-[#A7B6D4] hover:text-rose-400 flex items-center gap-1 transition-colors"
                  title="Clear all resume fields to start completely from scratch"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Form</span>
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setStyling((prev) => ({ ...prev, template: tpl.id }));
                    setPreviewMode('reconstructed');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    styling.template === tpl.id && previewMode === 'reconstructed'
                      ? 'bg-[#0A1633] border-[#53D8FF] shadow-[0_0_15px_rgba(83,216,255,0.2)]'
                      : 'bg-[#07132E]/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold text-xs text-[#F4F7FF]">{tpl.name}</span>
                  <span className="block text-[10px] text-[#A7B6D4] mt-0.5 truncate">{tpl.desc}</span>
                </button>
              ))}
            </div>

            {/* Accent Color Chooser */}
            <div>
              <label className="block text-xs font-medium text-[#A7B6D4] mb-2">Accent Color</label>
              <div className="flex flex-wrap items-center gap-2.5">
                {accentColors.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setStyling((prev) => ({ ...prev, accentColor: color.hex }));
                      setPreviewMode('reconstructed');
                    }}
                    style={{ backgroundColor: color.hex }}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      styling.accentColor === color.hex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#07132E] scale-110'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    {styling.accentColor === color.hex && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Spacing */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#A7B6D4] mb-1">Font Family</label>
                <select
                  value={styling.fontFamily}
                  onChange={(e) => {
                    setStyling((prev) => ({
                      ...prev,
                      fontFamily: e.target.value as any,
                    }));
                    setPreviewMode('reconstructed');
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF]"
                >
                  <option value="inter">Modern Sans</option>
                  <option value="merriweather">Editorial Serif</option>
                  <option value="roboto-mono">Technical Mono</option>
                  <option value="outfit">Outfit Display</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A7B6D4] mb-1">Density</label>
                <select
                  value={styling.spacing}
                  onChange={(e) => {
                    setStyling((prev) => ({
                      ...prev,
                      spacing: e.target.value as any,
                    }));
                    setPreviewMode('reconstructed');
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF]"
                >
                  <option value="tight">Tight (1 Page Fit)</option>
                  <option value="normal">Standard</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A7B6D4] mb-1">Font Size</label>
                <select
                  value={styling.fontSize}
                  onChange={(e) => {
                    setStyling((prev) => ({
                      ...prev,
                      fontSize: e.target.value as any,
                    }));
                    setPreviewMode('reconstructed');
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF]"
                >
                  <option value="compact">Compact (Fit)</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. FULL EDITABLE FORM */}
          <ResumeForm
            data={resumeData}
            onChange={(updated) => {
              setResumeData(updated);
              // Switch to reconstructed preview so edits are visible immediately
              setPreviewMode('reconstructed');
            }}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={handleRemovePhoto}
            onOpenCropEditor={handleOpenCropModalForExisting}
          />
        </div>

        {/* RIGHT COLUMN: LIVE RESUME PREVIEW & EXPORT ACTIONS */}
        <div
          className={`space-y-4 lg:col-span-6 lg:sticky lg:top-24 ${
            mobileTab === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* PREVIEW TOOLBAR & VIEW MODE TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#07132E]/90 border border-[#53D8FF]/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#53D8FF]" />

              {/* View Switcher: Original Document vs Reconstructed Editable Template */}
              {uploadedPdfBase64 ? (
                <div className="flex items-center p-0.5 rounded-lg bg-[#0A1633] border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('original')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewMode === 'original'
                        ? 'bg-[#238BFF] text-white shadow-sm'
                        : 'text-[#A7B6D4] hover:text-white'
                    }`}
                    title="View uploaded PDF in its exact original layout and design"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Original PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('reconstructed')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewMode === 'reconstructed'
                        ? 'bg-[#238BFF] text-white shadow-sm'
                        : 'text-[#A7B6D4] hover:text-white'
                    }`}
                    title="View editable reconstructed resume with selected styling and photo"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Reconstructed</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-[#F4F7FF]">
                  <span>Live A4 Preview</span>
                  <span className="text-[10px] text-[#A7B6D4] font-normal hidden sm:inline ml-1.5">
                    ({styling.template.toUpperCase()} • {Math.round(previewZoom * 100)}%)
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {/* Template Selector dropdown in Live Preview toolbar */}
              {previewMode === 'reconstructed' && (
                <div className="flex items-center gap-1 bg-[#0A1633] px-2.5 py-1 rounded-lg border border-[#53D8FF]/30 shadow-xs">
                  <Palette className="w-3.5 h-3.5 text-[#53D8FF] shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-[#A7B6D4] tracking-wider hidden sm:inline">
                    Template:
                  </span>
                  <select
                    value={styling.template}
                    onChange={(e) => {
                      setStyling((prev) => ({
                        ...prev,
                        template: e.target.value as any,
                      }));
                      setPreviewMode('reconstructed');
                    }}
                    className="bg-transparent text-xs font-bold text-[#53D8FF] focus:outline-none cursor-pointer pr-1"
                    title="Select resume visual template layout"
                  >
                    <option value="modern" className="bg-[#07132E] text-white">Modern</option>
                    <option value="classic" className="bg-[#07132E] text-white">Classic</option>
                    <option value="executive" className="bg-[#07132E] text-white">Executive (Dark Header)</option>
                    <option value="professional" className="bg-[#07132E] text-white">Professional</option>
                    <option value="minimal" className="bg-[#07132E] text-white">Minimal</option>
                  </select>
                </div>
              )}

              {/* Zoom Controls for Reconstructed preview */}
              {previewMode === 'reconstructed' && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))
                    }
                    className="p-1.5 rounded-lg bg-[#0A1633] hover:bg-slate-800 text-slate-300 transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#A7B6D4] min-w-[38px] text-center font-mono">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))
                    }
                    className="p-1.5 rounded-lg bg-[#0A1633] hover:bg-slate-800 text-slate-300 transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFitZoom}
                    className="px-2 py-1 rounded-md bg-[#0A1633] hover:bg-[#238BFF]/20 border border-[#53D8FF]/20 text-[11px] text-[#53D8FF] font-medium transition-colors"
                    title="Fit preview to width"
                  >
                    Fit Width
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                    className="p-1.5 rounded-lg bg-[#0A1633] hover:bg-slate-800 text-slate-300 transition-colors"
                    title={isFullScreenPreview ? 'Exit preview modal' : 'Expand full preview'}
                  >
                    {isFullScreenPreview ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              )}

              {/* Direct PDF Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="ml-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                title="Download directly as high-resolution PDF"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER (Realistic Document Editor Desk) */}
          <div
            ref={previewContainerRef}
            className={`rounded-2xl border border-slate-800 bg-[#070e1e]/90 p-4 sm:p-6 overflow-x-auto overflow-y-auto max-h-[calc(100vh-160px)] flex justify-center items-start shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] ${
              isFullScreenPreview
                ? 'fixed inset-4 z-50 max-h-none bg-slate-950/95 backdrop-blur-xl border-[#53D8FF]/40 p-6 sm:p-10'
                : ''
            }`}
          >
            {isFullScreenPreview && (
              <button
                type="button"
                onClick={() => setIsFullScreenPreview(false)}
                className="fixed top-8 right-8 z-50 p-2.5 rounded-full bg-slate-800/90 text-white hover:bg-rose-600 shadow-xl border border-slate-700 transition-colors"
                title="Close fullscreen preview"
              >
                ×
              </button>
            )}

            {/* View 1: Original PDF Viewer (PDF.js rendering) */}
            {previewMode === 'original' && uploadedPdfBase64 ? (
              <div className="w-full flex justify-center">
                <PdfViewer pdfData={uploadedPdfBase64} className="w-full" />
              </div>
            ) : (
              /* View 2: Reconstructed Live Editable Document Preview */
              <div
                className="py-1 transition-transform origin-top flex justify-center"
                style={{
                  width: `${794 * (isFullScreenPreview ? 1 : previewZoom)}px`,
                  minHeight: `${1123 * (isFullScreenPreview ? 1 : previewZoom)}px`,
                }}
              >
                <ResumePreview
                  data={resumeData}
                  styling={styling}
                  scale={isFullScreenPreview ? 1 : previewZoom}
                />
              </div>
            )}
          </div>

          {/* Workflow guidance link back to Analyzer */}
          {onNavigateToAnalyzer && (
            <div className="p-3 rounded-xl bg-[#07132E]/70 border border-[#53D8FF]/15 flex items-center justify-between text-xs text-[#A7B6D4]">
              <span>Want to measure how well this resume matches a specific job?</span>
              <button
                type="button"
                onClick={onNavigateToAnalyzer}
                className="text-[#53D8FF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Analyze against Job</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
