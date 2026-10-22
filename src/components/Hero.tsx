import React from 'react';
import { Sparkles, FileSearch, Compass, ArrowRight, Shield, Zap, Target } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onExplorePathsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onExplorePathsClick }) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Subtle editorial kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A1633] border border-[#53D8FF]/30 text-xs font-medium text-[#53D8FF] shadow-[0_0_15px_rgba(83,216,255,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#53D8FF]" />
              <span>Next-Generation Career Intelligence</span>
              <span className="text-slate-500">·</span>
              <span className="text-[#A7B6D4]">Powered by Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F4F7FF] tracking-tight leading-[1.12]">
              Your Future Career <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#238BFF] via-[#53D8FF] to-[#7657FF]">
                Starts Here.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#A7B6D4] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Analyze your resume, discover your strengths, match your dream job, and build the skills your future needs — with AI-powered career guidance.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:from-[#238BFF] hover:to-[#53D8FF] shadow-[0_0_25px_rgba(35,139,255,0.45)] hover:shadow-[0_0_35px_rgba(83,216,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2.5 group"
              >
                <FileSearch className="w-4 h-4 text-white" />
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExplorePathsClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-[#A7B6D4] hover:text-[#F4F7FF] bg-[#0A1633]/60 hover:bg-[#07132E] border border-slate-700/60 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#A7B6D4]" />
                <span>Career Paths</span>
              </button>
            </div>

            {/* Three Concise Feature Highlights */}
            <div className="pt-8 border-t border-[#53D8FF]/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-9 h-9 rounded-lg bg-[#0A1633] border border-[#238BFF]/40 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#53D8FF]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#F4F7FF]">Smart Resume Analysis</p>
                  <p className="text-xs text-[#A7B6D4]">Extracts & scores fit</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-9 h-9 rounded-lg bg-[#0A1633] border border-[#7657FF]/40 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-[#7657FF]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#F4F7FF]">Personalized Roadmaps</p>
                  <p className="text-xs text-[#A7B6D4]">30/60/90-day trajectory</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-9 h-9 rounded-lg bg-[#0A1633] border border-[#53D8FF]/40 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-[#53D8FF]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#F4F7FF]">AI Career Guidance</p>
                  <p className="text-xs text-[#A7B6D4]">Interactive mentoring</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Original Cosmic Night-Sky Illustration */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[480px] aspect-square rounded-3xl bg-[#07132E]/70 border border-[#53D8FF]/20 p-5 shadow-[0_0_50px_rgba(35,139,255,0.25)] backdrop-blur-xl overflow-hidden group">
              {/* Internal Nebula Glows */}
              <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-[#7657FF]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#53D8FF]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Vector Constellation & Pathway Graphic */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full relative z-10 select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="beamGradient" x1="200" y1="360" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#238BFF" stopOpacity="0.1" />
                    <stop offset="40%" stopColor="#53D8FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7657FF" stopOpacity="0.8" />
                  </linearGradient>
                  <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#53D8FF" stopOpacity="1" />
                    <stop offset="40%" stopColor="#238BFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#238BFF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <circle cx="200" cy="180" r="140" stroke="#238BFF" strokeWidth="0.7" strokeDasharray="3 4" opacity="0.3" />
                <circle cx="200" cy="180" r="95" stroke="#53D8FF" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.4" />
                <circle cx="200" cy="180" r="50" stroke="#7657FF" strokeWidth="1" opacity="0.5" />

                <path d="M 200 340 L 120 180 L 150 90 L 200 60 L 260 90 L 280 180 Z" stroke="url(#beamGradient)" strokeWidth="1.5" strokeDasharray="4 2" />
                <line x1="200" y1="340" x2="200" y2="60" stroke="#53D8FF" strokeWidth="1.5" opacity="0.6" />
                <line x1="200" y1="340" x2="120" y2="180" stroke="#238BFF" strokeWidth="1.2" opacity="0.5" />
                <line x1="200" y1="340" x2="280" y2="180" stroke="#7657FF" strokeWidth="1.2" opacity="0.5" />

                <g>
                  <circle cx="200" cy="60" r="16" fill="url(#starGlow)" />
                  <circle cx="200" cy="60" r="6" fill="#F4F7FF" />
                  <text x="200" y="38" textAnchor="middle" fill="#53D8FF" fontSize="11" fontWeight="600" letterSpacing="0.5">
                    AI & FUTURE TECH
                  </text>
                </g>

                <g>
                  <circle cx="150" cy="90" r="12" fill="url(#starGlow)" opacity="0.7" />
                  <circle cx="150" cy="90" r="4.5" fill="#F4F7FF" />
                  <text x="120" y="85" textAnchor="middle" fill="#A7B6D4" fontSize="9.5">
                    Architecture
                  </text>
                </g>

                <g>
                  <circle cx="260" cy="90" r="12" fill="url(#starGlow)" opacity="0.7" />
                  <circle cx="260" cy="90" r="4.5" fill="#F4F7FF" />
                  <text x="290" y="85" textAnchor="middle" fill="#A7B6D4" fontSize="9.5">
                    Strategy
                  </text>
                </g>

                <g>
                  <circle cx="120" cy="180" r="14" fill="url(#starGlow)" opacity="0.8" />
                  <circle cx="120" cy="180" r="5" fill="#53D8FF" />
                  <text x="85" y="195" textAnchor="middle" fill="#A7B6D4" fontSize="9.5">
                    Full Stack
                  </text>
                </g>

                <g>
                  <circle cx="280" cy="180" r="14" fill="url(#starGlow)" opacity="0.8" />
                  <circle cx="280" cy="180" r="5" fill="#7657FF" />
                  <text x="315" y="195" textAnchor="middle" fill="#A7B6D4" fontSize="9.5">
                    Data & AI
                  </text>
                </g>

                <circle cx="80" cy="80" r="1.5" fill="#F4F7FF" opacity="0.8" />
                <circle cx="320" cy="70" r="2" fill="#53D8FF" opacity="0.9" />
                <circle cx="60" cy="240" r="1.5" fill="#F4F7FF" opacity="0.6" />
                <circle cx="340" cy="250" r="1.8" fill="#7657FF" opacity="0.8" />
                <circle cx="210" cy="130" r="2" fill="#53D8FF" opacity="0.9" />

                <path d="M 120 400 Q 200 330 280 400 Z" fill="#03091B" stroke="#238BFF" strokeWidth="1" />
                <path d="M 140 400 L 200 345 L 260 400 Z" fill="#07132E" />

                <path d="M 197 344 L 195 330 L 197 318 L 203 318 L 205 330 L 203 344 Z" fill="#F4F7FF" opacity="0.9" />
                <circle cx="200" cy="312" r="4.5" fill="#F4F7FF" opacity="0.95" />
                <circle cx="200" cy="326" r="18" fill="url(#starGlow)" opacity="0.3" />
              </svg>

              <div className="absolute bottom-4 left-4 right-4 bg-[#0A1633]/90 border border-[#53D8FF]/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-[#F4F7FF]">Cosmic Trajectory Engine</span>
                </div>
                <span className="text-[11px] text-[#53D8FF] font-semibold">Active & Grounded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};