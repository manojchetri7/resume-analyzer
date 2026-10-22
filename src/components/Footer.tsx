import React from 'react';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: 'home' | 'analyzer' | 'career-finder' | 'about') => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenPrivacy }) => {
  return (
    <footer className="border-t border-[#53D8FF]/10 bg-[#03091B] pt-16 pb-12 text-[#A7B6D4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#238BFF] to-[#7657FF] p-[1px]">
              <div className="w-full h-full bg-[#07132E] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#53D8FF]" />
              </div>
            </div>
            <span className="font-display font-bold text-base text-[#F4F7FF]">
              Resume Analyzer <span className="text-[#53D8FF]">AI</span>
            </span>
          </div>
          <p className="text-xs text-[#A7B6D4] max-w-sm leading-relaxed">
            Intelligent resume analysis, personalized skill pathfinding, and career intelligence powered by Google Gemini AI.
          </p>
          <p className="text-[11px] text-slate-500">
            🔒 Zero data harvesting · Ephemeral browser document analysis
          </p>
        </div>

        {/* Navigation Links */}
        <div className="md:col-span-3 space-y-3">
          <p className="text-xs font-semibold text-[#F4F7FF] uppercase tracking-wider">Platform Navigation</p>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavClick('home')} className="hover:text-[#53D8FF] transition-colors">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick('analyzer')} className="hover:text-[#53D8FF] transition-colors">
                Resume Analyzer & Job Matcher
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick('career-finder')} className="hover:text-[#53D8FF] transition-colors">
                Career & Skills Finder
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick('about')} className="hover:text-[#53D8FF] transition-colors">
                About & Methodology
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Support */}
        <div className="md:col-span-3 space-y-3">
          <p className="text-xs font-semibold text-[#F4F7FF] uppercase tracking-wider">Legal & Support</p>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={onOpenPrivacy} className="hover:text-[#53D8FF] transition-colors">
                Privacy Policy & Data Handling
              </button>
            </li>
            <li>
              <button onClick={onOpenPrivacy} className="hover:text-[#53D8FF] transition-colors">
                Terms of Service & Disclaimers
              </button>
            </li>
            <li>
              <a href="mailto:manojchetri45@gmail.com" className="text-[#53D8FF] hover:underline text-xs">
                manojchetri45@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#53D8FF]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <p>© 2026 Resume Analyzer AI. Match scores and roadmaps are algorithmic estimations to aid career preparation.</p>
        <p>Engineered with Gemini</p>
      </div>
    </footer>
  );
};