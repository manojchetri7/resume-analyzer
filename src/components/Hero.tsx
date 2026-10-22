import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Compass, FileText } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onExplorePathsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onExplorePathsClick }) => {
  return (
    <div className="relative pt-6 pb-12 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A1633] border border-[#53D8FF]/30 text-xs font-medium text-[#53D8FF] shadow-[0_0_15px_rgba(83,216,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#53D8FF]" />
          <span>Next-Generation Career Intelligence · Powered by Gemini AI</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F4F7FF] leading-tight">
          Your Future Career <br />
          <span className="bg-gradient-to-r from-[#238BFF] via-[#53D8FF] to-[#7657FF] bg-clip-text text-transparent">
            Starts Here.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#A7B6D4] max-w-2xl mx-auto leading-relaxed">
          Analyze your resume, discover your strengths, match your dream job, and build the skills your future needs — powered by AI resume analysis.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onAnalyzeClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#238BFF] via-[#7657FF] to-[#53D8FF] text-white font-semibold text-sm shadow-[0_0_25px_rgba(35,139,255,0.4)] hover:shadow-[0_0_35px_rgba(83,216,255,0.6)] transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Analyze My Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExplorePathsClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#07132E] hover:bg-[#0A1633] text-[#F4F7FF] font-semibold text-sm border border-[#53D8FF]/20 hover:border-[#53D8FF]/50 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#53D8FF]" />
            <span>Career Paths</span>
          </button>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="cosmic-card p-4 rounded-xl border border-[#53D8FF]/10 bg-[#07132E]/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FF]">
              <ShieldCheck className="w-4 h-4 text-[#53D8FF]" />
              <span>Smart Resume Analysis</span>
            </div>
            <p className="text-[11px] text-[#A7B6D4] mt-1">Extracts & scores fit against market standards.</p>
          </div>

          <div className="cosmic-card p-4 rounded-xl border border-[#53D8FF]/10 bg-[#07132E]/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FF]">
              <Compass className="w-4 h-4 text-[#7657FF]" />
              <span>Personalized Roadmaps</span>
            </div>
            <p className="text-[11px] text-[#A7B6D4] mt-1">30, 60, and 90-day execution milestones.</p>
          </div>

          <div className="cosmic-card p-4 rounded-xl border border-[#53D8FF]/10 bg-[#07132E]/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FF]">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Job Role Matcher</span>
            </div>
            <p className="text-[11px] text-[#A7B6D4] mt-1">Precision skill alignment & gap analysis.</p>
          </div>
        </div>

      </div>
    </div>
  );
};