import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onLaunchConsole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchConsole }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050605]/80 backdrop-blur-md border-b border-white/[0.06] py-3.5'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Brand: Clean typographical identity matching 'DC DOTDNA' in recording */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md bg-[#0C140D] border border-[#70FF5E]/30 flex items-center justify-center transition-all group-hover:border-[#70FF5E] group-hover:shadow-[0_0_12px_rgba(112,255,94,0.4)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white group-hover:text-[#70FF5E] transition-colors">
              VANTACORE
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#8B9C8D] uppercase hidden sm:inline">
              // CONTROL PLANE
            </span>
          </div>
        </a>

        {/* Top-Right Pill Action: Matching recording's exact 'Contact us' toggle pill design */}
        <button
          onClick={onLaunchConsole}
          className="group relative inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-[#70FF5E]/50 text-xs font-mono tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(112,255,94,0.3)]"
        >
          <span className="font-medium">Launch Console</span>
          {/* Circular toggle switch with glowing acid-green dot */}
          <div className="w-7 h-7 rounded-full bg-[#090C09] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-2.5 h-2.5 rounded-full bg-[#70FF5E] shadow-[0_0_8px_#70FF5E] transition-all group-hover:shadow-[0_0_14px_#70FF5E]" />
          </div>
        </button>
      </div>
    </header>
  );
};
