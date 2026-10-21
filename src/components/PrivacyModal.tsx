import React from 'react';
import { X, Shield, Lock, Trash2, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSession: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03091B]/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl cosmic-card rounded-3xl p-6 sm:p-8 border border-[#53D8FF]/30 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#53D8FF]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center text-[#53D8FF]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[#F4F7FF]">
                Privacy Policy & Data Handling
              </h3>
              <p className="text-xs text-[#A7B6D4]">Cosmic Career AI Security Commitment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#07132E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#A7B6D4] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. Ephemeral In-Memory Processing
            </h4>
            <p>
              Uploaded resume PDFs and job descriptions are ingested directly into ephemeral runtime memory. They are analyzed by Google Gemini AI and immediately discarded after the JSON response is compiled. No resume files are written to public persistent databases or file disks.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. No Third-Party Commercial Sale
            </h4>
            <p>
              Your contact details, employment history, and education records are never sold, rented, or distributed to recruiters, marketers, or data brokers.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3. Immediate Session Deletion
            </h4>
            <p>
              You maintain full sovereignty over your browser session. Clicking "Clear Session Data" purges all in-memory resume data, loaded text, and cached analyses immediately.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4. AI Preparation Disclaimer
            </h4>
            <p>
              Cosmic Career AI provides guidance and alignment analysis. AI fit percentages are analytical estimations and do not represent guaranteed job offers or hiring determinations made by prospective employers.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#53D8FF]/15">
          <button
            onClick={() => {
              onClearSession();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-[#07132E] hover:bg-rose-950/30 border border-rose-500/30 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Current Session Now</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#238BFF] to-[#7657FF]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
