import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { SectionReveal } from '../../components/motion/SectionReveal';
import { TextReveal } from '../../components/motion/TextReveal';
import { TechnicalReveal } from '../../components/motion/TechnicalReveal';
import { Globe, AlertTriangle, Key, Send, ShieldAlert, ArrowDown, Ban, Cpu } from 'lucide-react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

interface ChainNode {
  step: string;
  title: string;
  detail: string;
  status: 'normal' | 'suspicious' | 'critical';
  icon: React.ReactNode;
}

const NODES: ChainNode[] = [
  {
    step: '01',
    title: 'External Web Fetch',
    detail: 'Agent crawls third-party documentation page via web.get()',
    status: 'normal',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    step: '02',
    title: 'UNTRUSTED_INPUT',
    detail: 'Hidden text snippet in HTML contains adversarial prompt override',
    status: 'suspicious',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    step: '03',
    title: 'Prompt Injection Activated',
    detail: 'LLM instruction boundary compromised; model adopts jailbreak objective',
    status: 'suspicious',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    step: '04',
    title: 'Secret Credential Read',
    detail: 'Agent requests file.read(/etc/secrets/stripe_live.key)',
    status: 'suspicious',
    icon: <Key className="w-4 h-4" />,
  },
  {
    step: '05',
    title: 'Outbound HTTP POST',
    detail: 'Agent attempts egress to external dropzone endpoint',
    status: 'critical',
    icon: <Send className="w-4 h-4" />,
  },
  {
    step: '06',
    title: 'EXFILTRATION_CHAIN Correlated',
    detail: 'VantaCore correlates 5 distinct events into singular kill-chain',
    status: 'critical',
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  {
    step: '07',
    title: 'FINAL DECISION: BLOCK',
    detail: 'Execution halted at runtime. Egress killed. Session quarantined.',
    status: 'critical',
    icon: <Ban className="w-4 h-4" />,
  },
];

export const AttackChainSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    if (isHeadless) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.attack-chain-node',
        { opacity: 0, x: -30, scale: 0.96 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionReveal
      id="attack-chains"
      className="py-32 px-6 md:px-12 lg:px-20 border-t border-white/5 bg-[#070907] overflow-hidden"
    >
      <div ref={containerRef} className="max-w-6xl mx-auto">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <TechnicalReveal text="[ 05 // ATTACK CHAIN CORRELATION ]" className="text-[#70FF5E]" />
          <div className="h-px flex-1 max-w-xs bg-white/10" />
          <span className="text-[10px] font-mono text-[#4D5C50] uppercase tracking-widest hidden sm:inline">
            KILL CHAIN HEURISTIC
          </span>
        </div>

        {/* Section Headline */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
            <TextReveal mode="lines">Individual actions may</TextReveal>
            <br />
            <TextReveal mode="lines" delay={0.15}>
              look completely harmless.
            </TextReveal>
            <br />
            <span className="text-[#EF4444]">
              <TextReveal mode="words" delay={0.3}>
                The chain does not.
              </TextReveal>
            </span>
          </h2>
          <p className="mt-6 text-sm md:text-base text-[#8B9C8D] font-light leading-relaxed">
            Standard API gateways evaluate requests in complete isolation. An agent reading a file is allowed;
            an agent making an HTTP request is allowed. VantaCore tracks taint propagation across the entire
            session life-cycle to detect and sever multi-step exfiltration kill chains.
          </p>
        </div>

        {/* Visual Attack Chain Pipeline */}
        <div className="relative">
          {/* Vertical connection track */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-white/10 via-[#F59E0B]/30 to-[#EF4444] hidden md:block" />

          <div className="space-y-4">
            {NODES.map((node, i) => {
              const isNormal = node.status === 'normal';
              const isSuspicious = node.status === 'suspicious';
              const isCritical = node.status === 'critical';

              return (
                <div
                  key={node.step}
                  className={`attack-chain-node relative p-4 sm:p-5 rounded-xl border transition-all duration-300 md:ml-12 ${
                    isCritical
                      ? 'bg-[#120808] border-[#EF4444]/40 hover:border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                      : isSuspicious
                      ? 'bg-[#100D08] border-[#F59E0B]/30 hover:border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                      : 'bg-[#090C09] border-white/5 hover:border-[#70FF5E]/30'
                  }`}
                >
                  {/* Left node connector dot on the track */}
                  <div
                    className={`hidden md:flex absolute -left-[3.25rem] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border items-center justify-center font-mono text-[10px] ${
                      isCritical
                        ? 'border-[#EF4444] bg-black text-[#EF4444]'
                        : isSuspicious
                        ? 'border-[#F59E0B] bg-black text-[#F59E0B]'
                        : 'border-[#70FF5E] bg-black text-[#70FF5E]'
                    }`}
                  >
                    {node.step}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isCritical
                            ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                            : isSuspicious
                            ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                            : 'bg-[#70FF5E]/10 border-[#70FF5E]/30 text-[#70FF5E]'
                        }`}
                      >
                        {node.icon}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-white flex items-center gap-2">
                          <span>{node.title}</span>
                          {node.step === '07' && (
                            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
                          {node.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded border uppercase ${
                          isCritical
                            ? 'border-[#EF4444]/40 text-[#EF4444] bg-[#EF4444]/10'
                            : isSuspicious
                            ? 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/10'
                            : 'border-[#70FF5E]/40 text-[#70FF5E] bg-[#70FF5E]/10'
                        }`}
                      >
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
};
