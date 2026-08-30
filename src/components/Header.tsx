import React, { useState } from 'react';
import { 
  Play, 
  Settings, 
  Download, 
  BookOpen, 
  RefreshCw, 
  Key, 
  Sparkles,
  Eye,
  EyeOff,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  PieChart
} from 'lucide-react';
import { PhysicalAILogo } from './PhysicalAILogo';
import { AVAILABLE_MODELS } from '../lib/openRouter';

interface HeaderProps {
  asOfDate: string;
  isLive: boolean;
  isFetching: boolean;
  onRunScreening: () => void;
  onResetToSnapshot: () => void;
  twelveDataKey: string;
  setTwelveDataKey: (key: string) => void;
  openRouterKey: string;
  setOpenRouterKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onOpenMethodology: () => void;
  onOpenAudit: () => void;
  onOpenScreener?: () => void;
  passCount?: number;
  totalCandidateCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  asOfDate,
  isLive,
  isFetching,
  onRunScreening,
  onResetToSnapshot,
  twelveDataKey,
  setTwelveDataKey,
  openRouterKey,
  setOpenRouterKey,
  selectedModel,
  setSelectedModel,
  onOpenMethodology,
  onOpenAudit,
  onOpenScreener,
  passCount = 8,
  totalCandidateCount = 30
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showTwelveKey, setShowTwelveKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);

  const hasTwelveKey = !!(twelveDataKey && twelveDataKey.trim().length > 0);
  const hasKeys = !!twelveDataKey || !!openRouterKey;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Metadata */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/80 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-500/30 group hover:border-cyan-400/60 transition-colors shrink-0">
              <PhysicalAILogo className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]" size={32} />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  AI Data Center Portfolio
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v4.0
                </span>
                {isLive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse"></span>
                    Live Data
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    <Database className="w-3 h-3 mr-1" />
                    Validated 20 Aug Reference Snapshot
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trend-Confirmed Physical Layer Strategy with Green-Tilted Universe • As of <span className="font-mono text-slate-200">{asOfDate}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Snapshot / Live Toggle */}
            {isLive ? (
              <button
                onClick={onResetToSnapshot}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset to verified FRD Aug 20 benchmark snapshot"
              >
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Reference Snapshot</span>
              </button>
            ) : (
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Configure API keys for live market screening"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Configure Live API</span>
              </button>
            )}

            {/* Run Live Screening Button */}
            <button
              onClick={() => {
                if (hasTwelveKey) {
                  onRunScreening();
                }
              }}
              disabled={isFetching || !hasTwelveKey}
              title={!hasTwelveKey ? 'Enter a Twelve Data API Key in Configure Live API to enable Live Screener Mode' : 'Run Live Market Screening across all 30 candidate tickers'}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all ${
                isFetching || !hasTwelveKey
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750 opacity-60' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 border border-emerald-400/30 active:scale-95'
              }`}
            >
              {isFetching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Running Live Screen...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{hasTwelveKey ? 'Run Live Screen' : 'Run Live (Twelve Data Key Required)'}</span>
                </>
              )}
            </button>

            {/* Candidate Screener Pop-up Button */}
            {onOpenScreener && (
              <button
                onClick={onOpenScreener}
                className="px-3.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                title="View full diagnostic candidate screening table and pass/fail rules"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Candidate Screener ({passCount}/{totalCandidateCount})</span>
              </button>
            )}

            {/* About this App */}
            <button
              onClick={onOpenMethodology}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Read methodology, screening rules, and thesis"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">About this App</span>
            </button>

            {/* Audit & CSV Export */}
            <button
              onClick={onOpenAudit}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Audit trail and CSV data export"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Audit & Export</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-lg border transition-colors ${
                showConfig ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Settings and API credentials"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Credentials Drawer / Banner */}
        {showConfig && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-4 border border-slate-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  API Key Configuration (Client-Side Only, Never Stored On Server)
                </h3>
              </div>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              To run live screenings across all 30 candidate tickers, enter your API credentials below. Market queries will execute directly in real time. Keys reside solely in active browser memory and clear on reload.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Twelve Data Key */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Twelve Data API Key</span>
                  <a 
                    href="https://twelvedata.com/pricing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Get Free Key
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showTwelveKey ? 'text' : 'password'}
                    value={twelveDataKey}
                    onChange={(e) => setTwelveDataKey(e.target.value.trim())}
                    placeholder="Enter Twelve Data Key..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwelveKey(!showTwelveKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showTwelveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenRouter Key */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>OpenRouter API Key</span>
                  <a 
                    href="https://openrouter.ai/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Get OpenRouter Key
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showOpenRouterKey ? 'text' : 'password'}
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value.trim())}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* LLM Model Selector */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  X1 & Commentary LLM Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {hasKeys ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Keys loaded in memory. Ready for live screening.
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Enter keys to enable live market API calls or explore in Snapshot mode.
                  </>
                )}
              </span>
              {hasKeys && (
                <button
                  onClick={() => {
                    setShowConfig(false);
                    onRunScreening();
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                >
                  Start Live Run Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
