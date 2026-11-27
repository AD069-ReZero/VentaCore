/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Integration Center View — Area 14: Integration Center
 * Connect AI frameworks, runtimes, and agents to the authoritative VantaCore security gateway.
 * 
 * Supported Integrations:
 * - Generic REST API
 * - Python SDK
 * - TypeScript SDK
 * - MCP (Model Context Protocol)
 * 
 * Coming Later:
 * - OpenAI
 * - LangChain / LangGraph
 * - AutoGen
 * - CrewAI
 * 
 * Developer Quickstart Guide (7 Steps):
 * 1. Install SDK / configure HTTP client
 * 2. Register Agent & obtain credentials
 * 3. Wrap tool calls with gateway proxy
 * 4. Pass taint context and provenance
 * 5. Handle policy decisions (ALLOW / REVIEW / BLOCK)
 * 6. Listen for approval webhooks
 * 7. Verify cryptographic audit receipts
 */

import React, { useState } from 'react';
import {
  Blocks,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
  BookOpen,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useIntegrations, useDeveloperQuickstart } from '../../api';
import { IntegrationCard } from '../../types/security';

export const IntegrationsView: React.FC = () => {
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations();
  const { data: quickstartSteps = [], isLoading: quickstartLoading } = useDeveloperQuickstart();

  const [activeTab, setActiveTab] = useState<'all' | 'supported' | 'coming_soon' | 'quickstart'>('all');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => {
      setCopiedStep(null);
    }, 2000);
  };

  const supportedCards = integrations.filter((i) => i.status === 'SUPPORTED');
  const comingLaterCards = integrations.filter((i) => i.status === 'COMING_LATER');

  if (integrationsLoading || quickstartLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Title & Top Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            INTEGRATION CENTER
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Connect AI frameworks, runtime agents, and MCP servers directly into the VantaCore security gateway.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] font-mono text-xs font-semibold">
            GATEWAY COMPATIBLE
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-[#70FF5E] text-black font-bold'
              : 'bg-white/5 text-[#8B9C8D] hover:text-white'
          }`}
        >
          All Integrations ({integrations.length})
        </button>
        <button
          onClick={() => setActiveTab('supported')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'supported'
              ? 'bg-[#70FF5E] text-black font-bold'
              : 'bg-white/5 text-[#8B9C8D] hover:text-white'
          }`}
        >
          Supported ({supportedCards.length})
        </button>
        <button
          onClick={() => setActiveTab('coming_soon')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'coming_soon'
              ? 'bg-[#70FF5E] text-black font-bold'
              : 'bg-white/5 text-[#8B9C8D] hover:text-white'
          }`}
        >
          Coming Later ({comingLaterCards.length})
        </button>
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'quickstart'
              ? 'bg-[#70FF5E] text-black font-bold'
              : 'bg-white/5 text-[#8B9C8D] hover:text-white'
          }`}
        >
          7-Step Quickstart ({quickstartSteps.length} Steps)
        </button>
      </div>

      {/* Section 1: Supported Integrations */}
      {(activeTab === 'all' || activeTab === 'supported') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
              <span>SUPPORTED INTEGRATIONS (PRODUCTION-READY GATEWAY CLIENTS)</span>
            </h2>
            <span className="font-mono text-xs text-[#8B9C8D]">
              Full AST, taint tracking, and decision token validation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportedCards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-[#70FF5E]/40 transition-all space-y-4 font-mono text-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <Terminal className="w-5 h-5 text-[#70FF5E]" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E]">
                      SUPPORTED
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{card.name}</h3>
                    <span className="text-[10px] text-[#4D5C50] uppercase">TYPE: {card.category}</span>
                  </div>

                  <p className="text-[11px] text-[#8B9C8D] font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="p-2 rounded bg-black/60 border border-white/5 text-[10px] text-[#38BDF8] truncate">
                    <code>{card.quickstartSnippet || 'Zero install required (HTTP)'}</code>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B9C8D]">
                    <span>Docs & Examples</span>
                    <a
                      href={card.docsUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#70FF5E] hover:underline flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Coming Later Integrations */}
      {(activeTab === 'all' || activeTab === 'coming_soon') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>COMING LATER (FRAMEWORK ADAPTER ROADMAP)</span>
            </h2>
            <span className="font-mono text-xs text-[#8B9C8D]">
              Direct framework integrations coming in subsequent milestone
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingLaterCards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-[#080B08] border border-white/5 hover:border-purple-500/30 transition-all space-y-4 font-mono text-xs flex flex-col justify-between opacity-80"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <Cpu className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      COMING LATER
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{card.name}</h3>
                    <span className="text-[10px] text-[#4D5C50] uppercase">TYPE: {card.category}</span>
                  </div>

                  <p className="text-[11px] text-[#8B9C8D] font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 text-[10px] text-[#4D5C50] flex items-center justify-between">
                  <span>Target: Post-Milestone R</span>
                  <span className="text-purple-300">Waitlist Open</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Developer Quickstart Guide (7 Steps) */}
      {(activeTab === 'all' || activeTab === 'quickstart') && (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#70FF5E]" />
                <span>DEVELOPER QUICKSTART GUIDE (7 STEPS)</span>
              </h2>
              <p className="text-xs text-[#8B9C8D] font-sans mt-0.5">
                Complete walkthrough to secure any AI agent runtime using the VantaCore zero-trust gateway.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-black/60 border border-white/10 text-white font-mono text-xs">
              7 AUTHORITATIVE STEPS
            </span>
          </div>

          <div className="space-y-4">
            {quickstartSteps.map((step) => {
              const snippetText = step.code.python || step.code.curl || Object.values(step.code)[0] || '';
              const isCopied = copiedStep === step.step;
              return (
                <div
                  key={step.step}
                  className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all space-y-3 font-mono text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] flex items-center justify-center font-bold text-xs shrink-0">
                        {step.step}
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {step.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(snippetText, step.step)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors self-start sm:self-auto text-[11px]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#70FF5E]" />
                          <span className="text-[#70FF5E]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[12px] text-[#8B9C8D] font-sans pl-9">
                    {step.description}
                  </p>

                  <div className="ml-9 p-3 rounded-xl bg-black/90 border border-white/10 overflow-x-auto text-[11px] text-[#38BDF8]">
                    <pre>
                      <code>{snippetText}</code>
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
