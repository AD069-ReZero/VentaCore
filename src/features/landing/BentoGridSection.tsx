import React from 'react';
import { motion } from 'motion/react';
import { TextReveal } from '../../components/motion/TextReveal';
import { Shield, Eye, Lock, Cpu, Database, Network, Terminal, CheckCircle2, Zap } from 'lucide-react';

export const BentoGridSection: React.FC = () => {
  return (
    <section className="relative min-h-screen py-32 px-6 sm:px-10 lg:px-16 bg-[#070907] border-t border-white/5 overflow-hidden flex flex-col justify-center">
      <div className="relative z-10 max-w-[1440px] w-full mx-auto">
        {/* Header matching recording 00:23 */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
            <span className="text-[11px] font-mono tracking-widest text-[#70FF5E] uppercase">
              AI RUNTIME CONTROL PLANE
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
            <TextReveal mode="lines" stagger={0.08}>
              We are the AI runtime
            </TextReveal>
            <br />
            <span className="text-white">
              <TextReveal mode="lines" delay={0.15} stagger={0.08}>
                security control plane
              </TextReveal>
              <span className="text-[#70FF5E]">.</span>
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-[#8B9C8D] font-sans leading-relaxed">
            At VantaCore, our engine operates directly inline across autonomous multi-agent environments, protecting LLM applications with cryptographic rigor.
          </p>
        </div>

        {/* 5-Panel Bento Grid matching recording 00:26 - 00:32 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Laser Grid Matrix (Top Left, 5 cols) */}
          <div className="md:col-span-5 rounded-3xl bg-[#090C09] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-[#70FF5E]/40 transition-all duration-300">
            {/* Visual Green Laser Grid Lines */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#70FF5E]/15 to-transparent blur-xl pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#70ff5e08_1px,transparent_1px),linear-gradient(to_bottom,#70ff5e08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase">
                  CYBERSECURITY SOLUTIONS
                </span>
                <span className="text-xs font-mono text-[#8B9C8D]">[ 1.0 ]</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white tracking-tight mb-3">
                We provide runtime solutions for your autonomous agent security needs
              </h3>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-white/5 flex items-center gap-3 text-xs font-mono text-[#8B9C8D]">
              <div className="w-2 h-2 rounded-full bg-[#70FF5E]" />
              <span>INLINE PROXY ENFORCEMENT</span>
            </div>
          </div>

          {/* Card 2: Hardware Control Plane (Top Right, 7 cols) */}
          <div className="md:col-span-7 rounded-3xl bg-[#090C09] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-[#70FF5E]/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase">
                WE STAY UP TO DATE
              </span>
              <span className="text-xs font-mono text-[#8B9C8D]">[ 2.0 ]</span>
            </div>

            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Our focus is on staying ahead of the curve with the newest agent technologies
              </h3>
              <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans max-w-lg">
                Protecting Anthropic tool-use, OpenAI function calling, Model Context Protocol (MCP) servers, LangChain, and CrewAI frameworks.
              </p>
            </div>

            {/* Glowing Silicon Chip Device simulation matching recording */}
            <div className="mt-8 p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between font-mono text-xs text-[#8B9C8D]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0E150F] border border-[#70FF5E]/40 flex items-center justify-center text-[#70FF5E]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">GATEWAY_CORE_ASIC</div>
                  <div className="text-[10px] text-[#70FF5E]">STATUS: ACTIVE_FILTERING</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">0.84 ms</div>
                <div className="text-[10px]">AVG LATENCY</div>
              </div>
            </div>
          </div>

          {/* Card 3: Experience Stat Card (Bottom Left, 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-[#090C09] border border-white/10 p-8 flex flex-col justify-between group hover:border-[#70FF5E]/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase">
                ASSURANCE
              </span>
              <span className="text-xs font-mono text-[#8B9C8D]">[ 3.0 ]</span>
            </div>

            <div>
              <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">
                100%
              </div>
              <div className="font-mono text-sm text-[#70FF5E] mb-2">
                Deterministic Policy
              </div>
              <p className="text-xs text-[#8B9C8D] leading-relaxed">
                Cryptographic OPA policy bundles guarantee every single agent action has an authoritative, auditable decision.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 text-[11px] font-mono text-[#8B9C8D]">
              NO PROBABILISTIC LEAKS
            </div>
          </div>

          {/* Card 4: Radar / Biometric Eye Safeguarding (Bottom Center, 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-[#090C09] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-[#70FF5E]/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase">
                HOW WE CAN HELP
              </span>
              <span className="text-xs font-mono text-[#8B9C8D]">[ 4.0 ]</span>
            </div>

            {/* Glowing Biometric Iris Icon matching recording 00:30 */}
            <div className="my-auto py-4 flex flex-col items-center text-center">
              <div className="relative w-16 h-16 rounded-full bg-[#0E150F] border border-[#70FF5E]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(112,255,94,0.25)]">
                <Eye className="w-8 h-8 text-[#70FF5E]" />
                <div className="absolute inset-0 rounded-full border border-[#70FF5E]/30 animate-ping" />
              </div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Safeguarding your digital assets
              </h3>
            </div>

            <p className="text-xs text-[#8B9C8D] text-center">
              Drawing from real-world adversarial red teaming to protect mission-critical data.
            </p>
          </div>

          {/* Card 5: Customized Solutions (Bottom Right, 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-[#090C09] border border-white/10 p-8 flex flex-col justify-between group hover:border-[#70FF5E]/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase">
                CUSTOMIZED POLICIES
              </span>
              <span className="text-xs font-mono text-[#8B9C8D]">[ 5.0 ]</span>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
                Customized security per agent identity
              </h3>
              <p className="text-xs text-[#8B9C8D] leading-relaxed">
                Tailor risk thresholds and destination allowlists dynamically based on the agent's caller, context, and tenant tier.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B9C8D]">
              <span>RBAC & ABAC READY</span>
              <span className="text-[#70FF5E]">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
