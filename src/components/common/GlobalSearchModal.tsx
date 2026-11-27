/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Global Search & Command Palette Modal
 * Triggered via Ctrl+K / Cmd+K or navigation search buttons.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Bot,
  Layers,
  Scale,
  GitBranch,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  History,
  Activity,
  ArrowRight,
  Terminal,
  ShieldAlert,
  Flame,
  FileText,
} from 'lucide-react';
import { searchService } from '../../api/services/search';
import { SearchResultItem, SearchItemType } from '../../types/security';
import { RiskBadge } from './SecurityBadges';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      searchService.search('').then((res) => setResults(res.data));
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchService.search(query);
      setResults(res.data);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.route);
  };

  const getEntityIcon = (type: SearchItemType) => {
    switch (type) {
      case 'COMMAND':
        return <Terminal className="w-4 h-4 text-[#70FF5E]" />;
      case 'INVESTIGATION':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'AGENT':
        return <Bot className="w-4 h-4 text-sky-400" />;
      case 'SESSION':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'DECISION':
        return <Scale className="w-4 h-4 text-amber-400" />;
      case 'ATTACK_CHAIN':
        return <GitBranch className="w-4 h-4 text-red-400" />;
      case 'TOOL':
        return <Wrench className="w-4 h-4 text-sky-300" />;
      case 'APPROVAL':
        return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      case 'QUARANTINE':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'POLICY':
        return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'AUDIT':
        return <History className="w-4 h-4 text-[#8B9C8D]" />;
      default:
        return <Search className="w-4 h-4 text-[#8B9C8D]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search and Command Palette"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#090C09] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/60">
          <Search className="w-5 h-5 text-[#70FF5E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, sessions, incidents, decisions, tools, policies... (or type 'exfil')"
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-[#4D5C50]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#8B9C8D] hover:text-white p-1 rounded transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#8B9C8D]">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[420px] overflow-y-auto p-2 divide-y divide-white/5">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/5 text-[#EDEDED]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0">
                      {getEntityIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#8B9C8D]">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8B9C8D] truncate font-sans mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.severity && <RiskBadge risk={item.severity} size="sm" />}
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-[#70FF5E] border border-white/10">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-[#4D5C50]" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#8B9C8D] space-y-1">
              <Search className="w-6 h-6 text-[#4D5C50] mx-auto mb-2" />
              <p>No matching entities or commands found for "{query}".</p>
              <p className="text-[10px] text-[#4D5C50]">
                Try typing "exfil", "agent", "quarantine", "policy", or "drop".
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-black/80 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8B9C8D]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Dismiss</span>
          </div>
          <span className="text-[#4D5C50]">VantaCore Command Palette</span>
        </div>
      </div>
    </div>
  );
};
