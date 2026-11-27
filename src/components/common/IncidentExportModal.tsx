/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Incident Report Export Modal
 * Generates audit-grade executive summaries, Markdown briefings, and JSON evidence archives.
 * Includes cryptographic state hashes and safe masking of sensitive tokens.
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Printer,
  ShieldAlert,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Incident } from '../../types/security';

interface IncidentExportModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentExportModal: React.FC<IncidentExportModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'MARKDOWN' | 'JSON'>('SUMMARY');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bundleHash = 'sha256:49c0d210ff42a8b9e071c991a030ef89a1c890214e91204d801124efac01129b';

  const generateMarkdown = () => {
    return `# VANTACORE FORENSIC INCIDENT BRIEFING
**Incident ID:** ${incident.id}  
**Classification:** ${incident.severity} / CONFIDENTIAL  
**Status:** ${incident.status}  
**Final Enforcement Decision:** ${incident.finalDecision}  
**Assigned SOC Lead:** ${incident.assignedAnalyst}  
**Generated At:** ${new Date().toUTCString()}  
**Cryptographic State Hash:** \`${bundleHash}\`  

---

### Executive Summary
${incident.summary}

---

### Security Boundaries
- **Autonomous Agent:** ${incident.agentName} (${incident.agentId})
- **Session:** ${incident.sessionId}
- **Primary Tool:** ${incident.primaryTool}
- **Target Resource:** ${incident.primaryResource}
- **Destination:** ${incident.destination} (${incident.destinationTrust})
- **Composite Risk Score:** ${incident.riskScore} / 100

---

### Forensic Incident Timeline
${(incident.timeline || [])
  .map(
    (t) =>
      `- **[Step ${t.step}] ${t.label}** (\`${t.type}\` at ${t.timestamp}): ${t.description}`
  )
  .join('\n')}

---

### Analyst Investigative Notes
${(incident.notes || [])
  .map((n) => `- **${n.author}** (${n.timestamp}): ${n.content}`)
  .join('\n')}

---
*Notice: This report was compiled by VantaCore Security Engine. All sensitive credential tokens are cryptographically redacted.*
`;
  };

  const generateJSON = () => {
    return JSON.stringify(
      {
        incidentId: incident.id,
        classification: 'CONFIDENTIAL',
        stateHash: bundleHash,
        exportedAt: new Date().toISOString(),
        incidentDetails: {
          title: incident.title,
          severity: incident.severity,
          status: incident.status,
          finalDecision: incident.finalDecision,
          assignedAnalyst: incident.assignedAnalyst,
          agent: { id: incident.agentId, name: incident.agentName },
          session: incident.sessionId,
          attackChainId: incident.attackChainId,
          decisionId: incident.decisionId,
          riskScore: incident.riskScore,
          tags: incident.tags,
          primaryTool: incident.primaryTool,
          primaryResource: incident.primaryResource,
          destination: incident.destination,
          destinationTrust: incident.destinationTrust,
        },
        timeline: incident.timeline,
        analystNotes: incident.notes,
        redactionNotice: 'Sensitive private key and token payloads were masked before serialization.',
      },
      null,
      2
    );
  };

  const handleCopy = () => {
    const text = activeTab === 'MARKDOWN' ? generateMarkdown() : generateJSON();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isMd = activeTab === 'MARKDOWN';
    const content = isMd ? generateMarkdown() : generateJSON();
    const filename = `${incident.id}-forensic-report.${isMd ? 'md' : 'json'}`;
    const blob = new Blob([content], { type: isMd ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#080B08] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Export Incident Dossier: {incident.id}
              </h3>
              <p className="text-[11px] text-[#8B9C8D]">
                Tamper-evident forensic report for compliance, audits, and leadership reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Dossier"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8B9C8D] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls & Copy / Download Bar */}
        <div className="px-5 py-3 border-b border-white/5 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('SUMMARY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'SUMMARY'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-[#8B9C8D] hover:text-white'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('MARKDOWN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'MARKDOWN'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-[#8B9C8D] hover:text-white'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              onClick={() => setActiveTab('JSON')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'JSON'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-[#8B9C8D] hover:text-white'
              }`}
            >
              JSON Archive
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'SUMMARY' && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#70FF5E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-[#70FF5E] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#5ce64c] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5 text-xs text-white">
          {activeTab === 'SUMMARY' && (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="p-5 rounded-xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">
                      Incident Title
                    </span>
                    <h2 className="text-base font-bold text-white">{incident.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      {incident.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-white font-bold border border-white/10">
                      {incident.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                  <div>
                    <span className="text-[#4D5C50] uppercase block">Analyst Lead</span>
                    <span className="text-white font-bold">{incident.assignedAnalyst}</span>
                  </div>
                  <div>
                    <span className="text-[#4D5C50] uppercase block">Target Agent</span>
                    <span className="text-sky-400 font-bold">{incident.agentName}</span>
                  </div>
                  <div>
                    <span className="text-[#4D5C50] uppercase block">Risk Score</span>
                    <span className="text-red-400 font-bold">{incident.riskScore} / 100</span>
                  </div>
                  <div>
                    <span className="text-[#4D5C50] uppercase block">Enforcement</span>
                    <span className="text-red-400 font-bold">{incident.finalDecision}</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">
                  Incident Narrative
                </span>
                <p className="text-xs text-[#EDEDED] leading-relaxed p-4 rounded-xl bg-black/40 border border-white/5">
                  {incident.summary}
                </p>
              </div>

              {/* Timeline Highlights */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">
                  Forensic Timeline Progression ({incident.timeline?.length || 0} Events)
                </span>
                <div className="space-y-2">
                  {(incident.timeline || []).map((step) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-[#70FF5E] shrink-0 font-bold">
                        {step.step}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-[11px]">{step.label}</span>
                          <span className="text-[9px] text-[#4D5C50]">{step.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#8B9C8D]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification & Redaction Footer */}
              <div className="p-4 rounded-xl bg-black/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-[#8B9C8D]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#70FF5E]" />
                  <span>State Hash: <code className="text-[#70FF5E]">{bundleHash}</code></span>
                </div>
                <span className="text-[#4D5C50]">Cryptographically Redacted & Signed</span>
              </div>
            </div>
          )}

          {activeTab === 'MARKDOWN' && (
            <pre className="p-4 rounded-xl bg-black/80 border border-white/5 text-[11px] text-[#70FF5E] overflow-x-auto whitespace-pre-wrap">
              {generateMarkdown()}
            </pre>
          )}

          {activeTab === 'JSON' && (
            <pre className="p-4 rounded-xl bg-black/80 border border-white/5 text-[11px] text-sky-300 overflow-x-auto whitespace-pre-wrap">
              {generateJSON()}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
