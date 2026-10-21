import React from 'react';
import { Sparkles, Shield, Heart, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: 'home' | 'analyzer' | 'career-finder' | 'career-guide' | 'about') => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenPrivacy }) => {
  return (
    <footer className="relative z-10 border-t border-[#53D8FF]/10 bg-[#03091B]/95 pt-16 pb-12 mt-32 text-xs text-[#A7B6D4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#238BFF] to-[#7657FF] p-[1.5px] shadow-[0_0_15px_rgba(35,139,255,0.4)]">
                <div className="w-full h-full bg-[#07132E] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#53D8FF]" />
                </div>
              </div>
              <span className="font-display font-bold text-lg text-[#F4F7FF]">
                Cosmic Career <span className="text-[#53D8FF]">AI</span>
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[#A7B6D4]">
              Intelligent resume analysis, personalized skill pathfinding, and career mentorship powered by Google Gemini AI. Guiding ambitious candidates toward their next horizon.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#53D8FF]">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero data harvesting · Ephemeral document analysis</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#F4F7FF] uppercase tracking-wider text-[11px]">
              Platform Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavClick('home')}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('analyzer')}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  Resume Analyzer & Job Matcher
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('career-finder')}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  Career & Skills Finder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('career-guide')}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  AI Career Guide Chatbot
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('about')}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  About & Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#F4F7FF] uppercase tracking-wider text-[11px]">
              Legal & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  Privacy Policy & Data Handling
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#53D8FF] transition-colors"
                >
                  Terms of Service & Disclaimers
                </button>
              </li>
              <li>
                <span className="flex items-center gap-1 text-[#A7B6D4]">
                  <Mail className="w-3.5 h-3.5 text-[#53D8FF]" />
                  <span>support@cosmiccareer.ai (Placeholder)</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="pt-8 border-t border-[#53D8FF]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7B6D4]/80">
          <p>
            © {new Date().getFullYear()} Cosmic Career AI. Match scores and roadmaps are algorithmic estimations to aid career preparation, not formal hiring guarantees.
          </p>
          <p className="flex items-center gap-1">
            Engineered with Gemini 3.8 Flash
          </p>
        </div>
      </div>
    </footer>
  );
};
