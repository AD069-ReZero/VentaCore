/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Layers,
  AlertTriangle,
  Scale,
  GitBranch,
  Wrench,
  CheckCircle2,
  FileCheck,
  History,
  FlaskConical,
  Activity,
  Search,
  ChevronDown,
  Bell,
  ArrowLeft,
  Flame,
  Network,
  Code,
} from 'lucide-react';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface ConsoleLayoutProps {
  children?: React.ReactNode;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  subpaths?: string[];
}

interface NavGroup {
  title: string;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/console', label: 'Security Overview', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
      { to: '/console/system-health', label: 'System Health', icon: <Activity className="w-4 h-4" />, subpaths: ['/console/system-health'] },
    ],
  },
  {
    title: 'AI SECURITY',
    items: [
      { to: '/console/agents', label: 'Agents', icon: <Bot className="w-4 h-4" />, subpaths: ['/console/agents'] },
      { to: '/console/sessions', label: 'Sessions', icon: <Layers className="w-4 h-4" />, subpaths: ['/console/sessions'] },
      { to: '/console/decisions', label: 'Security Decisions', icon: <Scale className="w-4 h-4" />, subpaths: ['/console/decisions'] },
      { to: '/console/approvals', label: 'Approvals', icon: <CheckCircle2 className="w-4 h-4" />, subpaths: ['/console/approvals'] },
      { to: '/console/attack-chains', label: 'Attack Chains', icon: <GitBranch className="w-4 h-4" />, subpaths: ['/console/attack-chains'] },
      { to: '/console/incidents', label: 'Incidents', icon: <Flame className="w-4 h-4" />, subpaths: ['/console/incidents', '/console/investigations'] },
      { to: '/console/events', label: 'Security Events', icon: <AlertTriangle className="w-4 h-4" />, subpaths: ['/console/events'] },
    ],
  },
  {
    title: 'ENFORCEMENT',
    items: [
      { to: '/console/tools', label: 'Tool Registry', icon: <Wrench className="w-4 h-4" />, subpaths: ['/console/tools'] },
      { to: '/console/connectors', label: 'MCP & Connectors', icon: <Network className="w-4 h-4" />, subpaths: ['/console/connectors'] },
    ],
  },
  {
    title: 'POLICY',
    items: [
      { to: '/console/policies', label: 'Policies', icon: <FileCheck className="w-4 h-4" />, subpaths: ['/console/policies'] },
    ],
  },
  {
    title: 'SECURITY LAB',
    items: [
      { to: '/console/lab', label: 'AI Security Lab', icon: <FlaskConical className="w-4 h-4" />, subpaths: ['/console/lab'] },
    ],
  },
  {
    title: 'OBSERVABILITY',
    items: [
      { to: '/console/audit', label: 'Audit Explorer', icon: <History className="w-4 h-4" />, subpaths: ['/console/audit'] },
      { to: '/console/system-health', label: 'System Health', icon: <Activity className="w-4 h-4" />, subpaths: ['/console/system-health'] },
    ],
  },
  {
    title: 'DEVELOPERS',
    items: [
      { to: '/console/integrations', label: 'Integrations', icon: <Code className="w-4 h-4" />, subpaths: ['/console/integrations'] },
    ],
  },
];

export const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev: boolean) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#050605] text-[#EDEDED] flex flex-col md:flex-row antialiased selection:bg-[#70FF5E] selection:text-black">
      {/* Sidebar matching panels 04, 05, 06, 07 */}
      <aside className="w-full md:w-64 bg-[#070907] border-r border-white/5 flex flex-col justify-between shrink-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <span className="text-lg text-[#70FF5E] font-bold">∇</span>
              <span className="font-display font-bold tracking-wider text-base text-white">
                VANTACORE
              </span>
            </Link>
            <button
              onClick={() => navigate('/')}
              title="Return to Landing Page"
              className="text-[#8B9C8D] hover:text-[#70FF5E] p-1 rounded hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#4D5C50]">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => {
                        const isSubpathActive = item.subpaths?.some((sp) => location.pathname.startsWith(sp));
                        const active = isActive || Boolean(isSubpathActive);

                        return `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                          active
                            ? 'bg-[#0E1710] border border-[#70FF5E]/30 text-white shadow-[0_0_15px_rgba(112,255,94,0.15)] font-medium'
                            : 'text-[#8B9C8D] hover:text-white hover:bg-white/[0.04] border border-transparent'
                        }`;
                      }}
                    >
                      {({ isActive }) => {
                        const isSubpathActive = item.subpaths?.some((sp) => location.pathname.startsWith(sp));
                        const active = isActive || Boolean(isSubpathActive);

                        return (
                          <>
                            <span className={active ? 'text-[#70FF5E]' : 'text-[#8B9C8D]'}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                            {active && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#70FF5E] shadow-[0_0_6px_#70FF5E] shrink-0" />
                            )}
                          </>
                        );
                      }}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Status Block */}
        <div className="p-4 border-t border-white/5 font-mono text-[11px] bg-[#060806]">
          <div className="text-[10px] text-[#4D5C50] tracking-wider uppercase mb-1">
            SECURITY RUNTIME
          </div>
          <div className="flex items-center gap-2 text-[#70FF5E]">
            <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-pulse" />
            <span className="font-semibold tracking-wide text-xs">SOC BOUNDARY ACTIVE</span>
          </div>
          <div className="text-[10px] text-[#8B9C8D] mt-0.5">Policy v1.4.2 • Fail-Closed</div>
        </div>
      </aside>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar matching panels 04-07 */}
        <header className="h-16 px-6 sm:px-8 border-b border-white/5 bg-[#070907]/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative w-72 sm:w-80 bg-[#0A0D0B] hover:bg-[#111712] border border-white/10 hover:border-[#70FF5E]/40 rounded-full pl-9 pr-3 py-1.5 text-xs font-mono text-[#8B9C8D] hover:text-[#EDEDED] text-left transition-all flex items-center justify-between group cursor-pointer"
            aria-label="Open Global Search Command Palette (Ctrl+K or Cmd+K)"
          >
            <Search className="w-4 h-4 text-[#4D5C50] group-hover:text-[#70FF5E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
            <span className="truncate">Search commands, incidents...</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#8B9C8D] group-hover:border-white/20">
              <span className="text-[9px]">⌘</span>K
            </span>
          </button>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E150F] border border-[#70FF5E]/20 text-[11px] font-mono text-[#70FF5E]">
              <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-ping" />
              <span>SIMULATED LIVE</span>
            </div>

            {/* Environment Dropdown */}
            <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0D0B] border border-white/10 text-xs font-mono text-[#8B9C8D] hover:text-white transition-colors">
              <span>Development</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Notifications */}
            <button className="relative w-8 h-8 rounded-full bg-[#0A0D0B] border border-white/10 flex items-center justify-center text-[#8B9C8D] hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
            </button>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#4C1D95] border border-purple-400/30 flex items-center justify-center text-xs font-mono font-bold text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]">
              A
            </div>
          </div>
        </header>

        {/* Dynamic View Mount */}
        <main className="flex-1 p-6 sm:p-8 bg-[#050605] overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>

      {/* Global Search & Command Palette Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
