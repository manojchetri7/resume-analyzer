import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Award,
  BookOpen,
  Briefcase,
  Key,
  TrendingUp,
  Download,
  Info,
  ChevronDown,
  Compass,
  Check,
  Zap,
  Target,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  PenTool,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResumeAnalysisResult, QuickResumeAnalysisResult } from '../types';
import { SAMPLE_RESUMES, SAMPLE_JOBS } from '../data/sampleData';

interface ResumeAnalyzerProps {
  onSendToChat?: (resumeText: string, analysisSummary: string) => void;
  onExploreCareers?: (resumeText: string) => void;
  onOpenResumeBuilder?: () => void;
  sharedResumeText: string;
  setSharedResumeText: (text: string) => void;
  sharedResumeName: string;
  setSharedResumeName: (name: string) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  onSendToChat,
  onExploreCareers,
  onOpenResumeBuilder,
  sharedResumeText,
  setSharedResumeText,
  sharedResumeName,
  setSharedResumeName,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analysis Mode: 'quick' (Resume only) vs 'job_match' (Resume + Job Description)
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'job_match'>('quick');

  const [pdfFile, setPdfFile] = useState<{
    name: string;
    sizeFormatted: string;
    base64: string;
  } | null>(null);

  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [scannedPdfNotice, setScannedPdfNotice] = useState<{
    isScanned: boolean;
    message: string;
  } | null>(null);

  // Results state
  const [quickResult, setQuickResult] = useState<QuickResumeAnalysisResult | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<ResumeAnalysisResult | null>(null);
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);

  // Helper to cleanly await reading the PDF file into a base64 string
  const readPdfFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read PDF file into a string.'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error encountered.'));
      reader.readAsDataURL(file);
    });
  };

  // Handle PDF file selection with full await on file reading and text extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setValidationError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setValidationError('File size exceeds 15MB limit. Please upload a smaller PDF.');
      return;
    }

    setValidationError(null);
    setScannedPdfNotice(null);
    setIsReadingPdf(true);
    setIsExtractingText(true);

    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;

    try {
      // 1. Properly await the PDF file to be fully read and converted to base64 string
      const base64Data = await readPdfFileAsBase64(file);
      setIsReadingPdf(false);

      setPdfFile({
        name: file.name,
        sizeFormatted,
        base64: base64Data,
      });
      setSharedResumeName(file.name);

      // 2. Properly await the PDF text extractor to extract text
      const res = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: base64Data, filename: file.name }),
      });
      const data = await res.json();

      // 3. Automated text validation
      if (data.extractedText && data.extractedText.trim().length >= 30) {
        setSharedResumeText(data.extractedText.trim());
        setScannedPdfNotice(null);
      } else {
        setSharedResumeText('');
        const isScanned = Boolean(data.isScanned);
        setScannedPdfNotice({
          isScanned,
          message: isScanned
            ? 'This PDF appears to be a scanned image or photo without selectable text. Our OCR engine could not detect enough readable content.'
            : 'Could not extract sufficient text from this PDF document (the file may be blank, protected, or an image scan).',
        });
      }
    } catch (err: any) {
      console.warn('PDF reading/extraction error:', err);
      setScannedPdfNotice({
        isScanned: true,
        message: 'Unable to extract text from this PDF file. It may be a scanned image, protected, or corrupted.',
      });
    } finally {
      setIsReadingPdf(false);
      setIsExtractingText(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setSharedResumeName('');
    setSharedResumeText('');
    setValidationError(null);
    setScannedPdfNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample Resume Selector
  const handleSelectSampleResume = (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (!sample) return;

    setSharedResumeText(sample.content);
    setSharedResumeName(sample.title);
    setPdfFile({
      name: `${sample.role.replace(/\s+/g, '_')}_Resume.pdf`,
      sizeFormatted: '142 KB (Demo)',
      base64: '', // will send resumeText directly
    });
    setValidationError(null);
    setScannedPdfNotice(null);
  };

  // Fallback sample data applicator for empty or scanned PDFs
  const handleApplyFallbackSample = (sampleId = 'swe-entry') => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId) || SAMPLE_RESUMES[0];
    setSharedResumeText(sample.content);
    setSharedResumeName(`${sample.title} (Fallback Sample)`);
    setPdfFile({
      name: `${sample.role.replace(/\s+/g, '_')}_Resume.pdf`,
      sizeFormatted: '142 KB (Demo)',
      base64: '',
    });
    setValidationError(null);
    setScannedPdfNotice(null);
  };

  // Sample Job Selector
  const handleSelectSampleJob = (jobId: string) => {
    const job = SAMPLE_JOBS.find((j) => j.id === jobId);
    if (!job) return;

    setJobDescription(job.description);
    setTargetRole(job.title);
    setValidationError(null);
  };

  // Main Submit Analysis
  const handleAnalyze = async () => {
    if (!pdfFile && !sharedResumeText) {
      setValidationError('Please upload a resume PDF or select a sample resume to begin.');
      return;
    }

    if (analysisMode === 'job_match' && (!jobDescription || jobDescription.trim().length < 15)) {
      setValidationError('Please paste a job description (at least 15 characters) for Job Match mode, or try a sample preset above.');
      return;
    }

    setValidationError(null);
    setScannedPdfNotice(null);
    setAnalyzing(true);

    try {
      let resolvedText = (sharedResumeText || '').trim();

      // 1. Ensure the PDF text extractor properly waits (await) for the PDF file to be fully read and converted to string
      if (!resolvedText || resolvedText.length < 30) {
        if (!pdfFile?.base64) {
          setValidationError('Please upload a resume PDF with readable text or choose a sample resume.');
          setAnalyzing(false);
          return;
        }

        setAnalysisStep('Scanning and extracting resume text with OCR...');
        const extractRes = await fetch('/api/extract-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: pdfFile.base64, filename: pdfFile.name }),
        });

        const extractData = await extractRes.json();

        // 2. Automated text validation: check if PDF parsing returned empty string or insufficient text
        if (extractData.extractedText && extractData.extractedText.trim().length >= 30) {
          resolvedText = extractData.extractedText.trim();
          setSharedResumeText(resolvedText);
          setScannedPdfNotice(null);
        } else {
          // 3. Scanned image-based or empty PDF handling without breaking
          const isScanned = Boolean(extractData.isScanned);
          setScannedPdfNotice({
            isScanned,
            message: isScanned
              ? 'This PDF appears to be a scanned image or photo without selectable text. Our OCR engine could not detect enough readable content.'
              : 'Could not find sufficient resume content in this PDF. The document may be blank, protected, or an image scan.',
          });
          setAnalyzing(false);
          setAnalysisStep('');
          return;
        }
      }

      // Final automated text validation check
      if (!resolvedText || resolvedText.length < 30) {
        setScannedPdfNotice({
          isScanned: true,
          message: 'Could not find sufficient resume content to evaluate. Please load a sample resume or upload a text-based PDF.',
        });
        setAnalyzing(false);
        setAnalysisStep('');
        return;
      }

      if (analysisMode === 'quick') {
        setAnalysisStep('Scanning resume structure & credentials...');
        await new Promise((r) => setTimeout(r, 300));

        setAnalysisStep('Identifying skills, strengths & education with Gemini AI...');

        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: resolvedText,
            resumeBase64: pdfFile?.base64,
            mode: 'quick',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.insufficientContent || data.isScanned) {
            setScannedPdfNotice({
              isScanned: Boolean(data.isScanned),
              message: data.error || 'Could not find sufficient resume content to evaluate.',
            });
            return;
          }
          throw new Error(data.error || 'Failed to complete quick resume analysis.');
        }

        setAnalysisStep('Formulating entry-level roles & personalized recommendations...');
        const parsedData: QuickResumeAnalysisResult = data;
        setQuickResult(parsedData);
        setScannedPdfNotice(null);

        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#238BFF', '#53D8FF', '#7657FF'],
          });
        } catch (e) {
          // ignore
        }
      } else {
        // Job match mode
        setAnalysisStep('Evaluating resume alignment against job requirements...');
        await new Promise((r) => setTimeout(r, 350));

        setAnalysisStep('Calculating match score & skill overlaps with Gemini AI...');

        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: resolvedText,
            resumeBase64: pdfFile?.base64,
            jobDescription,
            targetRole,
            mode: 'job_match',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.insufficientContent || data.isScanned) {
            setScannedPdfNotice({
              isScanned: Boolean(data.isScanned),
              message: data.error || 'Could not find sufficient resume content to evaluate.',
            });
            return;
          }
          throw new Error(data.error || 'Failed to complete job match analysis.');
        }

        setAnalysisStep('Synthesizing match analytics & keyword suggestions...');
        const parsedData: ResumeAnalysisResult = data;
        setJobMatchResult(parsedData);
        setScannedPdfNotice(null);

        if (parsedData.overallScore >= 75) {
          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#238BFF', '#53D8FF', '#7657FF'],
            });
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Analysis encountered an error. Please try again.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#53D8FF] stroke-[#53D8FF]';
    if (score >= 60) return 'text-[#238BFF] stroke-[#238BFF]';
    return 'text-amber-400 stroke-amber-400';
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07132E] border border-[#53D8FF]/30 text-xs font-medium text-[#53D8FF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Beginner-Friendly Career Intelligence</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
          Resume Analyzer & Job Matcher
        </h2>
        <p className="text-[#A7B6D4] text-base leading-relaxed">
          Choose how you'd like to analyze: inspect your resume's overall skills & strengths without needing a job description, or compare your resume against a specific job posting.
        </p>

        {/* 1. Mode Selector Tabs */}
        <div className="pt-2">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#07132E] border border-[#53D8FF]/20 shadow-[0_0_20px_rgba(35,139,255,0.15)] max-w-full">
            <button
              type="button"
              onClick={() => {
                setAnalysisMode('quick');
                setValidationError(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                analysisMode === 'quick'
                  ? 'bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-white shadow-[0_0_15px_rgba(35,139,255,0.4)]'
                  : 'text-[#A7B6D4] hover:text-[#F4F7FF]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#53D8FF]" />
              <span>Quick Resume Analysis</span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                Resume Only
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAnalysisMode('job_match');
                setValidationError(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                analysisMode === 'job_match'
                  ? 'bg-gradient-to-r from-[#7657FF] to-[#238BFF] text-white shadow-[0_0_15px_rgba(118,87,255,0.4)]'
                  : 'text-[#A7B6D4] hover:text-[#F4F7FF]'
              }`}
            >
              <Target className="w-4 h-4 text-[#7657FF]" />
              <span>Match Resume With a Job</span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                Role Compare
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Banner Description */}
      <div className="max-w-4xl mx-auto">
        {analysisMode === 'quick' ? (
          <div className="p-4 rounded-2xl bg-[#07132E]/70 border border-[#53D8FF]/20 flex items-start sm:items-center gap-3 text-xs text-[#A7B6D4]">
            <div className="w-8 h-8 rounded-lg bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center shrink-0 text-[#53D8FF]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[#F4F7FF]">Beginner-Friendly Mode: </span>
              Uploading your resume alone is enough! We will extract your core skills, education, experience, strengths, weaknesses, and recommend entry-level roles. No job title or job description is required.
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#07132E]/70 border border-[#7657FF]/30 flex items-start sm:items-center gap-3 text-xs text-[#A7B6D4]">
            <div className="w-8 h-8 rounded-lg bg-[#7657FF]/20 border border-[#7657FF]/40 flex items-center justify-center shrink-0 text-[#7657FF]">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[#F4F7FF]">Target Alignment Mode: </span>
              Compare your resume against a specific job posting to calculate an exact match score, find missing keywords, and get tailored advice for that position.
            </div>
          </div>
        )}
      </div>

      {/* Input Workspace */}
      <div className="max-w-5xl mx-auto">
        {analysisMode === 'quick' ? (
          /* QUICK RESUME ANALYSIS INPUT (Clean single-card layout) */
          <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#53D8FF]/25 shadow-[0_0_35px_rgba(35,139,255,0.15)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#53D8FF]/10 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#F4F7FF] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#53D8FF]" />
                  Upload Your Resume PDF
                </h3>
                <p className="text-xs text-[#A7B6D4] mt-1">
                  Upload your resume file or test with one of our preloaded samples below.
                </p>
              </div>

              {sharedResumeText && (
                <button
                  type="button"
                  onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                  className="text-xs text-[#53D8FF] hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  {showExtractedPreview ? 'Hide Extracted Text' : 'View Extracted Text'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showExtractedPreview ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Dropzone or Loaded File */}
            {!pdfFile && !sharedResumeName ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer border-2 border-dashed border-[#53D8FF]/25 hover:border-[#53D8FF]/60 rounded-2xl p-8 sm:p-12 text-center transition-all bg-[#07132E]/40 hover:bg-[#07132E]/80"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0A1633] border border-[#238BFF]/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(35,139,255,0.2)]">
                  <Upload className="w-7 h-7 text-[#53D8FF]" />
                </div>
                <p className="text-base font-semibold text-[#F4F7FF] mb-1">
                  Click to select or drag & drop your resume PDF
                </p>
                <p className="text-xs text-[#A7B6D4]">
                  Accepts standard PDF documents up to 15MB
                </p>
              </div>
            ) : (
              <div className="bg-[#07132E] border border-[#53D8FF]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-11 h-11 rounded-xl bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-[#53D8FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F4F7FF] truncate">
                      {pdfFile?.name || sharedResumeName}
                    </p>
                    <p className="text-xs text-[#A7B6D4] flex items-center gap-1.5">
                      {isReadingPdf ? (
                        <>
                          <RefreshCw className="w-3 h-3 text-[#53D8FF] animate-spin" />
                          <span>Reading PDF binary data...</span>
                        </>
                      ) : isExtractingText ? (
                        <>
                          <RefreshCw className="w-3 h-3 text-[#53D8FF] animate-spin" />
                          <span>Extracting text with OCR...</span>
                        </>
                      ) : sharedResumeText ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Ready for Analysis ({sharedResumeText.length} chars)</span>
                        </>
                      ) : (
                        pdfFile?.sizeFormatted || 'Ready for Analysis'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#53D8FF] hover:text-white px-3 py-1.5 rounded-lg bg-[#0A1633] border border-[#53D8FF]/20"
                  >
                    Replace File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Extracted text drawer */}
            {showExtractedPreview && sharedResumeText && (
              <div className="bg-[#07132E] border border-slate-700/50 rounded-xl p-3 max-h-48 overflow-y-auto text-xs text-[#A7B6D4] font-mono leading-relaxed whitespace-pre-wrap">
                {sharedResumeText}
              </div>
            )}

            {/* Preloaded Sample Resumes */}
            <div className="pt-2">
              <span className="text-xs text-[#A7B6D4] block mb-2 font-medium">
                Don't have a PDF right now? Try a preloaded sample resume:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_RESUMES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSampleResume(sample.id)}
                    className="text-xs px-3 py-2 rounded-xl bg-[#07132E] hover:bg-[#238BFF]/20 border border-[#53D8FF]/15 hover:border-[#53D8FF]/40 text-[#A7B6D4] hover:text-[#F4F7FF] transition-all text-left flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#53D8FF]" />
                    <span>{sample.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scanned / Image-Based PDF Notification with Fallback Sample Button */}
            {scannedPdfNotice && (
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#07132E] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
                      <span>{scannedPdfNotice.isScanned ? 'Scanned or Image-Based PDF Detected' : 'Insufficient Resume Content'}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Notice
                      </span>
                    </h4>
                    <p className="text-xs text-[#A7B6D4] leading-relaxed">
                      {scannedPdfNotice.message}
                    </p>
                    <p className="text-[11px] text-[#A7B6D4]/80">
                      Tip: Automated ATS scanners and AI analyzers require selectable text. Scanned images, flattened canvases, or photos lack selectable character streams. You can continue testing immediately by loading our preloaded sample resume or upload a text-based PDF.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleApplyFallbackSample('swe-entry')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:from-[#53D8FF] hover:to-[#238BFF] text-white text-xs font-semibold shadow-[0_0_15px_rgba(35,139,255,0.3)] transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#53D8FF]" />
                    <span>Use Sample Resume as Fallback</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#07132E] hover:bg-[#238BFF]/20 border border-[#53D8FF]/30 text-xs text-[#53D8FF] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Text-Based PDF</span>
                  </button>
                </div>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#53D8FF]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#A7B6D4] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant breakdown of your skills, weaknesses, and matching entry jobs.</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(35,139,255,0.4)] ${
                  analyzing
                    ? 'bg-[#0E224D] cursor-not-allowed opacity-90'
                    : 'bg-gradient-to-r from-[#238BFF] via-[#7657FF] to-[#53D8FF] hover:shadow-[0_0_35px_rgba(83,216,255,0.6)] hover:scale-[1.01]'
                }`}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-[#53D8FF] animate-spin" />
                    <span>{analysisStep || 'Analyzing Resume with Gemini...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#53D8FF]" />
                    <span>Analyze My Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* MATCH RESUME WITH A JOB INPUT (Dual column with job posting) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Card: Resume Upload (5 cols) */}
            <div className="lg:col-span-5 cosmic-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#53D8FF]" />
                    1. Upload Resume PDF
                  </label>
                  {sharedResumeText && (
                    <button
                      type="button"
                      onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                      className="text-xs text-[#53D8FF] hover:underline flex items-center gap-1"
                    >
                      {showExtractedPreview ? 'Hide Text' : 'View Text'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showExtractedPreview ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {!pdfFile && !sharedResumeName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer border-2 border-dashed border-[#53D8FF]/25 hover:border-[#53D8FF]/60 rounded-xl p-8 text-center transition-all bg-[#07132E]/40 hover:bg-[#07132E]/80"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#0A1633] border border-[#238BFF]/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(35,139,255,0.2)]">
                      <Upload className="w-5 h-5 text-[#53D8FF]" />
                    </div>
                    <p className="text-sm font-medium text-[#F4F7FF] mb-1">
                      Select or drop resume PDF
                    </p>
                    <p className="text-xs text-[#A7B6D4]">
                      PDF format (Max 15MB)
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#07132E] border border-[#53D8FF]/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#53D8FF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F4F7FF] truncate">
                          {pdfFile?.name || sharedResumeName}
                        </p>
                        <p className="text-xs text-[#A7B6D4] flex items-center gap-1.5">
                          {isReadingPdf ? (
                            <>
                              <RefreshCw className="w-3 h-3 text-[#53D8FF] animate-spin" />
                              <span>Reading PDF...</span>
                            </>
                          ) : isExtractingText ? (
                            <>
                              <RefreshCw className="w-3 h-3 text-[#53D8FF] animate-spin" />
                              <span>Extracting text...</span>
                            </>
                          ) : sharedResumeText ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Ready ({sharedResumeText.length} chars)</span>
                            </>
                          ) : (
                            pdfFile?.sizeFormatted || 'Loaded'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#53D8FF] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#0A1633] border border-[#53D8FF]/20"
                      >
                        Replace
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,application/pdf"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Extracted preview */}
                {showExtractedPreview && sharedResumeText && (
                  <div className="bg-[#07132E] border border-slate-700/50 rounded-xl p-3 max-h-44 overflow-y-auto text-xs text-[#A7B6D4] font-mono leading-relaxed whitespace-pre-wrap">
                    {sharedResumeText}
                  </div>
                )}

                {/* Sample Resumes */}
                <div className="pt-1">
                  <span className="text-xs text-[#A7B6D4] block mb-1.5 font-medium">
                    Or select a sample resume:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_RESUMES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSampleResume(sample.id)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#07132E] hover:bg-[#238BFF]/20 border border-[#53D8FF]/15 text-[#A7B6D4] hover:text-[#F4F7FF]"
                      >
                        {sample.role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#A7B6D4] flex items-center gap-2 pt-3 border-t border-[#53D8FF]/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Files are processed securely in temporary memory.</span>
              </div>
            </div>

            {/* Right Card: Target Job Description (7 cols) */}
            <div className="lg:col-span-7 cosmic-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label htmlFor="job-desc-input" className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#7657FF]" />
                    2. Paste Target Job Description
                  </label>

                  {/* Sample job presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#A7B6D4]">Try a Sample Job:</span>
                    {SAMPLE_JOBS.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => handleSelectSampleJob(job.id)}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-[#07132E] hover:bg-[#7657FF]/20 border border-[#7657FF]/30 text-[#A7B6D4] hover:text-[#F4F7FF] transition-all"
                      >
                        {job.id === 'fullstack-job' ? 'Full Stack' : job.id === 'ai-data-job' ? 'Data & AI' : 'Product'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Where to find tip */}
                <div className="p-3 rounded-xl bg-[#07132E]/60 border border-slate-700/60 text-[11px] text-[#A7B6D4] flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F4F7FF]">Where can I find a job description? </strong>
                    Copy and paste the responsibilities and requirements from any job listing on LinkedIn, Indeed, Glassdoor, or employer careers pages.
                  </div>
                </div>

                {/* Target Role input optional */}
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target Role Title (e.g. Junior Frontend Developer, Associate Data Analyst)..."
                  className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] focus:ring-1 focus:ring-[#53D8FF] rounded-xl px-4 py-2 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none"
                />

                {/* Job Description Textarea */}
                <div className="relative">
                  <textarea
                    id="job-desc-input"
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description requirements, responsibilities, and qualifications here..."
                    className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] focus:ring-1 focus:ring-[#53D8FF] rounded-xl p-3.5 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none leading-relaxed resize-y font-normal"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-[#A7B6D4]/60 font-mono">
                    {jobDescription.length} characters
                  </span>
                </div>
              </div>

              {/* Scanned / Image-Based PDF Notification with Fallback Sample Button */}
              {scannedPdfNotice && (
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#07132E] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-amber-200 flex items-center gap-2">
                        <span>{scannedPdfNotice.isScanned ? 'Scanned or Image-Based PDF Detected' : 'Insufficient Resume Content'}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Notice
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#A7B6D4] leading-relaxed">
                        {scannedPdfNotice.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-0.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyFallbackSample('swe-entry')}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:from-[#53D8FF] hover:to-[#238BFF] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#53D8FF]" />
                      <span>Use Sample Resume as Fallback</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#07132E] hover:bg-[#238BFF]/20 border border-[#53D8FF]/30 text-xs text-[#53D8FF] hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Text-Based PDF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Alert */}
              {validationError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(118,87,255,0.4)] ${
                    analyzing
                      ? 'bg-[#0E224D] cursor-not-allowed opacity-90'
                      : 'bg-gradient-to-r from-[#7657FF] via-[#238BFF] to-[#53D8FF] hover:shadow-[0_0_35px_rgba(83,216,255,0.6)]'
                  }`}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-[#53D8FF] animate-spin" />
                      <span className="text-sm font-medium">{analysisStep || 'Analyzing Job Alignment with Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 text-[#53D8FF]" />
                      <span>Analyze Job Match & Skills Gap</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. RESULTS DASHBOARD FOR QUICK RESUME ANALYSIS */}
      {quickResult && analysisMode === 'quick' && (
        <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#53D8FF]/35 space-y-10 shadow-[0_0_50px_rgba(35,139,255,0.2)] animate-in fade-in duration-500">
          {/* Top Polish & Summary Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#53D8FF]/15 pb-8">
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#238BFF]/20 to-[#7657FF]/20 blur-xl" />
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="68" stroke="#07132E" strokeWidth="12" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - quickResult.readinessScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`${getScoreColor(quickResult.readinessScore)} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#F4F7FF]">
                    {quickResult.readinessScore}%
                  </span>
                  <span className="text-[11px] text-[#A7B6D4] uppercase tracking-wider font-semibold">
                    Resume Polish
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#07132E] border border-[#53D8FF]/30 text-[#53D8FF]">
                  Quick Resume Health
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#53D8FF] font-semibold">Candidate Profile Overview</span>
                <h3 className="font-display text-2xl font-bold text-[#F4F7FF] mt-1">
                  Your Skills & Professional Identity
                </h3>
              </div>
              <p className="text-[#A7B6D4] text-sm sm:text-base leading-relaxed">
                {quickResult.candidateSummary}
              </p>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#07132E] border border-[#53D8FF]/15 text-xs text-[#A7B6D4]">
                <Info className="w-4 h-4 text-[#53D8FF] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#F4F7FF]">Beginner's Note: </strong>
                  {quickResult.readinessNote}
                </p>
              </div>
            </div>
          </div>

          {/* Education & Experience Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#07132E]/80 border border-[#238BFF]/30 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#238BFF]" />
                Education Identified
              </h4>
              <div className="space-y-1">
                {quickResult.education.degrees.map((deg, i) => (
                  <p key={i} className="text-sm font-semibold text-[#53D8FF]">
                    {deg}
                  </p>
                ))}
              </div>
              <p className="text-xs text-[#A7B6D4] leading-relaxed">
                {quickResult.education.details}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#07132E]/80 border border-[#7657FF]/30 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#7657FF]" />
                Experience Level
              </h4>
              <p className="text-sm font-semibold text-[#7657FF]">
                {quickResult.experience.level}
              </p>
              <p className="text-xs text-[#A7B6D4] leading-relaxed">
                {quickResult.experience.summary}
              </p>
            </div>
          </div>

          {/* Recommended Entry-Level Roles (Core requirement 2) */}
          <div className="p-6 rounded-2xl bg-[#07132E]/90 border border-emerald-500/30 space-y-3">
            <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Recommended Suitable Entry-Level Job Roles
            </h4>
            <p className="text-xs text-[#A7B6D4]">
              Based on your actual skills and projects, here are great roles you are already positioned to pursue:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {quickResult.recommendedEntryRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>✦</span>
                  <span>{role}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Identified Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-[#53D8FF]/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#53D8FF]" />
                Skills Found on Your Resume ({quickResult.identifiedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickResult.identifiedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0A1633] border border-[#53D8FF]/30 text-[#F4F7FF] font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-amber-500/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Missing or Underrepresented Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickResult.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills to Learn Next (Core requirement 2) */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-bold text-[#F4F7FF] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#53D8FF]" />
              Relevant Skills to Prioritize Next
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickResult.skillsToLearnNext.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#07132E] border border-[#53D8FF]/15 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F4F7FF] text-sm">{item.skill}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.importance === 'High'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            : 'bg-[#238BFF]/20 text-[#53D8FF] border border-[#53D8FF]/30'
                        }`}
                      >
                        {item.importance} Priority
                      </span>
                    </div>
                    <p className="text-xs text-[#A7B6D4] leading-relaxed">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Strengths vs Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-emerald-500/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                Resume Strengths
              </h4>
              <ul className="space-y-2 text-xs text-[#A7B6D4]">
                {quickResult.resumeStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✦</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-amber-500/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Weaknesses & Blind Spots
              </h4>
              <ul className="space-y-2 text-xs text-[#A7B6D4]">
                {quickResult.resumeWeaknesses.map((weak, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="p-6 rounded-2xl bg-[#07132E]/90 border border-[#7657FF]/30 space-y-3">
            <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7657FF]" />
              Easy Ways to Improve Your Resume
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {quickResult.improvementSuggestions.map((sug, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#0A1633] border border-slate-700/50 text-xs text-[#A7B6D4] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#7657FF]/20 text-[#7657FF] flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{sug}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Action Bar */}
          <div className="pt-6 border-t border-[#53D8FF]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#A7B6D4]">
              <span>Next steps to explore:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {onOpenResumeBuilder && (
                <button
                  type="button"
                  onClick={onOpenResumeBuilder}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(35,139,255,0.4)] hover:brightness-110 transition-all"
                >
                  <PenTool className="w-4 h-4 text-[#53D8FF]" />
                  <span>Edit in AI Resume Builder</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAnalysisMode('job_match');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#0A1633] hover:bg-[#07132E] border border-[#53D8FF]/30 text-xs font-semibold text-[#F4F7FF] flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4 text-[#7657FF]" />
                <span>Compare Against a Specific Job</span>
              </button>

              {onSendToChat && (
                <button
                  type="button"
                  onClick={() =>
                    onSendToChat(
                      sharedResumeText,
                      `Quick Resume Health Score: ${quickResult.readinessScore}%. Recommended roles: ${quickResult.recommendedEntryRoles.join(', ')}.`
                    )
                  }
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#07132E] hover:bg-[#0A1633] border border-[#53D8FF]/30 text-xs font-semibold text-[#53D8FF] flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss With AI Guide</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-[#07132E] hover:bg-[#0A1633] border border-slate-700 text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyze Another Resume</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS DASHBOARD FOR MATCH RESUME WITH A JOB */}
      {jobMatchResult && analysisMode === 'job_match' && (
        <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#7657FF]/35 space-y-10 shadow-[0_0_50px_rgba(118,87,255,0.2)] animate-in fade-in duration-500">
          {/* Top Score & Summary Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#53D8FF]/15 pb-8">
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#238BFF]/20 to-[#7657FF]/20 blur-xl" />
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="68" stroke="#07132E" strokeWidth="12" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - jobMatchResult.overallScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`${getScoreColor(jobMatchResult.overallScore)} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#F4F7FF]">
                    {jobMatchResult.overallScore}%
                  </span>
                  <span className="text-[11px] text-[#A7B6D4] uppercase tracking-wider font-semibold">
                    Job Match
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#07132E] border border-[#53D8FF]/30 text-[#53D8FF]">
                  {jobMatchResult.overallScore >= 80 ? 'Strong Alignment' : jobMatchResult.overallScore >= 60 ? 'Moderate Fit' : 'Foundational Fit'}
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7657FF] font-semibold">
                  Job Description Alignment Analysis
                </span>
                <h3 className="font-display text-2xl font-bold text-[#F4F7FF] mt-1">
                  Candidate Fit Assessment
                </h3>
              </div>
              <p className="text-[#A7B6D4] text-sm sm:text-base leading-relaxed">
                {jobMatchResult.summary}
              </p>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#07132E] border border-[#53D8FF]/15 text-xs text-[#A7B6D4]">
                <Info className="w-4 h-4 text-[#53D8FF] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#F4F7FF]">How this score is calculated: </strong>
                  {jobMatchResult.scoreEstimationNote}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Sub-Score Dimensional Indicators */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#A7B6D4]">
              Alignment Breakdown by Dimension
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#07132E]/80 border border-[#238BFF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#53D8FF]" /> Skills
                  </span>
                  <span className="text-sm font-bold text-[#53D8FF]">{jobMatchResult.scoringBreakdown.skillsAlignment.score}%</span>
                </div>
                <div className="w-full bg-[#03091B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#53D8FF] h-full rounded-full transition-all duration-700"
                    style={{ width: `${jobMatchResult.scoringBreakdown.skillsAlignment.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#A7B6D4] leading-normal line-clamp-3">
                  {jobMatchResult.scoringBreakdown.skillsAlignment.details}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07132E]/80 border border-[#7657FF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#7657FF]" /> Experience
                  </span>
                  <span className="text-sm font-bold text-[#7657FF]">{jobMatchResult.scoringBreakdown.experienceAlignment.score}%</span>
                </div>
                <div className="w-full bg-[#03091B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7657FF] h-full rounded-full transition-all duration-700"
                    style={{ width: `${jobMatchResult.scoringBreakdown.experienceAlignment.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#A7B6D4] leading-normal line-clamp-3">
                  {jobMatchResult.scoringBreakdown.experienceAlignment.details}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07132E]/80 border border-[#238BFF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#238BFF]" /> Education
                  </span>
                  <span className="text-sm font-bold text-[#238BFF]">{jobMatchResult.scoringBreakdown.educationAlignment.score}%</span>
                </div>
                <div className="w-full bg-[#03091B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#238BFF] h-full rounded-full transition-all duration-700"
                    style={{ width: `${jobMatchResult.scoringBreakdown.educationAlignment.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#A7B6D4] leading-normal line-clamp-3">
                  {jobMatchResult.scoringBreakdown.educationAlignment.details}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07132E]/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" /> Keywords
                  </span>
                  <span className="text-sm font-bold text-emerald-400">{jobMatchResult.scoringBreakdown.keywordsAlignment.score}%</span>
                </div>
                <div className="w-full bg-[#03091B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${jobMatchResult.scoringBreakdown.keywordsAlignment.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#A7B6D4] leading-normal line-clamp-3">
                  {jobMatchResult.scoringBreakdown.keywordsAlignment.details}
                </p>
              </div>
            </div>
          </div>

          {/* Matching Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-sm text-[#F4F7FF]">
                  Matching Skills Found ({jobMatchResult.matchingSkills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.matchingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-sm text-[#F4F7FF]">
                  Missing or Underrepresented Skills ({jobMatchResult.missingSkills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Strengths & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-[#53D8FF]/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#53D8FF]" />
                Resume Strengths
              </h4>
              <ul className="space-y-2 text-xs text-[#A7B6D4]">
                {jobMatchResult.resumeStrengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#53D8FF] mt-0.5">✦</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#07132E]/70 border border-[#7657FF]/20 space-y-3">
              <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#7657FF]" />
                High-Impact Job Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {jobMatchResult.relevantKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#0A1633] border border-[#7657FF]/30 text-[#A7B6D4]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-bold text-[#F4F7FF] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#53D8FF]" />
              Actionable Recommendations to Elevate Relevance
            </h4>
            <div className="space-y-3">
              {jobMatchResult.actionableRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#07132E] border border-[#53D8FF]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.priority === 'High'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            : rec.priority === 'Medium'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <p className="text-sm font-semibold text-[#F4F7FF]">{rec.action}</p>
                    </div>
                    <p className="text-xs text-[#A7B6D4] pl-0.5">{rec.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Action Bar */}
          <div className="pt-6 border-t border-[#53D8FF]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#A7B6D4]">
              <span>Need help targeting this position?</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {onOpenResumeBuilder && (
                <button
                  type="button"
                  onClick={onOpenResumeBuilder}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(35,139,255,0.4)] hover:brightness-110 transition-all"
                >
                  <PenTool className="w-4 h-4 text-[#53D8FF]" />
                  <span>Fix & Tailor in Resume Builder</span>
                </button>
              )}

              {onSendToChat && (
                <button
                  type="button"
                  onClick={() =>
                    onSendToChat(
                      sharedResumeText,
                      `Target Job Match Score: ${jobMatchResult.overallScore}%. Missing skills: ${jobMatchResult.missingSkills.join(', ')}.`
                    )
                  }
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#07132E] hover:bg-[#0A1633] border border-[#53D8FF]/30 text-xs font-semibold text-[#53D8FF] flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss With AI Guide</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-[#07132E] hover:bg-[#0A1633] border border-slate-700 text-xs font-medium text-[#A7B6D4] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyze Another Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
