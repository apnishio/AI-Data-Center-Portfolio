import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock, 
  Layers, 
  ShieldAlert,
  Sliders,
  Radio,
  Calendar,
  Database
} from 'lucide-react';
import { ScreeningRegime } from '../types';
import { FetchProgress } from '../lib/twelveData';
import { TermInfoButton } from './TermExplainer';

interface StatusBannerProps {
  asOfDate: string;
  isLive?: boolean;
  regime: ScreeningRegime;
  passCount: number;
  totalCount: number;
  borderlineCount: number;
  isFetching: boolean;
  progress?: FetchProgress | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  asOfDate,
  isLive = false,
  regime,
  passCount,
  totalCount,
  borderlineCount,
  isFetching,
  progress
}) => {
  const getRegimeLabel = () => {
    switch (regime) {
      case 'relaxed_t3':
        return 'Relaxed RSI 35–75';
      case 'below_target':
        return 'Below-target breadth';
      case 'standard':
      default:
        return 'Standard RSI 40–70';
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Live Fetching Progress Bar */}
      {isFetching && progress && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-lg shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-blue-300 font-semibold">{progress.status}</span>
            </div>
            <span className="text-slate-400 font-mono">
              {progress.currentIndex} / {progress.totalTickers} tickers ({progress.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">
            Streaming live daily market data from Twelve Data API across candidate universe...
          </p>
        </div>
      )}

      {/* Main Status & Regime Notification Banner */}
      <div className={`rounded-xl border p-4 transition-all ${
        regime === 'relaxed_t3' 
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
          : regime === 'below_target'
          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Regime & Mode Information */}
          <div className="flex items-start space-x-3">
            {regime === 'relaxed_t3' ? (
              <Sliders className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : regime === 'below_target' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Active Mode */}
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold flex items-center gap-1.5 border ${
                  isLive 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {isLive ? (
                    <>
                      <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                      <span>Live Mode</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-slate-400" />
                      <span>Reference Mode</span>
                    </>
                  )}
                </span>

                {/* As of Date */}
                <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>As of: {asOfDate}</span>
                </span>

                {/* Regime Badge */}
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold border ${
                  regime === 'relaxed_t3' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : regime === 'below_target'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  Regime: {getRegimeLabel()}
                </span>

                {/* Qualified Count */}
                <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-slate-900/80 border border-slate-700 text-slate-300">
                  {passCount} of {totalCount} Qualified
                </span>

                <TermInfoButton termId="fallback_regime" />
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {regime === 'relaxed_t3' && (
                  <span>
                    Fewer than 15 stocks passed under standard rules due to market pullbacks. The active momentum regime is <strong className="text-amber-200">Relaxed RSI 35–75</strong>, bringing the portfolio to <strong className="text-white">{passCount} qualified stocks</strong> while keeping 200-day trend filters 100% strict.
                  </span>
                )}
                {regime === 'below_target' && (
                  <span>
                    Active regime is <strong className="text-rose-200">Below-target breadth</strong> (only {passCount} stocks meet quality criteria). The strategy prioritizes capital preservation over artificial quotas.
                  </span>
                )}
                {regime === 'standard' && (
                  <span>
                    Active regime is <strong className="text-emerald-200">Standard RSI 40–70</strong>. All {passCount} qualified stocks display confirmed 200-day upward trends, positive MACD momentum, and healthy buying strength.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Borderline Verdict Metric */}
          <div className="flex-shrink-0 flex items-center space-x-2.5 bg-slate-900/90 px-3.5 py-2 rounded-lg border border-slate-800 self-start lg:self-center">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Borderline Verdicts:</span>
                <span className="font-mono font-bold text-amber-300">{borderlineCount} of {totalCount}</span>
                <TermInfoButton termId="borderline_verdict" />
              </div>
              <p className="text-[10px] text-slate-400">Within ±2% SMA, ±0.05% MACD, or 3-pt RSI band</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

