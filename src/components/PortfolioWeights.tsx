import React from 'react';
import { 
  PortfolioWeight, 
  PortfolioComparison, 
  ClusterWeightSummary 
} from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Layers, 
  Scale, 
  Lock,
  MinusCircle
} from 'lucide-react';
import { TermInfoButton } from './TermExplainer';

interface PortfolioWeightsProps {
  weights: PortfolioWeight[];
  comparison: PortfolioComparison;
  clusterWeights: ClusterWeightSummary[];
}

export const PortfolioWeights: React.FC<PortfolioWeightsProps> = ({
  weights,
  comparison,
  clusterWeights
}) => {
  const equalWeightPct = weights.length > 0 ? (100 / weights.length).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Optimized Weights Table & Bar Chart (2 Cols on lg) */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Low-Volatility Optimized Portfolio
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {weights.length} Qualified Stocks
                </span>
                <TermInfoButton termId="min_variance_optimization" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting lowest overall portfolio volatility • 15% Maximum safety limit per stock
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>15% Cap ({comparison.capped_count})</span>
                <TermInfoButton termId="binding_cap" />
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-400/80"></span>
                <span>0% Weight ({weights.filter(w => w.is_zero).length})</span>
                <TermInfoButton termId="zero_weight" />
              </span>
            </div>
          </div>

          {/* Weights Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                <tr>
                  <th className="py-2.5 px-3">Stock / Company</th>
                  <th className="py-2.5 px-2">Sector</th>
                  <th className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Ann. Vol</span>
                      <TermInfoButton termId="portfolio_volatility" />
                    </div>
                  </th>
                  <th className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Past 12M</span>
                      <TermInfoButton termId="realized_12m_return" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Portfolio Weight</span>
                      <TermInfoButton termId="min_variance_optimization" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 w-40">Allocation Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-200">
                {weights.map((item) => {
                  const isCapped = item.is_capped;
                  const isZero = item.is_zero;

                  return (
                    <tr 
                      key={item.ticker}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isCapped ? 'bg-amber-500/5' : isZero ? 'bg-rose-950/10 opacity-70' : ''
                      }`}
                    >
                      
                      {/* Ticker & Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{item.ticker}</span>
                          <span className="text-[11px] text-slate-400 font-sans truncate max-w-[120px]" title={item.company}>
                            {item.company}
                          </span>
                        </div>
                      </td>

                      {/* Cluster */}
                      <td className="py-2.5 px-2 font-sans">
                        <span className="text-[10px] text-slate-400 truncate max-w-[110px] block" title={item.cluster}>
                          {item.cluster}
                        </span>
                      </td>

                      {/* Annualized Volatility */}
                      <td className="py-2.5 px-2 text-right text-slate-300">
                        {item.ann_vol_pct.toFixed(1)}%
                      </td>

                      {/* Realized 12m Return */}
                      <td className="py-2.5 px-2 text-right">
                        <span className={`${item.ret_12m_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          +{item.ret_12m_pct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Weight % */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <span className={`text-xs font-bold ${
                            isCapped ? 'text-amber-300' : isZero ? 'text-slate-500' : 'text-emerald-300'
                          }`}>
                            {item.weight_pct.toFixed(2)}%
                          </span>
                          {isCapped && (
                            <span title="15.00% Maximum safety cap reached">
                              <Lock className="w-3 h-3 text-amber-400 inline" />
                            </span>
                          )}
                          {isZero && (
                            <span title="Excluded from weight due to extreme price volatility">
                              <MinusCircle className="w-3 h-3 text-rose-400 inline" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visual Bar */}
                      <td className="py-2.5 px-3">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex items-center">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCapped ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                              isZero ? 'bg-slate-700' :
                              'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${(item.weight_pct / 15) * 100}%` }}
                          ></div>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <span>
              Equal-weight baseline: <strong className="text-slate-200 font-mono">{equalWeightPct}%</strong> per stock.
            </span>
            <TermInfoButton termId="equal_weight" />
          </div>
          <span className="text-[11px] italic">
            Amber = 15% Maximum Safety Cap • Muted = 0% High-Risk Excluded
          </span>
        </div>
      </div>

      {/* 2. Cluster Breakdown & Risk Trade-Off Summary */}
      <div className="space-y-6">
        
        {/* Cluster Allocation Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Portfolio Allocation by Sector</span>
            </h3>
            <TermInfoButton termId="physical_layer" />
          </div>

          <div className="space-y-3 font-sans">
            {clusterWeights.map(cw => (
              <div key={cw.cluster} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[180px]" title={cw.cluster}>
                    {cw.cluster}
                  </span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      ({cw.survivor_count}/{cw.total_candidates})
                    </span>
                    <span className="font-bold text-white text-xs">
                      {cw.weight_pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      cw.cluster === 'Datacenter REITs & Thermal/Build' ? 'bg-blue-500' :
                      cw.cluster === 'Optics & Networking' ? 'bg-cyan-500' :
                      cw.cluster === 'Semiconductors (non-GPU)' ? 'bg-purple-500' :
                      cw.cluster === 'Electrical & Power Mgmt' ? 'bg-amber-500' :
                      'bg-teal-500'
                    }`}
                    style={{ width: `${cw.weight_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Clean Power Note:</strong> Low-carbon power carries 0.0% weight because 5 of 6 power providers fell below their 200-day trend line, and the single survivor (Bloom Energy) was excluded by the risk optimizer due to its extreme 113.3% volatility.
            </p>
          </div>
        </div>

        {/* Portfolio Comparison Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>Optimized vs Simple Equal Weight</span>
            </h3>
            <TermInfoButton termId="risk_reduction" />
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400 font-sans">Annualized Volatility:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-emerald-400">{comparison.port_vol_pct.toFixed(1)}% Optimized</span>
                <span className="text-slate-400 text-[11px]">vs {comparison.eq_vol_pct.toFixed(1)}% Simple</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400 font-sans">Past 12M Return:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">+{comparison.port_ret_pct.toFixed(1)}% Optimized</span>
                <span className="text-slate-400 text-[11px]">vs +{comparison.eq_ret_pct.toFixed(1)}% Simple</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
              <span className="font-sans font-semibold">Net Volatility Reduction:</span>
              <span className="font-bold font-mono text-sm">{comparison.risk_reduction_pct.toFixed(1)}%</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 italic font-sans leading-relaxed">
            The optimization engine intentionally trades away speculative historical return spikes to deliver a much smoother and more resilient portfolio.
          </p>
        </div>

      </div>

    </div>
  );
};
