import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  Layers,
  FolderGit2,
  Calendar,
  Check,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  GitCompare
} from 'lucide-react';
import { CareerFinderResult, RecommendedCareerPath } from '../types';

interface CareerFinderProps {
  sharedResumeText: string;
  sharedResumeName: string;
  onSendToChat?: (context: string) => void;
}

export const CareerFinder: React.FC<CareerFinderProps> = ({
  sharedResumeText,
  sharedResumeName,
  onSendToChat,
}) => {
  // Form State
  const [useResume, setUseResume] = useState(Boolean(sharedResumeText));
  const [qualification, setQualification] = useState('');
  const [existingSkills, setExistingSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [goals, setGoals] = useState('');

  // Results & Process State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerFinderResult | null>(null);

  // Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Active Roadmap Tab
  const [roadmapTab, setRoadmapTab] = useState<'30' | '60' | '90'>('30');

  // Quick preset qualifications
  const qualificationPresets = [
    'B.Com (Commerce / Finance)',
    'B.Tech / B.S. Computer Science',
    'B.A. Communications / Humanities',
    'Self-Taught / Bootcamp Graduate',
    'MBA / Business Administration',
  ];

  const handleApplyPreset = (preset: string) => {
    setQualification(preset);
  };

  const handleDiscoverPaths = async () => {
    if (!sharedResumeText && !qualification && !existingSkills && !interests) {
      setError('Please provide at least your current course/qualification, existing skills, or resume.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/career-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: useResume ? sharedResumeText : '',
          qualification,
          existingSkills,
          interests,
          preferredIndustry,
          goals,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate career paths.');
      }

      const data: CareerFinderResult = await response.json();
      setResult(data);
      if (data.recommendedCareerPaths.length >= 2) {
        setCompareIds([data.recommendedCareerPaths[0].id, data.recommendedCareerPaths[1].id]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while finding career paths.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompareId = (id: string) => {
    if (compareIds.includes(id)) {
      if (compareIds.length > 1) {
        setCompareIds(compareIds.filter((item) => item !== id));
      }
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const selectedPathsToCompare = result?.recommendedCareerPaths.filter((p) =>
    compareIds.includes(p.id)
  ) || [];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07132E] border border-[#7657FF]/30 text-xs font-medium text-[#7657FF]">
          <Compass className="w-3.5 h-3.5 text-[#53D8FF]" />
          <span>Cosmic Pathfinder</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
          Career & Skills Finder
        </h2>
        <p className="text-[#A7B6D4] text-base leading-relaxed">
          Map your background, interests, and aspirations into personalized high-growth career trajectories with actionable skill roadmaps.
        </p>
      </div>

      {/* Profile Builder Form */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#7657FF]/25 shadow-[0_0_35px_rgba(118,87,255,0.15)] space-y-8">
        {/* Resume link notice */}
        {sharedResumeText && (
          <div className="p-4 rounded-xl bg-[#07132E] border border-[#53D8FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#53D8FF] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#F4F7FF]">
                  Loaded Resume: {sharedResumeName || 'Candidate Profile'}
                </p>
                <p className="text-xs text-[#A7B6D4]">
                  Gemini will analyze your resume's real projects and education together with your inputs.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#53D8FF] font-medium shrink-0">
              <input
                type="checkbox"
                checked={useResume}
                onChange={(e) => setUseResume(e.target.checked)}
                className="rounded bg-[#0A1633] border-[#53D8FF]/30 text-[#238BFF] focus:ring-0"
              />
              Include Resume Data
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Course / Qualification */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#53D8FF]" />
              Current Course or Qualification
            </label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. B.Com, B.Tech CS, Data Science Bootcamp, Self-Taught..."
              className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] rounded-xl px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {qualificationPresets.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2 py-1 rounded-md bg-[#07132E] border border-slate-700 hover:border-[#53D8FF]/40 text-[#A7B6D4] hover:text-[#F4F7FF]"
                >
                  {p.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Existing Skills */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7657FF]" />
              Existing Skills & Strengths
            </label>
            <input
              type="text"
              value={existingSkills}
              onChange={(e) => setExistingSkills(e.target.value)}
              placeholder="e.g. Python, Excel, SQL, Copywriting, React, Project Management..."
              className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] rounded-xl px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none"
            />
            <p className="text-[11px] text-[#A7B6D4]">Comma-separated skills you already know</p>
          </div>

          {/* Career Interests */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#53D8FF]" />
              Career Interests & Passions
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Product Design, Fintech, Cloud Systems..."
              className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] rounded-xl px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none"
            />
          </div>

          {/* Preferred Industry & Goals */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#F4F7FF] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#7657FF]" />
              Short-Term & Long-Term Goals
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Land first junior developer job in 6 months, transition to AI..."
              className="w-full bg-[#07132E] border border-[#53D8FF]/20 focus:border-[#53D8FF] rounded-xl px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleDiscoverPaths}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(118,87,255,0.4)] ${
              loading
                ? 'bg-[#0E224D] cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-[#7657FF] via-[#238BFF] to-[#53D8FF] hover:shadow-[0_0_35px_rgba(83,216,255,0.6)]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 text-[#53D8FF] animate-spin" />
                <span>Mapping personalized career trajectories with Gemini AI...</span>
              </>
            ) : (
              <>
                <Compass className="w-5 h-5 text-[#53D8FF]" />
                <span>Discover Recommended Career Paths</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Candidate Profile Summary & Priority Skills */}
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#53D8FF] font-semibold">Profile Synthesis</span>
              <h3 className="font-display text-2xl font-bold text-[#F4F7FF]">
                Your Career Foundation & Trajectory
              </h3>
              <p className="text-[#A7B6D4] text-sm sm:text-base leading-relaxed">
                {result.userProfileSummary}
              </p>
            </div>

            {/* Skills You Have vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#53D8FF]/15">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Skills You Already Possess ({result.possessedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.possessedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#53D8FF]">
                  Skills to Prioritize Next
                </h4>
                <div className="space-y-2">
                  {result.skillsToPrioritizeNext.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#07132E] border border-[#53D8FF]/15 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#53D8FF]" />
                        <span className="font-semibold text-[#F4F7FF]">{item.skill}</span>
                        <span className="text-[11px] text-[#A7B6D4]">({item.importance})</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#238BFF]/20 text-[#53D8FF] font-medium">
                        {item.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Recommended Career Paths */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7657FF] font-semibold">High Potential Matches</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
                  Recommended Career Trajectories
                </h3>
              </div>

              {/* Compare toggle */}
              {result.recommendedCareerPaths.length >= 2 && (
                <button
                  onClick={() => setIsComparing(!isComparing)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isComparing
                      ? 'bg-[#7657FF] text-white border-[#7657FF]'
                      : 'bg-[#0A1633] text-[#53D8FF] border-[#53D8FF]/30 hover:bg-[#07132E]'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{isComparing ? 'Close Comparison' : 'Compare Career Paths'}</span>
                </button>
              )}
            </div>

            {/* Side-by-Side Comparison Tool (when active) */}
            {isComparing && selectedPathsToCompare.length === 2 && (
              <div className="cosmic-card rounded-2xl p-6 border-2 border-[#7657FF]/40 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#53D8FF]/15 pb-4">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-[#53D8FF]" />
                    <h4 className="font-display text-lg font-bold text-[#F4F7FF]">
                      Side-by-Side Trajectory Comparison
                    </h4>
                  </div>
                  <span className="text-xs text-[#A7B6D4]">Comparing 2 Career Paths</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPathsToCompare.map((path) => (
                    <div key={path.id} className="p-5 rounded-xl bg-[#07132E] border border-[#53D8FF]/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-[#F4F7FF] text-base">{path.title}</h5>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#238BFF]/20 text-[#53D8FF] font-semibold">
                          {path.fitScore}% Fit
                        </span>
                      </div>
                      <p className="text-xs text-[#A7B6D4] leading-relaxed">{path.whyItSuits}</p>

                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                          Your Existing Strengths:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {path.existingStrengths.map((s, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-[#53D8FF] font-semibold">
                          Key Skills to Learn:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {path.skillsToLearn.map((s, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#0A1633] text-[#53D8FF] border border-[#53D8FF]/20">
                              + {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50">
                        <span className="text-[11px] text-[#A7B6D4] block mb-1 font-medium">Potential Entry Roles:</span>
                        <p className="text-xs text-[#F4F7FF] font-medium">{path.entryLevelRoles.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Path Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {result.recommendedCareerPaths.map((path) => {
                const isSelectedForCompare = compareIds.includes(path.id);
                return (
                  <div
                    key={path.id}
                    className={`cosmic-card rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${
                      isSelectedForCompare ? 'border-[#53D8FF]/60 shadow-[0_0_25px_rgba(83,216,255,0.2)]' : ''
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Title & Fit Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-display text-xl font-bold text-[#F4F7FF] leading-snug">
                            {path.title}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-extrabold text-[#53D8FF]">
                            {path.fitScore}% Fit
                          </span>
                        </div>
                      </div>

                      {/* Why it suits */}
                      <p className="text-xs text-[#A7B6D4] leading-relaxed">
                        {path.whyItSuits}
                      </p>

                      {/* Strengths */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Existing Strengths
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {path.existingStrengths.map((str, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                              {str}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills to Learn */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-[#53D8FF] uppercase tracking-wider">
                          Skills to Learn
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {path.skillsToLearn.map((sk, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#07132E] border border-[#53D8FF]/20 text-[#A7B6D4]">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practical Projects */}
                      <div className="space-y-2 pt-2 border-t border-[#53D8FF]/10">
                        <span className="text-[11px] font-semibold text-[#7657FF] uppercase tracking-wider flex items-center gap-1">
                          <FolderGit2 className="w-3.5 h-3.5" />
                          Practical Portfolio Project
                        </span>
                        {path.practicalProjects.slice(0, 1).map((proj, i) => (
                          <div key={i} className="p-3 rounded-lg bg-[#07132E] border border-slate-700/50 space-y-1">
                            <p className="text-xs font-semibold text-[#F4F7FF]">{proj.title}</p>
                            <p className="text-[11px] text-[#A7B6D4]">{proj.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.techStack.map((tech, ti) => (
                                <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded bg-[#0A1633] text-[#53D8FF]">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Entry Roles */}
                      <div className="pt-1">
                        <span className="text-[11px] text-[#A7B6D4] block font-medium">Entry-Level Roles:</span>
                        <p className="text-xs text-[#F4F7FF] font-medium mt-0.5">
                          {path.entryLevelRoles.join(' · ')}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-4 border-t border-[#53D8FF]/10 space-y-3">
                      <div className="p-2.5 rounded-lg bg-[#07132E] border border-[#53D8FF]/15 text-xs text-[#53D8FF]">
                        <strong>Recommended Next Action:</strong> {path.recommendedNextAction}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCompareId(path.id)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                            isSelectedForCompare
                              ? 'bg-[#53D8FF]/20 border-[#53D8FF] text-[#53D8FF]'
                              : 'bg-[#07132E] border-slate-700 text-[#A7B6D4] hover:text-[#F4F7FF]'
                          }`}
                        >
                          {isSelectedForCompare ? '✓ Selected for Compare' : '+ Compare'}
                        </button>

                        {onSendToChat && (
                          <button
                            type="button"
                            onClick={() =>
                              onSendToChat(
                                `I want to pursue the "${path.title}" career path. My recommended next action is: "${path.recommendedNextAction}". What should I learn first?`
                              )
                            }
                            className="p-2 rounded-lg bg-[#07132E] hover:bg-[#7657FF]/20 border border-[#7657FF]/30 text-[#7657FF] hover:text-[#F4F7FF]"
                            title="Discuss with AI Guide"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured 30, 60, 90-day learning roadmap */}
          <div className="cosmic-card rounded-3xl p-6 sm:p-10 border border-[#238BFF]/30 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#53D8FF]/15 pb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#53D8FF] font-semibold">Step-by-Step Evolution</span>
                <h3 className="font-display text-2xl font-bold text-[#F4F7FF]">
                  Structured 30 / 60 / 90-Day Learning Roadmap
                </h3>
              </div>

              {/* Segmented control */}
              <div className="flex items-center gap-1 p-1 bg-[#07132E] rounded-xl border border-[#53D8FF]/20">
                <button
                  onClick={() => setRoadmapTab('30')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    roadmapTab === '30'
                      ? 'bg-[#238BFF] text-white shadow-[0_0_15px_rgba(35,139,255,0.4)]'
                      : 'text-[#A7B6D4] hover:text-white'
                  }`}
                >
                  30 Days (Foundation)
                </button>
                <button
                  onClick={() => setRoadmapTab('60')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    roadmapTab === '60'
                      ? 'bg-[#7657FF] text-white shadow-[0_0_15px_rgba(118,87,255,0.4)]'
                      : 'text-[#A7B6D4] hover:text-white'
                  }`}
                >
                  60 Days (Applied Projects)
                </button>
                <button
                  onClick={() => setRoadmapTab('90')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    roadmapTab === '90'
                      ? 'bg-[#53D8FF] text-[#03091B] shadow-[0_0_15px_rgba(83,216,255,0.4)] font-bold'
                      : 'text-[#A7B6D4] hover:text-white'
                  }`}
                >
                  90 Days (Job Readiness)
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {roadmapTab === '30' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#53D8FF] text-sm font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>30-Day Milestone Focus</span>
                  </div>
                  <p className="text-base text-[#F4F7FF] font-medium">
                    {result.learningRoadmap.thirtyDays.focus}
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.thirtyDays.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#238BFF]/20 text-[#53D8FF] flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-[#07132E]/80 border border-[#238BFF]/20 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-[#53D8FF] font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Concrete Deliverables by Day 30
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.thirtyDays.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">✦</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {roadmapTab === '60' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#7657FF] text-sm font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>60-Day Milestone Focus</span>
                  </div>
                  <p className="text-base text-[#F4F7FF] font-medium">
                    {result.learningRoadmap.sixtyDays.focus}
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.sixtyDays.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#7657FF]/20 text-[#7657FF] flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-[#07132E]/80 border border-[#7657FF]/20 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-[#7657FF] font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Concrete Deliverables by Day 60
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.sixtyDays.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#7657FF]">✦</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {roadmapTab === '90' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#53D8FF] text-sm font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>90-Day Milestone Focus</span>
                  </div>
                  <p className="text-base text-[#F4F7FF] font-medium">
                    {result.learningRoadmap.ninetyDays.focus}
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.ninetyDays.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#53D8FF]/20 text-[#53D8FF] flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-[#07132E]/80 border border-[#53D8FF]/20 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-[#53D8FF] font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Portfolio & Career Deliverables by Day 90
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A7B6D4]">
                    {result.learningRoadmap.ninetyDays.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#53D8FF]">✦</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
