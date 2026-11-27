import React from 'react';
import { motion } from 'motion/react';
import { HeroParticles } from '../../components/canvas/HeroParticles';
import { TextReveal } from '../../components/motion/TextReveal';
import { ArrowDown, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onLaunchConsole?: () => void;
  onEnterLab?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchConsole,
  onEnterLab,
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-10 px-6 sm:px-10 lg:px-16 overflow-hidden bg-[#050605]"
    >
      {/* 3D Volumetric Neural Particle Cloud */}
      <HeroParticles />

      {/* Atmospheric Volumetric Green Light from top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none opacity-70 vanta-beam-glow"
        aria-hidden="true"
      />

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 vanta-noise pointer-events-none opacity-25" />

      {/* Main Grid: Exact Asymmetrical Layout from Recording */}
      <div className="relative z-10 my-auto max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Defending the Agent + Contact/Launch Pill */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Micro Category Tag with Pipe Bars matching recording: | CYBER SECURITY | */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="text-xs font-mono text-[#70FF5E] tracking-widest uppercase">
              | AI RUNTIME SECURITY |
            </span>
          </motion.div>

          {/* Huge Editorial Headline: Defending the Agent */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold tracking-tight text-white leading-[0.95]">
            <TextReveal mode="lines" stagger={0.12} duration={0.9}>
              Defending
            </TextReveal>
            <br />
            <TextReveal mode="lines" delay={0.15} stagger={0.12} duration={0.9}>
              the Agent
            </TextReveal>
          </h1>

          {/* Pill Action Button matching recording's left-aligned button position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onLaunchConsole}
              className="group relative inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] hover:border-[#70FF5E]/60 text-xs font-mono tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(112,255,94,0.35)]"
            >
              <span className="font-medium">Launch Control Plane</span>
              <div className="w-7 h-7 rounded-full bg-[#090C09] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-2.5 h-2.5 rounded-full bg-[#70FF5E] shadow-[0_0_8px_#70FF5E]" />
              </div>
            </button>

            <button
              onClick={onEnterLab}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent hover:bg-white/[0.05] border border-white/10 hover:border-[#70FF5E]/30 text-xs font-mono text-[#8B9C8D] hover:text-white transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-[#70FF5E]" />
              <span>Simulate Attack</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Lower-offset Counterpart 'on the execution.' matching recording */}
        <div className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right pt-6 lg:pt-24">
          {/* Asymmetric offset headline matching 'on the Dot.' */}
          <div className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[0.95] mb-5">
            <span className="block text-white">
              <TextReveal mode="words" delay={0.2} stagger={0.08}>
                on the
              </TextReveal>
            </span>
            <span className="block text-white whitespace-nowrap">
              <TextReveal mode="words" delay={0.3} stagger={0.08}>
                execution
              </TextReveal>
              <span className="text-[#70FF5E]">.</span>
            </span>
          </div>

          {/* Editorial body paragraph matching recording's right column body copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-sm text-sm text-[#8B9C8D] font-sans font-normal leading-relaxed mb-6"
          >
            We secure autonomous tool-using agents by intercepting actions before sensitive APIs, files, databases, and credentials are breached.
          </motion.p>

          {/* Core Tenet Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-2 lg:justify-end"
          >
            <div className="px-3 py-1 rounded-md bg-[#090C09]/90 border border-white/10 text-[11px] font-mono text-[#EDEDED] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
              OBSERVE
            </div>
            <div className="px-3 py-1 rounded-md bg-[#090C09]/90 border border-white/10 text-[11px] font-mono text-[#EDEDED] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
              UNDERSTAND
            </div>
            <div className="px-3 py-1 rounded-md bg-[#090C09]/90 border border-white/10 text-[11px] font-mono text-[#EDEDED] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
              ENFORCE
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero Bottom Bar: Clean, spacious, with 'Scroll to explore' on left */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto pt-6 flex items-center justify-between text-xs font-mono text-[#8B9C8D]">
        <a
          href="#asset-atlas"
          className="inline-flex items-center gap-2 text-[#8B9C8D] hover:text-[#70FF5E] transition-colors group"
        >
          <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-[#70FF5E] flex items-center justify-center transition-colors">
            <ArrowDown className="w-2.5 h-2.5 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <span className="tracking-widest uppercase text-[10px]">Scroll to explore</span>
        </a>

        {/* Clean right indicator matching minimalist breathing room */}
        <div className="text-[10px] font-mono text-[#4D5C50] tracking-wider uppercase hidden sm:block">
          ZERO-TRUST EXECUTION CONTROL // v1.4
        </div>
      </div>
    </section>
  );
};
