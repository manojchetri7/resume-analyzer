import React, { useState } from 'react';
import { Sparkles, Compass, FileText, Info, Menu, X, Trash2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'analyzer' | 'career-finder' | 'about';
  setActiveTab: (tab: 'home' | 'analyzer' | 'career-finder' | 'about') => void;
  onClearSession: () => void;
  hasResumeLoaded: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onClearSession,
  hasResumeLoaded,
  mobileMenuOpen: controlledMobileMenuOpen,
  setMobileMenuOpen: setControlledMobileMenuOpen,
}) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const mobileMenuOpen = controlledMobileMenuOpen !== undefined ? controlledMobileMenuOpen : internalMobileMenuOpen;
  const setMobileMenuOpen = setControlledMobileMenuOpen || setInternalMobileMenuOpen;

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileText },
    { id: 'career-finder', label: 'Career & Skills Finder', icon: Compass },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  const handleNavClick = (id: typeof navItems[number]['id']) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#03091B]/80 border-b border-[#53D8FF]/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#53D8FF] rounded-lg"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#238BFF] via-[#7657FF] to-[#53D8FF] p-[1.5px] shadow-[0_0_20px_rgba(35,139,255,0.4)]">
            <div className="w-full h-full bg-[#07132E] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#53D8FF] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-[#F4F7FF] flex items-center gap-1.5">
              Resume Analyzer <span className="text-[#53D8FF]">AI</span>
            </span>
            <span className="text-[11px] text-[#A7B6D4] tracking-wider uppercase font-medium">
              Resume Intelligence & Pathing
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-all rounded-lg relative ${
                  isActive
                    ? 'text-[#F4F7FF] bg-[#0A1633] border border-[#53D8FF]/30 shadow-[0_0_15px_rgba(83,216,255,0.15)]'
                    : 'text-[#A7B6D4] hover:text-[#F4F7FF] hover:bg-[#07132E]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#53D8FF]' : 'text-[#A7B6D4]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-[#53D8FF] to-transparent" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {hasResumeLoaded