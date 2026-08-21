import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Leaf, 
  PieChart, 
  Scale, 
  Zap,
  Info
} from 'lucide-react';
import { PortfolioComparison, ClusterWeightSummary } from '../types';
import { TermInfoButton } from './TermExplainer';

interface PortfolioOverviewCardsProps {
  comparison: PortfolioComparison;
  clusterWeights: ClusterWeightSummary[];
  onOpenScreener?: () => void;
}

export const PortfolioOverviewCards: React.FC<PortfolioOverviewCardsProps> = ({
  comparison,
  clusterWeights,
  onOpenScreener
}) => {
  const greenCluster = clusterWeights.find(c => c.cluster === 'Power Generation (low-carbon)');
  const greenWeight = greenCluster ? greenCluster.weight_pct : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Volatility Reduction Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-300">Portfolio Volatility (Annual)</span>
            <TermInfoButton termId="portfolio_volatility" />
          </div>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingDown className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {comparison.port_vol_pct.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-400 line-through" title="Equal-Weight Benchmark Volatility">
            {comparison.eq_vol_pct.toFixed(1)}% Eq-Wt
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 mr-1.5 font-mono">
            -{comparison.risk_reduction_pct.toFixed(0)}%
          </span>
          <span className="flex items-center gap-1">
            <span>Risk Reduction vs Equal-Weight</span>
            <TermInfoButton termId="risk_reduction" />
          </span>
        </div>
      </div>

      {/* 2. Past 12m Return Card (Descriptive Context) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-300">Past 12-Month Return</span>
            <TermInfoButton termId="realized_12m_return" />
          </div>
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            +{comparison.port_ret_pct.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-400">
            vs +{comparison.eq_ret_pct.toFixed(1)}% Eq-Wt
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>Historical context only — not used to pick stocks</span>
        </p>
      </div>

      {/* 3. Candidate Screener & Qualified Stocks */}
      <div 
        onClick={onOpenScreener}
        className={`bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all ${
          onOpenScreener ? 'cursor-pointer hover:bg-slate-900' : ''
        }`}
        title={onOpenScreener ? 'Click to open full Candidate Screening Table pop-up (30 stocks)' : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-300">Candidate Screening Filter</span>
            <TermInfoButton termId="screen_survivors" />
          </div>
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
            <Scale className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {comparison.survivors_count}
          </span>
          <span className="text-xs font-mono text-slate-400">
            qualified of 30 candidates ({comparison.nonzero_count} held)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-cyan-300">
          <div className="flex items-center">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 mr-1.5 font-mono font-semibold">
              {comparison.capped_count} Stocks
            </span>
            <span className="flex items-center gap-1">
              <span>at 15% Cap</span>
              <TermInfoButton termId="binding_cap" />
            </span>
          </div>

          {onOpenScreener && (
            <span className="text-[11px] text-cyan-400 group-hover:text-cyan-300 font-sans font-medium flex items-center gap-0.5 ml-1">
              <span>View Screener Table →</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Green-Tilt Universe Allocation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-300">Clean Power Energy Tilt</span>
            <TermInfoButton termId="green_tilt" />
          </div>
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Leaf className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {greenWeight.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-400">
            portfolio weight
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 truncate" title="The strategy strictly follows price rules: power stocks are left out when in a downtrend">
          Rules over narrative: {greenCluster ? `${greenCluster.total_candidates - greenCluster.survivor_count}/${greenCluster.total_candidates}` : '5/6'} power failed trend
        </p>
      </div>

    </div>
  );
};
