import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Lock, 
  MinusCircle, 
  Search, 
  Download, 
  Copy, 
  Check, 
  ArrowUpDown, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Info,
  TrendingDown,
  Scale,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { PortfolioWeight, PortfolioComparison, ClusterWeightSummary, ClusterName } from '../types';
import { TermInfoButton } from './TermExplainer';

interface PortfolioCompositionViewProps {
  weights: PortfolioWeight[];
  comparison: PortfolioComparison;
  clusterWeights: ClusterWeightSummary[];
  asOfDate: string;
  onOpenScreenerModal?: () => void;
}

export const PortfolioCompositionView: React.FC<PortfolioCompositionViewProps> = ({
  weights,
  comparison,
  clusterWeights,
  asOfDate,
  onOpenScreenerModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTheme, setFilterTheme] = useState<string>('ALL');
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [sortField, setSortField] = useState<'weight' | 'ticker' | 'company' | 'theme' | 'vol' | 'return'>('weight');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeHoldings = useMemo(() => weights.filter(w => w.weight_pct > 0), [weights]);
  const zeroWeightHoldings = useMemo(() => weights.filter(w => w.weight_pct === 0), [weights]);
  const totalAllocated = useMemo(() => weights.reduce((acc, curr) => acc + curr.weight_pct, 0), [weights]);

  // Unique themes
  const themes = useMemo(() => {
    const list: ClusterName[] = [];
    weights.forEach(w => {
      if (!list.includes(w.cluster)) list.push(w.cluster);
    });
    return list;
  }, [weights]);

  // Filtered and sorted weights
  const displayedWeights = useMemo(() => {
    return weights
      .filter(item => {
        if (activeOnly && item.weight_pct <= 0) return false;
        if (filterTheme !== 'ALL' && item.cluster !== filterTheme) return false;
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchTicker = item.ticker.toLowerCase().includes(q);
          const matchCompany = item.company.toLowerCase().includes(q);
          const matchTheme = item.cluster.toLowerCase().includes(q);
          if (!matchTicker && !matchCompany && !matchTheme) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'weight') comp = a.weight_pct - b.weight_pct;
        else if (sortField === 'ticker') comp = a.ticker.localeCompare(b.ticker);
        else if (sortField === 'company') comp = a.company.localeCompare(b.company);
        else if (sortField === 'theme') comp = a.cluster.localeCompare(b.cluster);
        else if (sortField === 'vol') comp = a.ann_vol_pct - b.ann_vol_pct;
        else if (sortField === 'return') comp = a.ret_12m_pct - b.ret_12m_pct;

        return sortAsc ? comp : -comp;
      });
  }, [weights, activeOnly, filterTheme, searchTerm, sortField, sortAsc]);

  const handleSort = (field: 'weight' | 'ticker' | 'company' | 'theme' | 'vol' | 'return') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'ticker' || field === 'company' || field === 'theme');
    }
  };

  const getThemeColorBadge = (theme: ClusterName) => {
    switch (theme) {
      case 'Optics & Networking':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Electrical & Power Mgmt':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Semiconductors (non-GPU)':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Power Generation (low-carbon)':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Datacenter REITs & Thermal/Build':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const copyToClipboard = () => {
    const lines = [
      `RECOMMENDED PORTFOLIO COMPOSITION (As of ${asOfDate})`,
      `Total Holdings: ${activeHoldings.length} Active | Total Allocation: ${totalAllocated.toFixed(2)}%`,
      `Expected Portfolio Volatility: ${comparison.port_vol_pct.toFixed(1)}% (vs ${comparison.eq_vol_pct.toFixed(1)}% Equal-Weight)`,
      '',
      'Ticker | Company | Theme | Weight (%) | Volatility | Past 12M Return | Status',
      '---------------------------------------------------------------------------------',
      ...weights.map(w => 
        `${w.ticker.padEnd(5)} | ${w.company.padEnd(24)} | ${w.cluster.padEnd(30)} | ${w.weight_pct.toFixed(2)}% | ${w.ann_vol_pct.toFixed(1)}% | ${w.ret_12m_pct >= 0 ? '+' : ''}${w.ret_12m_pct.toFixed(1)}% | ${w.is_capped ? '15% Capped' : w.is_zero ? '0% Excluded' : 'Active'}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportCSV = () => {
    const headers = ['Ticker', 'Company', 'Theme', 'Weight_Percent', 'Is_15Pct_Capped', 'Annualized_Volatility_Pct', 'Past_12M_Return_Pct', 'As_Of_Date'];
    const rows = weights.map(w => [
      w.ticker,
      `"${w.company.replace(/"/g, '""')}"`,
      `"${w.cluster.replace(/"/g, '""')}"`,
      w.weight_pct.toFixed(2),
      w.is_capped ? 'TRUE' : 'FALSE',
      w.ann_vol_pct.toFixed(1),
      w.ret_12m_pct.toFixed(1),
      asOfDate
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `recommended_portfolio_composition_${asOfDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Main Composition Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Current Recommended Portfolio Composition
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {activeHoldings.length} Active Holdings
                </span>
                <TermInfoButton termId="min_variance_optimization" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As of <strong className="text-slate-200">{asOfDate}</strong> • Low-volatility optimal allocations computed with a strict 15% safety limit per position.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenScreenerModal && (
              <button
                onClick={onOpenScreenerModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                title="View full diagnostic candidate screening table"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Candidate Screening Table (30)</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Total Capital Allocated</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{totalAllocated.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400">100% target</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 block mb-0.5">Expected Volatility</span>
              <TermInfoButton termId="portfolio_volatility" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-cyan-400">{comparison.port_vol_pct.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400">vs {comparison.eq_vol_pct.toFixed(1)}% Eq</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 block mb-0.5">Capped Holdings</span>
              <TermInfoButton termId="binding_cap" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-amber-400">{comparison.capped_count} Stocks</span>
              <span className="text-[10px] text-slate-400">at 15% limit</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Physical Themes</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-purple-400">{clusterWeights.length} Sectors</span>
              <span className="text-[10px] text-slate-400">diversified</span>
            </div>
          </div>
        </div>

        {/* Theme Allocation Breakdown Horizontal Grid */}
        <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Allocation by Physical Infrastructure Theme
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Sum: {clusterWeights.reduce((a, b) => a + b.weight_pct, 0).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {clusterWeights.map(cw => (
              <div 
                key={cw.cluster}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[11px] text-slate-200 font-medium truncate" title={cw.cluster}>
                    {cw.cluster}
                  </span>
                  <span className="text-xs font-bold font-mono text-white">
                    {cw.weight_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(100, (cw.weight_pct / 45) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter, Search, and Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, company, theme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                X
              </button>
            )}
          </div>

          {/* Theme Dropdown & View Toggle & Export */}
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Themes ({themes.length})</option>
              {themes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={() => setActiveOnly(!activeOnly)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors whitespace-nowrap ${
                activeOnly 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {activeOnly ? `Active Only (${activeHoldings.length})` : `All Qualified (${weights.length})`}
            </button>

            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Copy portfolio composition table to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Download recommended portfolio as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>CSV</span>
            </button>

          </div>

        </div>

        {/* Portfolio Composition Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <tr>
                <th 
                  onClick={() => handleSort('ticker')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Ticker</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('company')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors font-sans"
                >
                  <div className="flex items-center gap-1">
                    <span>Company Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('theme')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors font-sans"
                >
                  <div className="flex items-center gap-1">
                    <span>Physical Theme / Sector</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('vol')}
                  className="py-3 px-2 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volatility</span>
                    <TermInfoButton termId="portfolio_volatility" />
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('return')}
                  className="py-3 px-2 text-right cursor-pointer hover:text-slate-200 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Past 12M</span>
                    <TermInfoButton termId="realized_12m_return" />
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('weight')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% in Current Portfolio</span>
                    <TermInfoButton termId="min_variance_optimization" />
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
                <th className="py-3 px-3 w-48 text-center font-sans hidden sm:table-cell">
                  Allocation Bar (15% Max)
                </th>
                <th className="py-3 px-3 text-center font-sans">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {displayedWeights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No holdings match the current filter criteria.
                  </td>
                </tr>
              ) : (
                displayedWeights.map((item) => {
                  const isCapped = item.is_capped;
                  const isZero = item.is_zero;

                  return (
                    <tr 
                      key={item.ticker}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isCapped ? 'bg-amber-500/5' : isZero ? 'bg-rose-950/10 opacity-60' : ''
                      }`}
                    >
                      {/* Ticker */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-white text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                          {item.ticker}
                        </span>
                      </td>

                      {/* Company Name */}
                      <td className="py-3 px-3 font-sans">
                        <span className="font-semibold text-slate-100 text-xs">
                          {item.company}
                        </span>
                      </td>

                      {/* Theme / Sector */}
                      <td className="py-3 px-3 font-sans">
                        <span className={`text-[11px] px-2.5 py-1 rounded-md border font-medium inline-block ${getThemeColorBadge(item.cluster)}`}>
                          {item.cluster}
                        </span>
                      </td>

                      {/* Annual Volatility */}
                      <td className="py-3 px-2 text-right text-slate-300">
                        {item.ann_vol_pct.toFixed(1)}%
                      </td>

                      {/* Past 12M Return */}
                      <td className="py-3 px-2 text-right hidden md:table-cell">
                        <span className={item.ret_12m_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.ret_12m_pct >= 0 ? '+' : ''}{item.ret_12m_pct.toFixed(1)}%
                        </span>
                      </td>

                      {/* % in Current Portfolio */}
                      <td className="py-3 px-3 text-right">
                        <span className={`text-sm font-bold ${
                          isCapped ? 'text-amber-300' : isZero ? 'text-slate-500' : 'text-emerald-400'
                        }`}>
                          {item.weight_pct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Visual Bar */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCapped ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                              isZero ? 'bg-slate-700' :
                              'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${Math.min(100, (item.weight_pct / 15) * 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center font-sans">
                        {isCapped && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Lock className="w-3 h-3" />
                            <span>15% Cap</span>
                          </span>
                        )}
                        {!isCapped && !isZero && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                        {isZero && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <MinusCircle className="w-3 h-3 text-rose-400" />
                            <span>0% High Risk</span>
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Optimization Callout Footnote */}
        <div className="mt-4 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Minimum-Variance Weighting Rule:</strong> Allocations prioritize non-correlated physical assets to minimize joint portfolio volatility, strictly capping individual stock exposures at 15.0%.
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-400 font-semibold">{comparison.capped_count} at 15% Cap</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">{activeHoldings.length} Active Positions</span>
          </div>
        </div>

      </div>

    </div>
  );
};
