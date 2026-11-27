import React from 'react';
import { motion } from 'motion/react';
import { AgentScannerHUD } from '../../components/canvas/AgentScannerHUD';
import { TextReveal } from '../../components/motion/TextReveal';
import { Shield, Eye, Scan, Cpu } from 'lucide-react';

interface AssetAtlasSectionProps {
  onLaunchConsole?: () => void;
}

export const AssetAtlasSection: React.FC<AssetAtlasSectionProps> = ({ onLaunchConsole }) => {
  return (
    <section
      id="asset-atlas"
      className="relative min-h-screen py-28 px-6 sm:px-10 lg:px-16 bg-[#050605] overflow-hidden flex flex-col justify-center"
    >
      {/* Intense Volumetric Vertical Laser Light Pillar (Matching recording 00:09) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 sm:w-8 h-[450px] bg-gradient-to-b from-[#70FF5E] via-[#70FF5E]/60 to-transparent blur-md pointer-events-none opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[350px] bg-radial from-[#70FF5E]/30 via-[#70FF5E]/05 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] w-full mx-auto">
        {/* Top Split Header matching recording 00:09 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-2xl">
              <TextReveal mode="lines" stagger={0.1}>
                Know your assets, behavior,
              </TextReveal>
              <br />
              <TextReveal mode="lines" delay={0.15} stagger={0.1}>
                and risks. All in one place.
              </TextReveal>
            </h2>

            <div className="mt-6">
              <button
                onClick={onLaunchConsole}
                className="group relative inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] hover:border-[#70FF5E]/60 text-xs font-mono tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(112,255,94,0.3)]"
              >
                <span>Inspect Agents</span>
                <div className="w-6 h-6 rounded-full bg-[#090C09] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
                  <div className="w-2 h-2 rounded-full bg-[#70FF5E] shadow-[0_0_8px_#70FF5E]" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Technical Badge & Paragraph matching recording */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right pt-2">
            <div className="text-xs font-mono text-[#70FF5E] tracking-widest uppercase mb-3">
              | AGENTATLAS |
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[#8B9C8D] font-sans leading-relaxed">
              AgentAtlas continuously identifies autonomous agents, maps tool permissions, streams live deliberations, and uncovers stealth policy violations across your toolchain.
            </p>
          </div>
        </div>

        {/* Central HUD Scanner Card matching recording 00:10 - 00:14 */}
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-[#080B08]/90 border border-white/[0.12] p-4 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Top Green Flare Reflection */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-[#70FF5E] blur-sm shadow-[0_0_20px_#70FF5E]" />

          {/* Animated Horizontal Scan Beam */}
          <motion.div
            animate={{ y: [0, 320, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#70FF5E] to-transparent pointer-events-none shadow-[0_0_12px_#70FF5E] z-20"
          />

          {/* Central Biometric Targeting Brackets [   ] matching recording */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-48 sm:w-60 h-48 sm:h-60">
              {/* Top-left bracket */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#70FF5E] rounded-tl-lg" />
              {/* Top-right bracket */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#70FF5E] rounded-tr-lg" />
              {/* Bottom-left bracket */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#70FF5E] rounded-bl-lg" />
              {/* Bottom-right bracket */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#70FF5E] rounded-br-lg" />

              {/* Center reticle horizontal bar */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#70FF5E]/60 -translate-y-1/2" />
            </div>
          </div>

          {/* 3D Wireframe Neural / Face Mesh Canvas */}
          <AgentScannerHUD />

          {/* Bottom HUD Metadata matching recording 00:12 */}
          <div className="relative z-20 pt-4 flex items-end justify-between border-t border-white/5 font-mono text-xs">
            <div>
              <div className="text-white text-xs sm:text-sm font-semibold tracking-wider">
                2026 / 10 / 15
              </div>
              <div className="text-[#70FF5E] text-[10px] sm:text-xs tracking-widest uppercase mt-0.5">
                AGENT RUNTIME INSPECTION
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider hidden sm:inline">
                STATUS: VERIFIED_IDENTITY
              </span>
              <div className="px-2 py-0.5 rounded bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[10px] text-[#70FF5E]">
                PASSED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
