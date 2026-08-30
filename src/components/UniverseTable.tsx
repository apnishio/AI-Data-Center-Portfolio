import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  ArrowUpDown, 
  FileText, 
  Sparkles, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ScreeningResult, ClusterName } from '../types';
import { TermInfoButton } from './TermExplainer';
import { CANDIDATE_UNIVERSE } from '../data/universe';
import { EARNINGS_PACKETS } from '../data/earningsPackets';

interface UniverseTableProps {
  results: ScreeningResult[];
  isLive?: boolean;
  onSelectTicker?: (ticker: string) => void;
}

export const UniverseTable: React.FC<UniverseTableProps> = ({
  results,
  isLive = false,
  onSelectTicker
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ScreeningResult>('cluster');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [activeX1Modal, setActiveX1Modal] = useState<ScreeningResult | null>(null);

  const clusters: ClusterName[] = [
    'Optics & Networking',
    'Electrical & Power Mgmt',
    'Semiconductors (non-GPU)',
    'Power Generation (low-carbon)',
    'Datacenter REITs & Thermal/Build'
  ];

  const handleSort = (field: keyof ScreeningResult) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter(item => {
      const matchSearch = 
        item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCluster = selectedCluster === 'ALL' || item.cluster === selectedCluster;

      const matchStatus = 
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PASS' && item.pass) ||
        (selectedStatus === 'FAIL' && !item.pass) ||
        (selectedStatus === 'BORDERLINE' && item.borderline);

      return matchSearch && matchCluster && matchStatus;
    }).sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'boolean') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }
      return sortAsc ? (aVal - bVal) : (bVal - aVal);
    });
  }, [results, searchTerm, selectedCluster, selectedStatus, sortField, sortAsc]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              Candidate Screening Table
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              30 Physical Layer Stocks
            </span>
            <TermInfoButton termId="physical_layer" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex items-center gap-1">
              <span>Rule 1: Price &gt; 200 SMA</span>
              <TermInfoButton termId="t1_trend" />
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>Rule 2: Positive Momentum</span>
              <TermInfoButton termId="t2_momentum" />
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>Rule 3: RSI 40–70</span>
              <TermInfoButton termId="t3_rsi" />
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>AI Review: Guidance Text</span>
              <TermInfoButton termId="x1_guidance" />
            </span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-52"
            />
          </div>

          {/* Cluster Filter */}
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All 5 Sectors</option>
            {clusters.map(cl => (
              <option key={cl} value={cl}>{cl}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses ({results.length})</option>
            <option value="PASS">Qualified / Pass Only ({results.filter(r => r.pass).length})</option>
            <option value="FAIL">Disqualified / Fail Only ({results.filter(r => !r.pass).length})</option>
            <option value="BORDERLINE">Close Calls Only ({results.filter(r => r.borderline).length})</option>
          </select>

        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('ticker')}>
                <div className="flex items-center gap-1">
                  <span>Stock / Company</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('cluster')}>
                <div className="flex items-center gap-1">
                  <span>Sector</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('close')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Price ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('sma200')}>
                <div className="flex items-center justify-end gap-1">
                  <span>200-SMA</span>
                  <TermInfoButton termId="sma_200" />
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('t1_margin_pct')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Trend Margin</span>
                  <TermInfoButton termId="t1_trend" />
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('macd_hist_norm')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Momentum</span>
                  <TermInfoButton termId="t2_momentum" />
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('rsi14')}>
                <div className="flex items-center justify-end gap-1">
                  <span>RSI (14)</span>
                  <TermInfoButton termId="t3_rsi" />
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-2 py-3 text-center" title="Rule 1: Price above 200-day moving average">Trend</th>
              <th className="px-2 py-3 text-center" title="Rule 2: Positive MACD momentum">Mom.</th>
              <th className="px-2 py-3 text-center" title="Rule 3: RSI between 40 and 70">RSI</th>
              <th className="px-2.5 py-3 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Close Call</span>
                  <TermInfoButton termId="borderline_verdict" />
                </div>
              </th>
              <th className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <span>AI Review</span>
                  <TermInfoButton termId="x1_guidance" />
                </div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer hover:text-white" onClick={() => handleSort('pass')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <TermInfoButton termId="screen_survivors" />
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-slate-500 font-sans italic">
                  No stocks match current filter criteria.
                </td>
              </tr>
            ) : (
              filteredResults.map((item) => {
                const isPass = item.pass;
                return (
                  <tr 
                    key={item.ticker}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isPass ? 'bg-emerald-950/10' : 'bg-transparent'
                    }`}
                  >
                    
                    {/* Ticker & Company */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{item.ticker}</span>
                        <span className="text-[11px] text-slate-400 font-sans truncate max-w-[130px]" title={item.company}>
                          {item.company}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-[200px]" title={item.role}>
                        {item.role}
                      </div>
                    </td>

                    {/* Cluster Badge */}
                    <td className="px-3 py-3 font-sans">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        item.cluster === 'Optics & Networking' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                        item.cluster === 'Electrical & Power Mgmt' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                        item.cluster === 'Semiconductors (non-GPU)' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                        item.cluster === 'Power Generation (low-carbon)' ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' :
                        'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      }`}>
                        {item.cluster}
                      </span>
                    </td>

                    {/* Close */}
                    <td className="px-3 py-3 text-right text-slate-100 font-semibold">
                      ${item.close.toFixed(2)}
                    </td>

                    {/* SMA-200 */}
                    <td className="px-3 py-3 text-right text-slate-400">
                      ${item.sma200.toFixed(2)}
                    </td>

                    {/* T1 Margin % */}
                    <td className="px-3 py-3 text-right">
                      <span className={`font-semibold ${
                        item.t1_margin_pct > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.t1_margin_pct > 0 ? '+' : ''}{item.t1_margin_pct.toFixed(1)}%
                      </span>
                    </td>

                    {/* Normalized Hist % */}
                    <td className="px-3 py-3 text-right">
                      <span className={`${
                        item.macd_hist_norm > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.macd_hist_norm > 0 ? '+' : ''}{item.macd_hist_norm.toFixed(3)}%
                      </span>
                    </td>

                    {/* RSI */}
                    <td className="px-3 py-3 text-right">
                      <span className={`${
                        item.T3 ? 'text-slate-200 font-semibold' : 'text-rose-400'
                      }`}>
                        {item.rsi14.toFixed(1)}
                      </span>
                    </td>

                    {/* T1 */}
                    <td className="px-2 py-3 text-center">
                      {item.T1 ? (
                        <span className="inline-flex p-0.5 rounded bg-emerald-500/20 text-emerald-400"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-0.5 rounded bg-rose-500/20 text-rose-400"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* T2 */}
                    <td className="px-2 py-3 text-center">
                      {item.T2 ? (
                        <span className="inline-flex p-0.5 rounded bg-emerald-500/20 text-emerald-400"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-0.5 rounded bg-rose-500/20 text-rose-400"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* T3 */}
                    <td className="px-2 py-3 text-center">
                      {item.T3 ? (
                        <span className="inline-flex p-0.5 rounded bg-emerald-500/20 text-emerald-400"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-0.5 rounded bg-rose-500/20 text-rose-400"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* Borderline */}
                    <td className="px-2.5 py-3 text-center">
                      {item.borderline ? (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Within 1-day price flip threshold">
                          YES
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>

                    {/* X1 Text Signal */}
                    <td className="px-3 py-3 text-center font-mono">
                      {isLive && item.x1_verdict ? (
                        <button
                          onClick={() => setActiveX1Modal(item)}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium inline-flex items-center justify-center gap-1 mx-auto transition-colors border ${
                            item.x1_verdict === 'fail' 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30' 
                              : item.x1_verdict === 'insufficient'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                          title="Click to view earnings call transcript AI review details"
                        >
                          <FileText className="w-3 h-3 text-teal-400" />
                          <span>{item.x1_verdict.toUpperCase()}</span>
                        </button>
                      ) : (
                        <span 
                          className="text-slate-500 text-[10px] uppercase font-mono tracking-wider"
                          title="AI guidance screen (X1) executes only in Live Mode with an OpenRouter API key"
                        >
                          NOT RUN
                        </span>
                      )}
                    </td>

                    {/* Final Verdict */}
                    <td className="px-4 py-3 text-center">
                      {isPass ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono shadow-sm shadow-emerald-950">
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono" title={item.fail_reason}>
                          FAIL
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

      {/* Required Footnote */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 italic">
        * AI guidance screen (X1) executes only in Live Mode with an OpenRouter API key; reference results reflect the technical rules only.
      </div>

      {/* X1 Transcript Detail Modal */}
      {activeX1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm rounded-lg border border-emerald-500/20">
                  {activeX1Modal.ticker}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{activeX1Modal.company}</h3>
                  <p className="text-xs text-slate-400">{activeX1Modal.cluster}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveX1Modal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">X1 Guidance Classifier Verdict:</span>
                <span className={`font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                  activeX1Modal.x1_verdict === 'fail' 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                    : activeX1Modal.x1_verdict === 'insufficient'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {activeX1Modal.x1_verdict?.toUpperCase() || 'NOT RUN'}
                </span>
              </div>

              {(() => {
                const packet = EARNINGS_PACKETS[activeX1Modal.ticker];
                return (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-300 block">Guidance Text:</span>
                    {packet?.isPlaceholder && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ILLUSTRATIVE TEXT — placeholder, not an actual company statement
                      </span>
                    )}
                    <blockquote className="text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                      "{packet?.text || activeX1Modal.x1_evidence || 'No text available'}"
                    </blockquote>
                  </div>
                );
              })()}

              <div>
                <span className="font-semibold text-slate-300 block mb-1">Reasoning / Notes:</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                  {activeX1Modal.x1_reasoning || 'No negative forward guidance or customer demand slowdown detected.'}
                </p>
              </div>

              {activeX1Modal.x1_evidence && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-300 block">Verbatim Evidence Quote:</span>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ILLUSTRATIVE TEXT — placeholder, not an actual company statement
                  </span>
                  <blockquote className="italic text-rose-200 bg-rose-950/30 p-3 rounded-lg border border-rose-500/30">
                    "{activeX1Modal.x1_evidence}"
                  </blockquote>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveX1Modal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
