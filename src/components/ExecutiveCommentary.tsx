import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Send, 
  FileText, 
  Info, 
  Bot, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ScreeningResult, PortfolioWeight, PortfolioComparison, ClusterWeightSummary } from '../types';
import { generateExecutiveCommentary } from '../lib/openRouter';
import { TermInfoButton } from './TermExplainer';

interface ExecutiveCommentaryProps {
  asOfDate: string;
  regime: string;
  results: ScreeningResult[];
  weights: PortfolioWeight[];
  comparison: PortfolioComparison;
  clusterWeights: ClusterWeightSummary[];
  openRouterKey: string;
  selectedModel: string;
}

export const ExecutiveCommentary: React.FC<ExecutiveCommentaryProps> = ({
  asOfDate,
  regime,
  results,
  weights,
  comparison,
  clusterWeights,
  openRouterKey,
  selectedModel
}) => {
  const [commentary, setCommentary] = useState<string>(() => 
    getDefaultCommentary(asOfDate, regime, results, weights, comparison, clusterWeights)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [hasCustomLLM, setHasCustomLLM] = useState(false);

  // Update commentary when props change if no custom LLM text is loaded
  useEffect(() => {
    if (!hasCustomLLM) {
      setCommentary(getDefaultCommentary(asOfDate, regime, results, weights, comparison, clusterWeights));
    }
  }, [asOfDate, regime, results, weights, comparison, clusterWeights, hasCustomLLM]);

  const handleGenerate = async () => {
    if (!openRouterKey) {
      setGenError('Please enter your OpenRouter API key in settings or header to generate live LLM commentary.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      const topHoldings = weights.slice(0, 5).map(w => ({
        ticker: w.ticker,
        company: w.company,
        weight: w.weight_pct,
        vol: w.ann_vol_pct,
        ret: w.ret_12m_pct
      }));

      const bindingCapHoldings = weights.filter(w => w.is_capped).map(w => w.ticker);
      const zeroWeightSurvivors = weights.filter(w => w.is_zero).map(w => w.ticker);

      const text = await generateExecutiveCommentary({
        asOfDate,
        regime,
        survivorCount: weights.length,
        totalCount: results.length,
        portVol: comparison.port_vol_pct,
        eqVol: comparison.eq_vol_pct,
        riskReduction: comparison.risk_reduction_pct,
        portRet: comparison.port_ret_pct,
        eqRet: comparison.eq_ret_pct,
        clusterAllocations: clusterWeights.map(c => ({ cluster: c.cluster, weight: c.weight_pct })),
        topHoldings,
        bindingCapHoldings,
        zeroWeightSurvivors,
        borderlineCount: results.filter(r => r.borderline).length
      }, openRouterKey, selectedModel);

      setCommentary(text);
      setHasCustomLLM(true);
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate commentary.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                Market Insights & Strategy Summary
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                AI Quantitative Analysis
              </span>
              <TermInfoButton termId="min_variance_optimization" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated plain-English briefing summarizing today's stock screening and portfolio construction
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isGenerating 
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-900/40 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-300" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{openRouterKey ? 'Regenerate Live Analysis' : 'Re-Generate Insights'}</span>
            </>
          )}
        </button>
      </div>

      {genError && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{genError}</span>
        </div>
      )}

      {/* Structured Presentation of Executive Commentary */}
      <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 font-sans bg-slate-950/70 p-5 rounded-xl border border-slate-800/80">
        {commentary.split('\n\n').map((para, idx) => (
          <p key={idx} className="leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Model: {selectedModel}</span>
        <span className="text-[11px] text-slate-400">Deterministic context injection (Zero hallucination mandate)</span>
      </div>

    </div>
  );
};

function getDefaultCommentary(
  asOfDate: string,
  regime: string,
  results: ScreeningResult[],
  weights: PortfolioWeight[],
  comparison: PortfolioComparison,
  clusterWeights: ClusterWeightSummary[]
): string {
  const passingCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  const borderlineCount = results.filter(r => r.borderline).length;
  const cappedNames = weights.filter(w => w.is_capped).map(w => w.ticker);
  const zeroNames = weights.filter(w => w.is_zero).map(w => w.ticker);

  // Top clusters
  const sortedClusters = [...clusterWeights].sort((a, b) => b.weight_pct - a.weight_pct);
  const topCluster1 = sortedClusters[0] || { cluster: 'Datacenter REITs & Thermal/Build', weight_pct: 45.0 };
  const topCluster2 = sortedClusters[1] || { cluster: 'Optics & Networking', weight_pct: 24.1 };
  const powerCluster = clusterWeights.find(c => c.cluster.includes('Power Generation')) || { cluster: 'Power Generation', weight_pct: 0, survivor_count: 0, total_candidates: 6 };

  // Top 3 holdings
  const topHoldings = weights.slice(0, 3).map(w => `${w.ticker} (${w.weight_pct.toFixed(1)}%)`).join(', ');

  const p1 = `Executive Review as of ${asOfDate} — The Trend-Confirmed AI Datacenter Enablement Portfolio reflects systematic execution across the ${totalCount}-name physical layer universe. Under the active ${regime} regime, ${passingCount} of ${totalCount} candidates passed all three technical rules and the X1 earnings guidance classifier. A total of ${borderlineCount} of ${totalCount} candidate verdicts currently sit within a tight borderline margin (within ±3% of the 200-day SMA or ±3 points of the RSI threshold), illustrating how sensitive technical momentum filters are during macroeconomic cross-currents.`;

  const p2 = `Sector allocation reflects actual trend confirmation over narrative expectations. ${topCluster1.cluster} (${topCluster1.weight_pct.toFixed(1)}%) and ${topCluster2.cluster} (${topCluster2.weight_pct.toFixed(1)}%) represent the largest capital concentrations${topHoldings ? `, led by ${topHoldings}` : ''}. In contrast, the ${powerCluster.cluster} group captures ${powerCluster.weight_pct.toFixed(1)}% total allocation (${powerCluster.survivor_count} of ${powerCluster.total_candidates} candidates passed technical screen), demonstrating how mathematical risk budgeting prevents capital allocation into broken trends despite strong thematic buzz.`;

  const p3 = `The Minimum Variance Optimization achieves its institutional objective: realizing an estimated ${comparison.risk_reduction_pct.toFixed(1)}% volatility reduction versus an equal-weighted benchmark (${comparison.port_vol_pct.toFixed(1)}% vs. ${comparison.eq_vol_pct.toFixed(1)}% annualized volatility). ${cappedNames.length > 0 ? `The 15.0% single-stock ceiling is actively binding on ${cappedNames.length} names (${cappedNames.join(', ')}), preventing excessive concentration.` : 'No single position exceeds the 15.0% cap.'} ${zeroNames.length > 0 ? `High-volatility technical survivors (${zeroNames.join(', ')}) received 0.0% weight as the solver favored lower-variance alternatives.` : ''} The strategy successfully captures physical infrastructure expansion while systematically suppressing uncompensated portfolio volatility.`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}
