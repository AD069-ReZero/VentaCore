/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Unified Investigation Workspace
 * Route: /console/investigations/:incidentId
 * 
 * Central forensic environment unifying:
 * - Incident Case Management (Status, Severity, Analyst, Tags, Notes)
 * - Multi-Step Forensic Timeline & Bookmarked Evidence
 * - Provenance Explorer (Source-to-Sink Lineage Graph)
 * - Taint Flow Explorer (Propagating Taint Trace)
 * - Risk Explainability (Factor Attribution & Confidence Drivers)
 * - Policy Dry-Run & Backtesting Integration
 * - Cryptographic Report Export (Markdown / JSON / Executive Dossier)
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Plus,
  X,
  FileText,
  GitBranch,
  Layers,
  Scale,
  Wrench,
  AlertOctagon,
  FileCheck,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Send,
  Download,
  Activity,
  History,
  AlertTriangle,
} from 'lucide-react';
import {
  useInvestigation,
  useUpdateIncidentStatus,
  useUpdateIncidentSeverity,
  useAssignIncidentAnalyst,
  useAddIncidentNote,
  useAddIncidentTag,
  useRemoveIncidentTag,
  useToggleBookmarkEvidence,
  useIncidentProvenance,
  useIncidentTaintFlow,
  useIncidentRiskExplanation,
} from '../../api';
import { IncidentStatus, RiskLevel } from '../../types/security';
import {
  RiskBadge,
  DecisionBadge,
  DestinationTrustBadge,
} from '../../components/common/SecurityBadges';
import { RiskExplainabilityCard } from '../../components/common/RiskExplainabilityCard';
import { ProvenanceExplorer } from '../../components/common/ProvenanceExplorer';
import { TaintFlowExplorer } from '../../components/common/TaintFlowExplorer';
import { PolicyBacktestModal } from '../../components/common/PolicyBacktestModal';
import { IncidentExportModal } from '../../components/common/IncidentExportModal';

export const InvestigationDetailsView: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const { data: incident, isLoading, isError, error } = useInvestigation(incidentId);
  const { data: provenance } = useIncidentProvenance(incidentId);
  const { data: taintFlow } = useIncidentTaintFlow(incidentId);
  const { data: riskExplanation } = useIncidentRiskExplanation(incidentId);

  // Mutations
  const updateStatus = useUpdateIncidentStatus();
  const updateSeverity = useUpdateIncidentSeverity();
  const assignAnalyst = useAssignIncidentAnalyst();
  const addNote = useAddIncidentNote();
  const addTag = useAddIncidentTag();
  const removeTag = useRemoveIncidentTag();
  const toggleBookmark = useToggleBookmarkEvidence();

  // Local UI States
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'PROVENANCE' | 'TAINT' | 'RISK' | 'POLICY'>('TIMELINE');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);

  // Form States for Case Management
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Alex Vance (SOC Lead)');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-pulse font-mono">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4 font-mono">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-[#8B9C8D]">
          {(error as Error)?.message || `Incident ID ${incidentId} could not be located in forensic repository.`}
        </p>
        <Link
          to="/console/investigations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Investigations</span>
        </Link>
      </div>
    );
  }

  // Handle Case Updates
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    await updateStatus.mutateAsync({ id: incident.id, status: newStatus });
  };

  const handleSeverityChange = async (newSev: RiskLevel) => {
    await updateSeverity.mutateAsync({ id: incident.id, severity: newSev });
  };

  const handleAnalystChange = async (analystName: string) => {
    await assignAnalyst.mutateAsync({ id: incident.id, analyst: analystName });
  };

  const handleAddTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    await addTag.mutateAsync({ incidentId: incident.id, tag: newTagInput.trim().toUpperCase() });
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    await removeTag.mutateAsync({ incidentId: incident.id, tag: tagToRemove });
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmittingNote(true);
    await addNote.mutateAsync({
      incidentId: incident.id,
      author: noteAuthor,
      content: noteContent.trim(),
    });
    setNoteContent('');
    setIsSubmittingNote(false);
  };

  const handleToggleBookmark = async (evidenceId: string) => {
    await toggleBookmark.mutateAsync({ incidentId: incident.id, evidenceId });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/console/investigations"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider">
                Forensic Case Dossier
              </span>
              <span className="text-[10px] text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {incident.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {incident.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsBacktestOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#70FF5E]" />
            <span>Policy Dry-Run</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#70FF5E] text-black text-xs font-bold flex items-center gap-2 hover:bg-[#5ce64c] transition-colors shadow-lg shadow-[#70FF5E]/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Case Header & Triage Bar */}
      <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
          {/* Status & Severity Controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Workflow Status
              </span>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white font-bold focus:outline-none focus:border-[#70FF5E] text-xs cursor-pointer"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CONTAINED">CONTAINED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Severity Rating
              </span>
              <select
                value={incident.severity}
                onChange={(e) => handleSeverityChange(e.target.value as RiskLevel)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-red-400 font-bold focus:outline-none focus:border-red-400 text-xs cursor-pointer"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Assigned SOC Lead
              </span>
              <select
                value={incident.assignedAnalyst}
                onChange={(e) => handleAnalystChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-[#8B9C8D] focus:outline-none focus:border-[#70FF5E] text-xs cursor-pointer"
              >
                <option value="Alex Vance (Senior SOC Lead)">Alex Vance (Senior SOC Lead)</option>
                <option value="Marcus Thorne (SecOps)">Marcus Thorne (SecOps)</option>
                <option value="Elena Rostova (Incident Commander)">Elena Rostova (Incident Commander)</option>
                <option value="Sarah Chen (Security Researcher)">Sarah Chen (Security Researcher)</option>
              </select>
            </div>
          </div>

          {/* Right Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-[#4D5C50] uppercase block">Gatekeeper Action</span>
              <div className="mt-0.5">
                <DecisionBadge decision={incident.finalDecision} size="md" />
              </div>
            </div>
            <div className="text-right pl-4 border-l border-white/5">
              <span className="text-[10px] text-[#4D5C50] uppercase block">Risk Score</span>
              <span className="text-base font-bold text-red-400">
                {incident.riskScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Universal Entity Cross-Link Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider mr-2">
            Correlated Entities:
          </span>

          {incident.agentId && (
            <Link
              to={`/console/agents/${incident.agentId}`}
              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{incident.agentName}</span>
            </Link>
          )}

          {incident.sessionId && (
            <Link
              to={`/console/sessions/${incident.sessionId}`}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{incident.sessionId}</span>
            </Link>
          )}

          {incident.attackChainId && (
            <Link
              to={`/console/attack-chains/${incident.attackChainId}`}
              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{incident.attackChainId}</span>
            </Link>
          )}

          {incident.decisionId && (
            <Link
              to={`/console/decisions/${incident.decisionId}`}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{incident.decisionId}</span>
            </Link>
          )}

          {incident.relatedPolicyId && (
            <Link
              to={`/console/policies/${incident.relatedPolicyId}`}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{incident.relatedPolicyId}</span>
            </Link>
          )}

          {incident.relatedQuarantineId && (
            <Link
              to={`/console/quarantine/${incident.relatedQuarantineId}`}
              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{incident.relatedQuarantineId}</span>
            </Link>
          )}
        </div>

        {/* Tags Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
          <Tag className="w-3.5 h-3.5 text-[#8B9C8D]" />
          {incident.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white text-[11px] flex items-center gap-1.5 group"
            >
              <span>{t}</span>
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-[#4D5C50] hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <form onSubmit={handleAddTagSubmit} className="inline-flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="TAG_NAME"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="px-2 py-0.5 rounded bg-black border border-[#70FF5E] text-white text-[11px] focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#70FF5E] text-black hover:bg-[#5ce64c]"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTag(false)}
                className="p-1 text-[#8B9C8D] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white text-[10px] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Investigation Tab Navigation */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'TIMELINE'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline & Notes ({incident.timeline?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROVENANCE')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'PROVENANCE'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Provenance Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('TAINT')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'TAINT'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Taint Propagation</span>
        </button>

        <button
          onClick={() => setActiveTab('RISK')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'RISK'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Risk Explainability</span>
        </button>

        <button
          onClick={() => setActiveTab('POLICY')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'POLICY'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Policy Enforcement</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE & CASE NOTES */}
      {activeTab === 'TIMELINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Forensic Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Sequential Forensic Timeline</span>
                </span>
                <span className="text-[10px] text-[#4D5C50]">
                  {incident.timeline?.length || 0} Recorded Forensic Steps
                </span>
              </div>

              <div className="space-y-4">
                {incident.timeline?.map((step) => {
                  const isBookmarked = incident.bookmarkedEvidenceIds?.includes(step.id);

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isBookmarked
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-black/40 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#70FF5E]">
                            {step.step}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white">{step.label}</span>
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] bg-white/5 text-sky-400 border border-white/10 font-bold uppercase">
                              {step.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#4D5C50]">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => handleToggleBookmark(step.id)}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark as evidence'}
                            className="p-1 rounded text-[#8B9C8D] hover:text-amber-400 transition-colors"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-[#4D5C50]" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#8B9C8D] pl-8 mt-1.5 leading-relaxed">
                        {step.description}
                      </p>

                      {step.targetRoute && (
                        <div className="pl-8 pt-2.5 flex items-center gap-2 text-[10px]">
                          <span className="text-[#4D5C50]">Evidence Reference:</span>
                          <Link
                            to={step.targetRoute}
                            className="text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <span>{step.entityId || step.entityType}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Case Management & Analyst Notes (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Incident Summary Card */}
            <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-3">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Executive Synthesis
              </span>
              <p className="text-xs text-[#EDEDED] leading-relaxed">
                {incident.summary}
              </p>
            </div>

            {/* Collaborative Analyst Notes */}
            <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Analyst Notes Ledger</span>
                </span>
                <span className="text-[10px] text-[#4D5C50]">
                  {incident.notes?.length || 0} Notes
                </span>
              </div>

              {/* Notes Stream */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {incident.notes?.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#70FF5E]">{n.author}</span>
                      <span className="text-[#4D5C50]">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-[#8B9C8D] leading-relaxed">{n.content}</p>
                    {n.relatedEntity && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] bg-white/5 text-amber-300 border border-white/10">
                        Target: {n.relatedEntity}
                      </span>
                    )}
                  </div>
                ))}

                {(!incident.notes || incident.notes.length === 0) && (
                  <div className="p-4 text-center text-xs text-[#8B9C8D]">
                    No investigative notes logged yet.
                  </div>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="pt-2 border-t border-white/5 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Record forensic observation, containment action, or hypotheses..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#70FF5E]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#4D5C50]">Author: {noteAuthor}</span>
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !noteContent.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#70FF5E] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#5ce64c] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Log Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVENANCE EXPLORER */}
      {activeTab === 'PROVENANCE' && provenance && (
        <ProvenanceExplorer graph={provenance} />
      )}

      {/* TAB 3: TAINT FLOW EXPLORER */}
      {activeTab === 'TAINT' && taintFlow && (
        <TaintFlowExplorer trace={taintFlow} />
      )}

      {/* TAB 4: RISK EXPLAINABILITY */}
      {activeTab === 'RISK' && riskExplanation && (
        <RiskExplainabilityCard explanation={riskExplanation} />
      )}

      {/* TAB 5: POLICY ENFORCEMENT & DRY-RUN */}
      {activeTab === 'POLICY' && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>Deterministic Policy Evaluation Boundary</span>
              </h3>
              <p className="text-[11px] text-[#8B9C8D] mt-0.5">
                Evaluation results matching security rules against agent arguments and resource trust classifications.
              </p>
            </div>
            <button
              onClick={() => setIsBacktestOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 hover:bg-purple-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dry-Run / Backtest Candidate Rules</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Primary Matched Policy
              </span>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-xs">{incident.relatedPolicyId || 'pol-001'}</span>
                <DecisionBadge decision={incident.finalDecision} size="sm" />
              </div>
              <p className="text-[11px] text-[#8B9C8D]">
                Cloud Metadata & Restricted Egress Interception: Block outbound network socket when destination is UNKNOWN_EXTERNAL and resource is RESTRICTED/CRITICAL.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
                Security Assurance Tier
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                  ENFORCED AT GATEWAY (eBPF)
                </span>
                <span className="text-[11px] text-[#8B9C8D]">Deterministic Interception</span>
              </div>
              <p className="text-[11px] text-[#8B9C8D]">
                Enforcement token verified: socket severed with zero bytes egressed to external C2.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backtest Modal */}
      <PolicyBacktestModal
        policyId={incident.relatedPolicyId || 'pol-001'}
        policyName="Cloud Metadata & Restricted Egress Interception"
        currentVersion="v2.4.1"
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />

      {/* Export Report Modal */}
      <IncidentExportModal
        incident={incident}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
