import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { TextReveal } from '../../components/motion/TextReveal';
import { TechnicalReveal } from '../../components/motion/TechnicalReveal';
import { SectionReveal } from '../../components/motion/SectionReveal';
import { Eye, Activity, Lock, ArrowUpRight, Cpu } from 'lucide-react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

export const ProductStatement: React.FC = () => {
  const statementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !statementRef.current) return;
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    if (isHeadless) return;

    // Subtle GSAP scroll parallax for the statement block
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-parallax-badge',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statementRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, statementRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionReveal
      id="why-vantacore"
      className="py-32 px-6 md:px-12 lg:px-20 border-t border-white/5 bg-[#070907] overflow-hidden"
    >
      <div ref={statementRef} className="max-w-6xl mx-auto">
        {/* Technical Section Identifier */}
        <div className="flex items-center gap-3 mb-8">
          <TechnicalReveal
            text="[ 02 // SECURITY CONTEXT ]"
            className="text-[#70FF5E]"
          />
          <div className="h-px flex-1 max-w-xs bg-white/10" />
          <span className="text-[10px] font-mono text-[#4D5C50] uppercase tracking-widest hidden sm:inline">
            SYSTEM DIRECTIVE
          </span>
        </div>

        {/* Massive Editorial Headline with Line-by-Line Reveal */}
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] max-w-5xl">
          <TextReveal mode="lines" stagger={0.12} duration={0.9}>
            AI agents should never act
          </TextReveal>
          <br />
          <span className="text-[#8B9C8D]">
            <TextReveal mode="lines" delay={0.2} stagger={0.12} duration={0.9}>
              without runtime security context.
            </TextReveal>
          </span>
        </h2>

        {/* Editorial Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-base md:text-xl text-[#8B9C8D] font-sans font-light max-w-3xl leading-relaxed"
        >
          When language models transition from stateless chatbots into autonomous operators
          executing arbitrary shell commands, querying production databases, and reading API credentials,
          perimeter firewalls are bypassed from within. VantaCore enforces the deterministic boundary
          at invocation time.
        </motion.p>

        {/* Three Core Cards with Staggered Entrance */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gsap-parallax-badge group p-8 rounded-xl bg-[#090B09] border border-white/5 hover:border-[#70FF5E]/40 transition-all duration-300 hover:shadow-[0_10px_35px_-10px_rgba(112,255,94,0.12)]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#0E150F] border border-[#70FF5E]/30 flex items-center justify-center text-[#70FF5E] group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#4D5C50] group-hover:text-[#70FF5E] transition-colors">
                [ 1.0 ]
              </span>
            </div>
            <div className="font-mono text-sm text-white font-medium mb-2 flex items-center gap-2">
              <span>Observe</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
            </div>
            <p className="text-xs text-[#8B9C8D] leading-relaxed">
              Sub-millisecond taint tracking across multi-turn agent deliberations, prompt injections, untrusted web tool results, and parameter tampering.
            </p>
          </div>

          <div className="gsap-parallax-badge group p-8 rounded-xl bg-[#090B09] border border-white/5 hover:border-[#70FF5E]/40 transition-all duration-300 hover:shadow-[0_10px_35px_-10px_rgba(112,255,94,0.12)]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#0E150F] border border-[#70FF5E]/30 flex items-center justify-center text-[#70FF5E] group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#4D5C50] group-hover:text-[#70FF5E] transition-colors">
                [ 2.0 ]
              </span>
            </div>
            <div className="font-mono text-sm text-white font-medium mb-2 flex items-center gap-2">
              <span>Understand</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
            </div>
            <p className="text-xs text-[#8B9C8D] leading-relaxed">
              Attack chain correlation engine that links benign-looking isolated tool actions to detect multi-stage data exfiltration and credential theft.
            </p>
          </div>

          <div className="gsap-parallax-badge group p-8 rounded-xl bg-[#090B09] border border-white/5 hover:border-[#70FF5E]/40 transition-all duration-300 hover:shadow-[0_10px_35px_-10px_rgba(112,255,94,0.12)]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#0E150F] border border-[#70FF5E]/30 flex items-center justify-center text-[#70FF5E] group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#4D5C50] group-hover:text-[#70FF5E] transition-colors">
                [ 3.0 ]
              </span>
            </div>
            <div className="font-mono text-sm text-white font-medium mb-2 flex items-center gap-2">
              <span>Enforce</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
            </div>
            <p className="text-xs text-[#8B9C8D] leading-relaxed">
              Zero-latency inline policy gate evaluating OPA bundles with cryptographic proof, enforcing deterministic ALLOW, REVIEW, or BLOCK decisions.
            </p>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
};
