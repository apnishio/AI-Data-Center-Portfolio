import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock, 
  Layers, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { ScreeningRegime } from '../types';
import { FetchProgress } from '../lib/twelveData';
import { TermInfoButton } from './TermExplainer';

interface StatusBannerProps {
  asOfDate: string;
  regime: ScreeningRegime;
  passCount: number;
  totalCount: number;
  borderlineCount: number;
  isFetching: boolean;
  progress?: FetchProgress | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  asOfDate,
  regime,
  passCount,
  totalCount,
  borderlineCount,
  isFetching,
  progress
}) => {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Regime Information */}
          <div className="flex items-start space-x-3">
            {regime === 'relaxed_t3' ? (
              <Sliders className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : regime === 'below_target' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-100">
                  {regime === 'relaxed_t3' && 'Market Pullback Rule: RSI Band Widened (35–75)'}
                  {regime === 'below_target' && 'Defensive Breadth: Fewer Than 15 Stocks Qualified'}
                  {regime === 'standard' && 'Standard Screening Rules Active (RSI 40–70)'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-900/60 border border-slate-700 text-slate-300">
                  {passCount} of {totalCount} Qualified
                </span>
                <TermInfoButton termId="fallback_regime" />
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {regime === 'relaxed_t3' && (
                  <span>
                    Fewer than 15 stocks passed under the strict RSI 40–70 rule due to recent market pullbacks. The momentum filter automatically expanded to 35–75, safely bringing the portfolio to <strong className="text-white">{passCount} qualified stocks</strong> while keeping trend and AI review filters 100% strict.
                  </span>
                )}
                {regime === 'below_target' && (
                  <span>
                    Prevailing market downtrends mean only {passCount} stocks meet our quality criteria. The strategy prioritizes safety over quotas and never force-fills the portfolio with falling stocks.
                  </span>
                )}
                {regime === 'standard' && (
                  <span>
                    Normal operation under standard technical parameters. All {passCount} qualified stocks display strong 200-day upward trends, positive momentum, and healthy buying strength.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Borderline Verdict Metric */}
          <div className="flex-shrink-0 flex items-center space-x-2 bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Close Calls: </span>
                <span className="font-mono font-bold text-amber-300">{borderlineCount} of {totalCount}</span>
                <TermInfoButton termId="borderline_verdict" />
              </div>
              <p className="text-[10px] text-slate-400">Within 2% of pass/fail line</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
