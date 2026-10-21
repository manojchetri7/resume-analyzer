import React, { useState } from 'react';
import { Sparkles, Send, Undo2, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import { ResumeData } from '../types';

interface AiResumeEditorProps {
  currentResume: ResumeData;
  onApplyChanges: (updated: ResumeData) => void;
}

export const AiResumeEditor: React.FC<AiResumeEditorProps> = ({
  currentResume,
  onApplyChanges,
}) => {
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staged AI review state
  const [pendingChanges, setPendingChanges] = useState<{
    updatedResume: ResumeData;
    changedSections: string[];
    changeSummary: string;
    aiNote?: string;
  } | null>(null);

  // History for Undo
  const [previousVersion, setPreviousVersion] = useState<ResumeData | null>(null);

  const samplePrompts = [
    'Rewrite my professional summary for an entry-level Data Analyst role.',
    'Add my Python college project with bullet points on Pandas and Flask.',
    'Improve the wording of my internship to sound more impactful and professional.',
    'Highlight my problem solving and modern web development skills.',
    'Make the resume bullet points more concise and action-oriented.',
  ];

  const handleApplyAiChanges = async (promptToUse?: string) => {
    const textPrompt = (promptToUse || instructions).trim();
    if (!textPrompt) {
      setError('Please type instructions for what you want the AI to change in your resume.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-resume-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentResume,
          instructions: textPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process AI changes.');
      }

      if (!data.updatedResume) {
        throw new Error('AI returned an unexpected format.');
      }

      // Stage changes for user review before making them active
      setPendingChanges({
        updatedResume: data.updatedResume,
        changedSections: data.changedSections || [],
        changeSummary: data.changeSummary || 'Applied targeted enhancements to requested sections.',
        aiNote: data.aiNote,
      });
    } catch (err: any) {
      console.error('AI Resume Edit error:', err);
      setError(err.message || 'Unable to apply AI changes right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptChanges = () => {
    if (!pendingChanges) return;
    setPreviousVersion(currentResume);
    onApplyChanges(pendingChanges.updatedResume);
    setPendingChanges(null);
    setInstructions('');
  };

  const handleDiscardChanges = () => {
    setPendingChanges(null);
  };

  const handleUndo = () => {
    if (previousVersion) {
      onApplyChanges(previousVersion);
      setPreviousVersion(null);
    }
  };

  return (
    <div className="cosmic-card rounded-2xl p-5 border border-[#7657FF]/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7657FF] to-[#238BFF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(118,87,255,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#F4F7FF]">Tell AI What You Want to Change</h3>
            <p className="text-[11px] text-[#A7B6D4]">
              Instruct Gemini in natural language. Review and accept every edit before it applies.
            </p>
          </div>
        </div>

        {previousVersion && (
          <button
            type="button"
            onClick={handleUndo}
            className="px-3 py-1.5 rounded-lg bg-[#07132E] hover:bg-[#0A1633] border border-slate-700 text-[#53D8FF] text-xs font-medium flex items-center gap-1.5"
            title="Undo previous AI change"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo AI Edit</span>
          </button>
        )}
      </div>

      {/* Input box */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. 'Rewrite my professional summary for a junior React developer', 'Highlight Python in my skills', 'Add my e-commerce project with Express and MongoDB'..."
            className="w-full px-3.5 py-2.5 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-xs text-[#F4F7FF] placeholder-[#A7B6D4]/60 focus:outline-none focus:border-[#53D8FF] leading-relaxed resize-none"
          />
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-[#A7B6D4] font-medium mr-1">Quick ideas:</span>
          {samplePrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInstructions(prompt);
                handleApplyAiChanges(prompt);
              }}
              className="text-[10.5px] px-2.5 py-1 rounded-md bg-[#07132E] hover:bg-[#0A1633] border border-[#53D8FF]/20 text-[#A7B6D4] hover:text-[#53D8FF] transition-colors truncate max-w-[240px]"
            >
              ✦ {prompt}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={isProcessing || !instructions.trim()}
            onClick={() => handleApplyAiChanges()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] via-[#7657FF] to-[#53D8FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(35,139,255,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying AI Changes...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Apply AI Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* REVIEW & APPROVAL DRAWER */}
      {pendingChanges && (
        <div className="p-4 rounded-xl bg-[#07132E] border-2 border-emerald-500/40 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                AI Preview Ready for Review
              </span>
              <h4 className="text-sm font-bold text-[#F4F7FF]">Review Proposed Changes</h4>
              <p className="text-xs text-[#A7B6D4] leading-relaxed">
                {pendingChanges.changeSummary}
              </p>
            </div>
          </div>

          {pendingChanges.changedSections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <span className="text-[11px] text-[#A7B6D4]">Modified Sections:</span>
              {pendingChanges.changedSections.map((sec, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#0A1633] border border-[#53D8FF]/30 text-[#53D8FF] text-[10.5px] font-medium"
                >
                  {sec}
                </span>
              ))}
            </div>
          )}

          {pendingChanges.aiNote && (
            <div className="p-2.5 rounded-lg bg-[#0A1633] border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{pendingChanges.aiNote}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleAcceptChanges}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Apply to Resume</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
