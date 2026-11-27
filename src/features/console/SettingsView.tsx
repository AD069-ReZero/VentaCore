/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Settings View
 * Route: /console/settings
 * Enterprise security gateway configuration, detection thresholds, and cryptographic signers.
 * 
 * STRICT COMPLIANCE:
 * Clearly labeled: FRONTEND SIMULATION • BACKEND NOT CONNECTED
 */

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Key,
  Lock,
  Save,
  Check,
  RotateCcw,
  AlertTriangle,
  Info,
  Server,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'GATEWAY' | 'THRESHOLDS' | 'WEBHOOKS' | 'KEYS'>('WORKSPACE');
  const [savedNotice, setSavedNotice] = useState(false);

  // Settings mock state
  const [workspaceName, setWorkspaceName] = useState('VantaCore Enterprise Production');
  const [organizationId, setOrganizationId] = useState('org-vantacore-secops-001');
  const [defaultAssuranceTier, setDefaultAssuranceTier] = useState<'ENFORCED' | 'ADVISORY'>('ENFORCED');
  const [ebpfMode, setEbpfMode] = useState('INTERCEPT_AND_TERMINATE');
  const [criticalCutoff, setCriticalCutoff] = useState(85);
  const [highCutoff, setHighCutoff] = useState(65);
  const [mediumCutoff, setMediumCutoff] = useState(40);
  const [siemEndpoint, setSiemEndpoint] = useState('https://siem.corp.internal/v1/telemetry');
  const [alertWebhook, setAlertWebhook] = useState('https://hooks.slack.com/services/T00/B00/X00');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
              SETTINGS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8B9C8D] font-mono text-[10px] font-semibold">
              CONTROL PLANE
            </span>
          </div>
          <p className="text-xs text-[#8B9C8D] mt-1 font-sans">
            Workspace policies, zero-trust gateway boundaries, detector sensitivities, and SIEM egress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold uppercase text-[10px]">
            FRONTEND SIMULATION • BACKEND NOT CONNECTED
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('WORKSPACE')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'WORKSPACE'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('GATEWAY')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'GATEWAY'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Gateway & eBPF</span>
        </button>

        <button
          onClick={() => setActiveTab('THRESHOLDS')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'THRESHOLDS'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Risk Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('WEBHOOKS')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'WEBHOOKS'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Webhooks & SIEM</span>
        </button>

        <button
          onClick={() => setActiveTab('KEYS')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'KEYS'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Cosign & Root Keys</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Tab */}
        {activeTab === 'WORKSPACE' && (
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span>Workspace & Organization Metadata</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                  Workspace Display Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                  Organization Identifier
                </label>
                <input
                  type="text"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Default Security Assurance Tier
              </label>
              <select
                value={defaultAssuranceTier}
                onChange={(e) => setDefaultAssuranceTier(e.target.value as 'ENFORCED' | 'ADVISORY')}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="ENFORCED">ENFORCED (Deterministic zero-trust kernel blocking)</option>
                <option value="ADVISORY">ADVISORY (Telemetry logging without socket termination)</option>
              </select>
            </div>
          </div>
        )}

        {/* Gateway & eBPF Tab */}
        {activeTab === 'GATEWAY' && (
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Zero-Trust Kernel & eBPF Interception Policy</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                  eBPF Network Socket Severance Mode
                </label>
                <select
                  value={ebpfMode}
                  onChange={(e) => setEbpfMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                >
                  <option value="INTERCEPT_AND_TERMINATE">INTERCEPT_AND_TERMINATE (Active TCP RST on policy breach)</option>
                  <option value="DROP_PACKET">DROP_PACKET (Silent kernel drop)</option>
                  <option value="OBSERVE_ONLY">OBSERVE_ONLY (Simulation audit only)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2 text-[11px] text-[#8B9C8D]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>Kernel Hook Status</span>
                </div>
                <p>
                  eBPF socket filtering daemon: <code className="text-amber-400">NOT CONNECTED (Frontend Mock Mode)</code>.
                  Real kernel probes require backend agent execution gateway deployment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Thresholds Tab */}
        {activeTab === 'THRESHOLDS' && (
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Risk Engine Sensitivity Calibration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/60 border border-red-500/20 space-y-2">
                <span className="text-[10px] text-red-400 uppercase font-bold block">Critical Cutoff</span>
                <input
                  type="number"
                  min={70}
                  max={99}
                  value={criticalCutoff}
                  onChange={(e) => setCriticalCutoff(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-red-400 font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] text-[#4D5C50] block">Scores ≥ {criticalCutoff} trigger BLOCK</span>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-amber-500/20 space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">High Cutoff</span>
                <input
                  type="number"
                  min={50}
                  max={80}
                  value={highCutoff}
                  onChange={(e) => setHighCutoff(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-amber-400 font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] text-[#4D5C50] block">Scores ≥ {highCutoff} trigger REVIEW hold</span>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[10px] text-white uppercase font-bold block">Medium Cutoff</span>
                <input
                  type="number"
                  min={20}
                  max={55}
                  value={mediumCutoff}
                  onChange={(e) => setMediumCutoff(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] text-[#4D5C50] block">Scores ≥ {mediumCutoff} trigger warning</span>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks & SIEM Tab */}
        {activeTab === 'WEBHOOKS' && (
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Telemetry Forwarding & Incident Alerts</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                  Enterprise SIEM HTTPS Ingestion Endpoint
                </label>
                <input
                  type="text"
                  value={siemEndpoint}
                  onChange={(e) => setSiemEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                  SOC Critical Alert Webhook URL (Slack / Teams / PagerDuty)
                </label>
                <input
                  type="text"
                  value={alertWebhook}
                  onChange={(e) => setAlertWebhook(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cryptographic Keys Tab */}
        {activeTab === 'KEYS' && (
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-[#70FF5E]" />
              <span>Cosign Root Bundle Attestation & Decision Signatures</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
                <span className="text-[10px] text-[#4D5C50] uppercase block">
                  Root Public Verification Key (Cosign #49a)
                </span>
                <code className="text-emerald-400 text-[11px] block break-all">
                  cosign-key:vantacore-secops-root#49a:MCowBQYDK2VwAyEA9b72f1e6...[REDACTED]
                </code>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
                <span className="text-[10px] text-[#4D5C50] uppercase block">
                  Simulated Gateway Decision Token Signer
                </span>
                <code className="text-sky-400 text-[11px] block break-all">
                  vantacore-ed25519-decision-signer:simulated-local-boundary
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-[11px] text-[#8B9C8D]">
            {savedNotice ? (
              <span className="text-[#70FF5E] font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Configuration changes saved locally to frontend state.</span>
              </span>
            ) : (
              <span>Changes apply to the simulated frontend control plane.</span>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#70FF5E] text-black font-bold text-xs flex items-center gap-2 hover:bg-[#5ce64c] transition-colors shadow-lg shadow-[#70FF5E]/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
