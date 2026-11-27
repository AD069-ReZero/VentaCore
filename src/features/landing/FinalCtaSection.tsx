import React from 'react';
import { motion } from 'motion/react';
import { BiometricRingParticles } from '../../components/canvas/BiometricRingParticles';
import { TextReveal } from '../../components/motion/TextReveal';
import { ShieldCheck, ArrowRight, Github, ExternalLink } from 'lucide-react';

interface FinalCtaSectionProps {
  onLaunchConsole?: () => void;
  onEnterLab?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onLaunchConsole,
  onEnterLab,
}) => {
  return (
    <section className="relative min-h-screen pt-28 pb-12 px-6 sm:px-10 lg:px-16 bg-[#050605] border-t border-white/5 overflow-hidden flex flex-col justify-between">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-radial from-[#70FF5E]/15 via-[#70FF5E]/02 to-transparent blur-3xl pointer-events-none" />

      {/* Main Centered CTA matching recording 00:35 - 00:39 */}
      <div className="relative z-10 max-w-3xl mx-auto text-center my-auto">
        {/* 3D Morphing Biometric Ring Particle Core */}
        <BiometricRingParticles />

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mt-4 flex items-center justify-center gap-3">
          <span>Secure Your Agents Today</span>
          <ShieldCheck className="w-8 h-8 text-[#70FF5E] inline-block" />
        </h2>

        <p className="mt-4 text-xs sm:text-sm text-[#8B9C8D] font-sans max-w-lg mx-auto leading-relaxed">
          Whenever you deploy autonomous tools, require runtime policy enforcement, or need real-time kill-chain prevention, VantaCore is ready.
        </p>

        {/* Centered Pill Button matching recording's 'Contact us (●)' button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLaunchConsole}
            className="group relative inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] hover:border-[#70FF5E]/60 text-xs font-mono tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(112,255,94,0.35)]"
          >
            <span className="font-medium">Launch VantaCore</span>
            <div className="w-7 h-7 rounded-full bg-[#090C09] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-2.5 h-2.5 rounded-full bg-[#70FF5E] shadow-[0_0_8px_#70FF5E]" />
            </div>
          </button>
        </div>
      </div>

      {/* Sleek Minimalist Footer matching recording 00:41 - 00:44 */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto pt-20 mt-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12">
          {/* Left Brand Statement matching DOTDNA — tailored digital security solutions */}
          <div className="md:col-span-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-sm bg-[#0E150F] border border-[#70FF5E]/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
              </div>
              <span className="font-display font-bold text-white tracking-wider text-lg">
                VANTACORE —
              </span>
            </div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug max-w-sm">
              tailored runtime security solutions<span className="text-[#70FF5E]">.</span>
            </div>
          </div>

          {/* Center-Right Columns matching recording layout */}
          <div className="md:col-span-2">
            <div className="text-[10px] font-mono text-[#70FF5E] uppercase tracking-widest mb-4">
              | SERVICES |
            </div>
            <ul className="space-y-2 text-xs font-sans text-[#8B9C8D]">
              <li className="hover:text-white transition-colors cursor-pointer">Detection and Response</li>
              <li className="hover:text-white transition-colors cursor-pointer">Offensive AI Testing</li>
              <li className="hover:text-white transition-colors cursor-pointer">OPA Policy Engine</li>
              <li className="hover:text-white transition-colors cursor-pointer">Kill-Chain Heuristics</li>
              <li className="hover:text-white transition-colors cursor-pointer">Advisory Services</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] font-mono text-[#70FF5E] uppercase tracking-widest mb-4">
              | EXPLORE |
            </div>
            <ul className="space-y-2 text-xs font-sans text-[#8B9C8D]">
              <li className="hover:text-white transition-colors cursor-pointer">Platform</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={onEnterLab}>
                AI Security Lab
              </li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={onLaunchConsole}>
                Security Console
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">Research Papers</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] font-mono text-[#70FF5E] uppercase tracking-widest mb-4">
              | CONNECT |
            </div>
            <ul className="space-y-2 text-xs font-sans text-[#8B9C8D]">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-[#70FF5E]" />
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3 text-[#70FF5E]" />
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">Discord Community</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright line matching recording */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#4D5C50]">
          <div>
            © Copyright 2026 by VantaCore Security Inc. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4 text-[#8B9C8D]">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Status</span>
          </div>
        </div>
      </div>
    </section>
  );
};
