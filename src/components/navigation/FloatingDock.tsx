import React from 'react';
import { LayoutDashboard } from 'lucide-react';

interface FloatingDockProps {
  onLaunchConsole?: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onLaunchConsole }) => {
  return (
    <nav
      aria-label="Quick Section Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-[#080B08]/85 border border-white/[0.12] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)]"
    >
      <a
        href="#hero"
        className="px-4 py-1.5 rounded-full text-xs font-mono text-[#EDEDED] hover:text-[#70FF5E] hover:bg-white/[0.06] transition-colors"
      >
        Home
      </a>
      <a
        href="#asset-atlas"
        className="px-4 py-1.5 rounded-full text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] hover:bg-white/[0.06] transition-colors"
      >
        Services
      </a>
      <a
        href="#runtime-security"
        className="px-4 py-1.5 rounded-full text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] hover:bg-white/[0.06] transition-colors"
      >
        Product
      </a>
      <a
        href="#attack-chains"
        className="px-4 py-1.5 rounded-full text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] hover:bg-white/[0.06] transition-colors"
      >
        Attack Chains
      </a>
      <div className="w-[1px] h-3.5 bg-white/10 mx-1" />
      <button
        onClick={onLaunchConsole}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#70FF5E] hover:bg-[#70FF5E]/10 transition-colors"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Console</span>
      </button>
    </nav>
  );
};
