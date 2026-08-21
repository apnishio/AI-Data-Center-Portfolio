import React from 'react';
import { ScreeningResult, PortfolioWeight } from '../types';
import { Radio, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { TermInfoButton } from './TermExplainer';

interface TradingSignalsProps {
  survivors: ScreeningResult[];
  weights: PortfolioWeight[];
}

export const TradingSignals: React.FC<TradingSignalsProps> = ({
  survivors,
  weights
}) => {
  const weightMap = new Map<string, PortfolioWeight>(weights.map(w => [w.ticker, w]));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-semibold text-white">
              Stock Qualification & Allocation Signals
            </h3>
            <TermInfoButton termId="screen_survivors" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear breakdown of why each qualified stock was approved and how much is allocated
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
          {survivors.length} Qualified Stocks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {survivors.map(s => {
          const w = weightMap.get(s.ticker);
          const weightPct = w ? w.weight_pct : 0;
          const isCapped = w?.is_capped;
          const isZero = w?.is_zero;

          return (
            <div
              key={s.ticker}
              className={`p-3.5 rounded-xl border transition-all ${
                isCapped 
                  ? 'bg-amber-950/10 border-amber-500/30 text-amber-200'
                  : isZero
                  ? 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-80'
                  : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                    {s.ticker}
                  </span>
                  <span className="text-[11px] font-sans text-slate-300 truncate max-w-[140px]">
                    {s.company}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${
                    isCapped ? 'text-amber-400' : isZero ? 'text-slate-500' : 'text-emerald-400'
                  }`}>
                    {weightPct.toFixed(2)}% Weight
                  </span>
                  {isCapped && <span className="text-[10px] block text-amber-400/80 font-sans">15% Max Cap</span>}
                  {isZero && <span className="text-[10px] block text-rose-400 font-sans">0% High Risk</span>}
                </div>
              </div>

              <div className="mt-2 text-[11px] space-y-1 font-mono">
                <p className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <span>200-Day Trend:</span>
                    <TermInfoButton termId="t1_trend" />
                  </span>
                  <span className="text-emerald-400 font-semibold">PASS (+{s.t1_margin_pct.toFixed(1)}% above SMA)</span>
                </p>
                <p className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <span>MACD Momentum:</span>
                    <TermInfoButton termId="t2_momentum" />
                  </span>
                  <span className="text-emerald-400 font-semibold">PASS (Positive)</span>
                </p>
                <p className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <span>RSI Strength:</span>
                    <TermInfoButton termId="t3_rsi" />
                  </span>
                  <span className="text-emerald-400 font-semibold">PASS (RSI {s.rsi14.toFixed(1)})</span>
                </p>
                <p className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 font-sans text-slate-400">
                    <span>AI Guidance Check:</span>
                    <TermInfoButton termId="x1_guidance" />
                  </span>
                  <span className={`font-sans font-medium ${
                    s.x1_verdict === 'fail' ? 'text-rose-400' :
                    s.x1_verdict === 'insufficient' ? 'text-amber-400' :
                    'text-teal-300'
                  }`}>
                    {s.x1_verdict === 'fail' ? 'FAIL (Demand Warnings)' :
                     s.x1_verdict === 'insufficient' ? 'INSUFFICIENT DATA' :
                     'CLEAN (No Demand Warnings)'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
