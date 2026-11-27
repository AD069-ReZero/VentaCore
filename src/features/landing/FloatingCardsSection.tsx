import React from 'react';
import { motion } from 'motion/react';
import { TextReveal } from '../../components/motion/TextReveal';
import { ShieldAlert, Zap, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface FloatingCard {
  index: string;
  badge: string;
  headline: string;
  subtext: string;
  icon: React.ReactNode;
}

const CARDS: FloatingCard[] = [
  {
    index: '1.0',
    badge: 'RUNTIME INTERCEPTION',
    headline: 'Automated Threat Detection and Response. 10x Faster',
    subtext: 'We integrate directly into tool invocation pipelines to enable automated incident response, intercepting unauthorized shell execution and memory poisoning in sub-millisecond cycles.',
    icon: <Zap className="w-4 h-4 text-[#70FF5E]" />,
  },
  {
    index: '2.0',
    badge: 'COMPLIANCE & AUDIT',
    headline: 'Autonomous Agent Governance for High-Stakes Production',
    subtext: 'VantaCore enables enterprises deploying LLM agents into finance, healthcare, and infrastructure to attain cryptographic tamper-proof audit trails and verifiable OPA boundaries.',
    icon: <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />,
  },
  {
    index: '3.0',
    badge: 'ADVERSARIAL TESTING',
    headline: 'Continuous AI Red-Teaming & 100+ Attack Simulations',
    subtext: 'We synthesize indirect prompt injection vectors, jailbreaks, and SSRF tool exploits to rigorously stress-test and fortify your autonomous agents before live deployment.',
    icon: <ShieldAlert className="w-4 h-4 text-[#70FF5E]" />,
  },
];

export const FloatingCardsSection: React.FC = () => {
  return (
    <section className="relative min-h-screen py-32 px-6 sm:px-10 lg:px-16 bg-[#050605] overflow-hidden flex flex-col justify-center">
      {/* Background Green Nebula Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-radial from-[#70FF5E]/12 via-[#70FF5E]/03 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] w-full mx-auto">
        {/* Centered Editorial Title matching recording 00:16: 'Tailored digital security solutions' */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
            <TextReveal mode="lines" stagger={0.08}>
              Tailored runtime
            </TextReveal>
            <br />
            <span className="text-white">
              <TextReveal mode="lines" delay={0.15} stagger={0.08}>
                security solutions
              </TextReveal>
              <span className="text-[#70FF5E]">.</span>
            </span>
          </h2>
        </div>

        {/* 3 Floating Staggered Cards with 3D Depth matching recording 00:18 - 00:22 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {CARDS.map((card, idx) => (
            <motion.div
              key={card.index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, delay: idx * 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative p-8 rounded-3xl bg-[#080B08]/90 border border-white/[0.10] hover:border-[#70FF5E]/40 transition-all duration-500 hover:shadow-[0_20px_45px_-10px_rgba(112,255,94,0.18)] flex flex-col justify-between ${
                idx === 1 ? 'md:-translate-y-6 md:bg-[#0A0E0A]/95' : ''
              }`}
            >
              {/* Card Header with Icon and [ 1.0 ] micro-index */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-9 h-9 rounded-xl bg-[#0D150E] border border-white/10 flex items-center justify-center group-hover:border-[#70FF5E]/50 group-hover:scale-105 transition-all">
                    {card.icon}
                  </div>
                  <span className="font-mono text-xs text-[#8B9C8D] group-hover:text-[#70FF5E] transition-colors">
                    [ {card.index} ]
                  </span>
                </div>

                <div className="text-[10px] font-mono tracking-widest text-[#70FF5E] uppercase mb-3">
                  {card.badge}
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-4 group-hover:text-white transition-colors">
                  {card.headline}
                </h3>

                <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans leading-relaxed">
                  {card.subtext}
                </p>
              </div>

              {/* Bottom Card Micro-Detail */}
              <div className="pt-8 mt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B9C8D]">
                <span>VANTACORE PROTOCOL</span>
                <ArrowUpRight className="w-4 h-4 text-[#70FF5E] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
