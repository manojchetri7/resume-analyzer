import React, { useState } from 'react';
import { CosmicBackground } from './components/CosmicBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { CareerFinder } from './components/CareerFinder';
import { AdditionalSections } from './components/AdditionalSections';
import { Footer } from './components/Footer';
import { PrivacyModal } from './components/PrivacyModal';
import { Sparkles, Shield, Compass, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'analyzer' | 'career-finder' | 'about'>('home');
  const [sharedResumeText, setSharedResumeText] = useState('');
  const [sharedResumeName, setSharedResumeName] = useState('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClearSession = () => {
    setSharedResumeText('');
    setSharedResumeName('');
    showToast('Session data and resume buffers cleared successfully.');
  };

  const handleExploreCareersFromResume = (resumeText: string) => {
    if (resumeText && !sharedResumeText) {
      setSharedResumeText(resumeText);
    }
    setActiveTab('career-finder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#03091B] text-[#F4F7FF] selection:bg-[#238BFF]/30 selection:text-[#53D8FF]">
      {/* Dynamic Cosmic Background */}
      <CosmicBackground />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClearSession={handleClearSession}
          hasResumeLoaded={Boolean(sharedResumeText || sharedResumeName)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#07132E] border border-emerald-500/40 text-emerald-300 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Main Body per Tab */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {activeTab === 'home' && (
            <div className="space-y-24">
              <Hero
                onAnalyzeClick={() => {
                  setActiveTab('analyzer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExplorePathsClick={() => {
                  setActiveTab('career-finder');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* Inline Resume Analyzer Section */}
              <section id="analyzer-section" className="scroll-mt-24">
                <ResumeAnalyzer
                  onSendToChat={() => {}}
                  onExploreCareers={handleExploreCareersFromResume}
                  sharedResumeText={sharedResumeText}
                  setSharedResumeText={setSharedResumeText}
                  sharedResumeName={sharedResumeName}
                  setSharedResumeName={setSharedResumeName}
                />
              </section>

              {/* Additional Sections */}
              <AdditionalSections
                onStartAnalyze={() => {
                  setActiveTab('analyzer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {activeTab === 'analyzer' && (
            <div className="space-y-16 animate-in fade-in duration-300">
              <ResumeAnalyzer
                onSendToChat={() => {}}
                onExploreCareers={handleExploreCareersFromResume}
                sharedResumeText={sharedResumeText}
                setSharedResumeText={setSharedResumeText}
                sharedResumeName={sharedResumeName}
                setSharedResumeName={setSharedResumeName}
              />
              <AdditionalSections
                onStartAnalyze={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>
          )}

          {activeTab === 'career-finder' && (
            <div className="space-y-16 animate-in fade-in duration-300">
              <CareerFinder
                sharedResumeText={sharedResumeText}
                sharedResumeName={sharedResumeName}
                onSendToChat={() => {}}
              />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#53D8FF]">
                  Our Mission & Methodology
                </span>
                <h2 className="font-display text-4xl font-bold text-[#F4F7FF]">
                  About Resume Analyzer AI
                </h2>
                <p className="text-[#A7B6D4] text-base leading-relaxed">
                  Bridging the gap between candidate ambitions and actual modern industry demands with transparent, data-driven career intelligence.
                </p>
              </div>

              <div className="cosmic-card rounded-3xl p-8 sm:p-10 border border-[#53D8FF]/20 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold text-[#F4F7FF] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#53D8FF]" />
                    Designed to Counter Superficial ATS Rejections
                  </h3>
                  <p className="text-sm text-[#A7B6D4] leading-relaxed">
                    Most traditional applicant tracking systems (ATS) rely on crude string matching, rejecting talented applicants simply because a synonym was used. Resume Analyzer AI uses Google Gemini to evaluate conceptual depth, transferable technical foundations, and project execution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#53D8FF]/15">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Responsible AI Policy
                    </h4>
                    <p className="text-xs text-[#A7B6D4] leading-relaxed">
                      We never fabricate placement statistics, salary guarantees, or job promises. The match score is an algorithmic preparation guide meant to illuminate blind spots and prioritize upskilling.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-[#F4F7FF] flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#7657FF]" />
                      Continuous Learning Roadmap
                    </h4>
                    <p className="text-xs text-[#A7B6D4] leading-relaxed">
                      Instead of leaving you with a list of missing keywords, our pathfinder crafts practical 30, 60, and 90-day execution milestones with real portfolio project recommendations.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#53D8FF]/15 flex items-center justify-between">
                  <span className="text-xs text-[#A7B6D4]">Ready to evaluate your trajectory?</span>
                  <button
                    onClick={() => {
                      setActiveTab('analyzer');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-xs font-semibold text-white shadow-lg"
                  >
                    Analyze Resume Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer
          onNavClick={(tab: any) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPrivacy={() => setPrivacyModalOpen(true)}
        />

        {/* Privacy Terms Modal */}
        <PrivacyModal
          isOpen={privacyModalOpen}
          onClose={() => setPrivacyModalOpen(false)}
          onClearSession={handleClearSession}
        />
      </div>
    </div>
  );
}