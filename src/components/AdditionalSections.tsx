import React, { useState } from 'react';
import {
  UploadCloud,
  Cpu,
  TrendingUp,
  Shield,
  Eye,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Lock,
  Sparkles,
  Award,
  Zap,
  Briefcase
} from 'lucide-react';
import { DEMO_PREVIEW_RESULT, FAQ_ITEMS } from '../data/sampleData';

interface AdditionalSectionsProps {
  onStartAnalyze: () => void;
}

export const AdditionalSections: React.FC<AdditionalSectionsProps> = ({ onStartAnalyze }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-24">
      {/* 1. How It Works */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#53D8FF]">
            Simple 3-Step Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
            How Cosmic Career AI Works
          </h2>
          <p className="text-[#A7B6D4] text-base">
            From raw PDF to high-fidelity career mapping in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="cosmic-card rounded-2xl p-8 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center text-[#53D8FF] font-display font-bold text-lg">
              01
            </div>
            <h3 className="font-display text-xl font-bold text-[#F4F7FF]">
              1. Upload & Extract
            </h3>
            <p className="text-sm text-[#A7B6D4] leading-relaxed">
              Upload your resume in PDF format. Our parser extracts text, competencies, previous achievements, and educational qualifications into secure in-memory buffers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="cosmic-card rounded-2xl p-8 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-[#7657FF]/20 border border-[#7657FF]/40 flex items-center justify-center text-[#7657FF] font-display font-bold text-lg">
              02
            </div>
            <h3 className="font-display text-xl font-bold text-[#F4F7FF]">
              2. Analyze Fit
            </h3>
            <p className="text-sm text-[#A7B6D4] leading-relaxed">
              Paste your target job description. Gemini AI cross-references your profile against role requirements, calculating skill matches, missing keywords, and real-world alignment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="cosmic-card rounded-2xl p-8 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-[#53D8FF]/20 border border-[#53D8FF]/40 flex items-center justify-center text-[#53D8FF] font-display font-bold text-lg">
              03
            </div>
            <h3 className="font-display text-xl font-bold text-[#F4F7FF]">
              3. Improve & Road-map
            </h3>
            <p className="text-sm text-[#A7B6D4] leading-relaxed">
              Receive prioritized action items, 30/60/90-day learning milestones, and consult the AI Career Guide to bridge gaps before submitting your applications.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sample Analysis Preview (Clearly marked as Demo) */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Eye className="w-3.5 h-3.5" />
            <span>DEMO / SAMPLE PREVIEW</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
            Sample Analysis Preview
          </h2>
          <p className="text-[#A7B6D4] text-base">
            Here is an example report showing how Cosmic Career AI breaks down candidate alignment against a modern tech role.
          </p>
        </div>

        <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#53D8FF]/30 space-y-8 bg-[#07132E]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#53D8FF]/15 pb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Sample Report · Alex Mercer vs. NovaTech Full Stack Engineer
              </span>
              <h3 className="font-display text-2xl font-bold text-[#F4F7FF] mt-1">
                Candidate Fit Score: {DEMO_PREVIEW_RESULT.overallScore}%
              </h3>
            </div>
            <button
              onClick={onStartAnalyze}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-xs font-semibold text-white shadow-[0_0_15px_rgba(35,139,255,0.4)] hover:shadow-[0_0_25px_rgba(83,216,255,0.6)]"
            >
              Analyze Your Own Resume
            </button>
          </div>

          {/* Sub scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-[#0A1633] border border-[#53D8FF]/20">
              <span className="text-[11px] text-[#A7B6D4] block">Skills Alignment</span>
              <span className="text-lg font-bold text-[#53D8FF]">{DEMO_PREVIEW_RESULT.scoringBreakdown.skillsAlignment.score}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1633] border border-[#7657FF]/20">
              <span className="text-[11px] text-[#A7B6D4] block">Experience Alignment</span>
              <span className="text-lg font-bold text-[#7657FF]">{DEMO_PREVIEW_RESULT.scoringBreakdown.experienceAlignment.score}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1633] border border-[#238BFF]/20">
              <span className="text-[11px] text-[#A7B6D4] block">Education Alignment</span>
              <span className="text-lg font-bold text-[#238BFF]">{DEMO_PREVIEW_RESULT.scoringBreakdown.educationAlignment.score}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1633] border border-emerald-500/20">
              <span className="text-[11px] text-[#A7B6D4] block">Keyword Match</span>
              <span className="text-lg font-bold text-emerald-400">{DEMO_PREVIEW_RESULT.scoringBreakdown.keywordsAlignment.score}%</span>
            </div>
          </div>

          <p className="text-xs text-[#A7B6D4] leading-relaxed italic border-l-2 border-[#53D8FF] pl-3">
            "{DEMO_PREVIEW_RESULT.summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Matching Skills (Sample)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_PREVIEW_RESULT.matchingSkills.slice(0, 5).map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Missing High-Priority Skills (Sample)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_PREVIEW_RESULT.missingSkills.slice(0, 3).map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-amber-950/40 text-amber-300">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Use Cosmic Career AI */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7657FF]">
            Architected For Precision
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
            Why Use Cosmic Career AI
          </h2>
          <p className="text-[#A7B6D4] text-base">
            Engineered to give you objective, actionable career intelligence without hype or black boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="cosmic-card rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center text-[#53D8FF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
              True Semantic Document Analysis
            </h3>
            <p className="text-xs text-[#A7B6D4] leading-relaxed">
              We extract and evaluate real PDF text with Gemini 3.8 Flash, reading technical depth, quantitative metrics, and project impact rather than simple keyword counting.
            </p>
          </div>

          <div className="cosmic-card rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7657FF]/20 border border-[#7657FF]/40 flex items-center justify-center text-[#7657FF]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
              Actionable Skill Roadmaps
            </h3>
            <p className="text-xs text-[#A7B6D4] leading-relaxed">
              We don't just point out missing requirements — we structure clear 30, 60, and 90-day learning milestones with recommended projects you can build right now.
            </p>
          </div>

          <div className="cosmic-card rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
              Privacy & Ephemeral Memory
            </h3>
            <p className="text-xs text-[#A7B6D4] leading-relaxed">
              Your resume is processed ephemerally. We do not sell your candidate data, spam you, or persist documents across sessions without your explicit direction.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Privacy & Data Handling Information */}
      <section className="cosmic-card rounded-3xl p-8 sm:p-12 border border-[#53D8FF]/20 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#53D8FF]" />
          <h3 className="font-display text-2xl font-bold text-[#F4F7FF]">
            Privacy & Responsible Data Handling
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#A7B6D4] leading-relaxed">
          <div className="space-y-3">
            <p>
              <strong className="text-[#F4F7FF]">1. In-Memory Processing:</strong> When you upload a resume PDF, it is converted to temporary memory buffers on the server exclusively to perform the AI extraction and matching. We do not store permanent files on disk.
            </p>
            <p>
              <strong className="text-[#F4F7FF]">2. No Model Training on Private Data:</strong> Your resume and personal information are not used to train public foundational AI models.
            </p>
          </div>
          <div className="space-y-3">
            <p>
              <strong className="text-[#F4F7FF]">3. Full Session Control:</strong> You can purge your extracted resume and session data from your browser at any time by clicking the "Clear Session" button in the navigation header.
            </p>
            <p>
              <strong className="text-[#F4F7FF]">4. Analytical Disclaimer:</strong> Our match scores reflect automated textual and criteria alignment. They do not represent an employer's hiring decision, nor do they guarantee job placement or compensation.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#53D8FF]">
            Frequently Asked Questions
          </span>
          <h2 className="font-display text-3xl font-bold text-[#F4F7FF]">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="cosmic-card rounded-2xl border border-[#53D8FF]/15 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#F4F7FF]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#53D8FF] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#A7B6D4] leading-relaxed border-t border-[#53D8FF]/10 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
