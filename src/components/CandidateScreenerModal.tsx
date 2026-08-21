import React, { useState, useMemo } from 'react';
import { 
  X, 
  Layers, 
  Search, 
  Filter, 
  Check, 
  AlertCircle, 
  ArrowUpDown, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Download,
  Copy,
  Info
} from 'lucide-react';
import { ScreeningResult, ClusterName } from '../types';
import { TermInfoButton } from './TermExplainer';

interface CandidateScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ScreeningResult[];
  asOfDate: string;
}

export const CandidateScreenerModal: React.FC<CandidateScreenerModalProps> = ({
  isOpen,
  onClose,
  results,
  asOfDate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ScreeningResult>('cluster');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [activeX1Modal, setActiveX1Modal] = useState<ScreeningResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeX1Modal) {
          setActiveX1Modal(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeX1Modal]);

  const clusters: ClusterName[] = [
    'Optics & Networking',
    'Electrical & Power Mgmt',
    'Semiconductors (non-GPU)',
    'Power Generation (low-carbon)',
    'Datacenter REITs & Thermal/Build'
  ];

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;
  const borderlineCount = results.filter(r => r.borderline).length;

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
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      let comp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comp = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comp = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comp = (aVal === bVal) ? 0 : aVal ? -1 : 1;
      }
      return sortAsc ? comp : -comp;
    });
  }, [results, searchTerm, selectedCluster, selectedStatus, sortField, sortAsc]);

  const copyToClipboard = () => {
    const lines = [
      `CANDIDATE SCREENING TABLE (As of ${asOfDate})`,
      `Total Universe: ${results.length} Stocks | Qualified: ${passCount} | Failed: ${failCount} | Close Calls: ${borderlineCount}`,
      '',
      'Ticker | Company | Sector | Price | 200 SMA Margin | MACD | RSI | AI Review | Verdict',
      '---------------------------------------------------------------------------------------',
      ...results.map(r => 
        `${r.ticker.padEnd(5)} | ${r.company.padEnd(24)} | ${r.cluster.padEnd(30)} | $${r.close.toFixed(2).padEnd(7)} | ${r.t1_margin_pct >= 0 ? '+' : ''}${r.t1_margin_pct.toFixed(1)}% | ${r.T2 ? 'PASS' : 'FAIL'} | ${r.rsi14.toFixed(1)} | ${r.x1_verdict === 'pass' ? 'CLEAN' : 'FAIL'} | ${r.pass ? 'QUALIFIED' : 'FAILED'}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportCSV = () => {
    const headers = ['Ticker', 'Company', 'Sector', 'Role', 'Price', 'SMA200', 'Trend_Margin_Pct', 'MACD_Hist', 'RSI14', 'AI_Review_Pass', 'Overall_Verdict', 'Is_Close_Call'];
    const rows = results.map(r => [
      r.ticker,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.cluster.replace(/"/g, '""')}"`,
      `"${r.role.replace(/"/g, '""')}"`,
      r.close.toFixed(2),
      r.sma200.toFixed(2),
      r.t1_margin_pct.toFixed(2),
      r.macd_hist_norm.toFixed(4),
      r.rsi14.toFixed(2),
      r.x1_verdict === 'pass' ? 'TRUE' : 'FALSE',
      r.pass ? 'QUALIFIED' : 'FAILED',
      r.borderline ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `candidate_screening_table_${asOfDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-screener-title"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id="candidate-screener-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Candidate Screening Table (30 Stocks)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {passCount} of {results.length} Qualified
                </span>
                <TermInfoButton termId="screen_survivors" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As of <strong className="text-slate-200">{asOfDate}</strong> • Full diagnostic pass/fail results across 200-Day Trend (T1), MACD Momentum (T2), RSI (T3), and AI Earnings Review (X1).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title="Close pop-up (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Candidate Universe</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-white">{results.length}</span>
              <span className="text-[10px] text-slate-400">stocks evaluated</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Qualified (Passed)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{passCount}</span>
              <span className="text-[10px] text-emerald-400/80">ready for weighting</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Excluded (Failed)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-rose-400">{failCount}</span>
              <span className="text-[10px] text-rose-400/80">broken trend / mom</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Close Calls</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-amber-400">{borderlineCount}</span>
              <span className="text-[10px] text-amber-400/80">within 2% margin</span>
            </div>
          </div>
        </div>

        {/* Filter, Search, and Action Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, company, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Theme & Status Dropdowns */}
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sectors ({clusters.length})</option>
              {clusters.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses ({results.length})</option>
              <option value="PASS">Qualified Only ({passCount})</option>
              <option value="FAIL">Failed Only ({failCount})</option>
              <option value="BORDERLINE">Close Calls ({borderlineCount})</option>
            </select>

            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Copy candidate screening table to clipboard"
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
              title="Download screening table as CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>

          </div>

        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-y-auto min-h-[280px] p-4 bg-slate-950/40">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <tr>
                <th 
                  onClick={() => handleSort('ticker')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Ticker</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('company')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors font-sans"
                >
                  <div className="flex items-center gap-1">
                    <span>Company Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cluster')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors font-sans"
                >
                  <div className="flex items-center gap-1">
                    <span>Theme / Sector</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('close')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2.5 px-2 text-center">
                  <span title="200-Day Trend Rule: Price > 200 SMA">200 SMA</span>
                </th>
                <th className="py-2.5 px-2 text-center">
                  <span title="MACD Momentum: Histogram > 0">MACD</span>
                </th>
                <th className="py-2.5 px-2 text-center">
                  <span title="RSI Strength: Standard 40-70 or Relaxed 35-75">RSI(14)</span>
                </th>
                <th className="py-2.5 px-2 text-center">
                  <span title="AI Earnings Review for demand warnings">AI Review</span>
                </th>
                <th 
                  onClick={() => handleSort('pass')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-slate-200 transition-colors font-sans"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Overall Verdict</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    No candidate stocks match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => (
                  <tr 
                    key={item.ticker}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      item.pass ? 'bg-emerald-950/10' : 'bg-slate-900/40'
                    }`}
                  >
                    {/* Ticker */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {item.ticker}
                      </span>
                    </td>

                    {/* Company Name */}
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-medium text-slate-200 text-xs block">
                        {item.company}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">
                        {item.role}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {item.cluster}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-2 text-right font-mono text-slate-200">
                      ${item.close.toFixed(2)}
                    </td>

                    {/* T1 (200 SMA) */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.T1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.T1 ? '+' : ''}{item.t1_margin_pct.toFixed(1)}%
                      </span>
                    </td>

                    {/* T2 (MACD) */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.T2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {item.T2 ? 'POS' : 'NEG'}
                      </span>
                    </td>

                    {/* T3 (RSI) */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        item.T3 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-medium'
                      }`}>
                        {item.rsi14.toFixed(1)}
                      </span>
                    </td>

                    {/* X1 (AI Review) */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => setActiveX1Modal(item)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/20 transition-colors"
                        title="View earnings transcript review details"
                      >
                        <FileText className="w-3 h-3 text-teal-400" />
                        <span>{item.x1_verdict === 'pass' ? 'Clean' : 'Warning'}</span>
                      </button>
                    </td>

                    {/* Overall Verdict */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      {item.pass ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>QUALIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>FAILED</span>
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              All 4 technical and qualitative filters must pass simultaneously for a stock to enter portfolio weighting.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm self-end sm:self-auto"
          >
            Done
          </button>
        </div>

      </div>

      {/* Nested X1 Transcript Excerpt Modal */}
      {activeX1Modal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h4 className="font-semibold text-white text-sm">
                  {activeX1Modal.ticker} - Earnings Transcript AI Screen
                </h4>
              </div>
              <button 
                onClick={() => setActiveX1Modal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Company & Infrastructure Role</span>
                <p className="font-medium text-white">{activeX1Modal.company} ({activeX1Modal.cluster})</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{activeX1Modal.role}</p>
              </div>

              <div className="p-3 bg-teal-950/20 border border-teal-500/30 rounded-lg">
                <span className="text-[10px] text-teal-400 block mb-1 font-semibold uppercase tracking-wider">AI Screen Verdict</span>
                <p className="text-teal-200">
                  {activeX1Modal.x1_pass 
                    ? 'CLEAN: No demand deceleration, margin collapse, or customer capex pullback signals detected.'
                    : 'FLAGGED: Negative demand commentary or significant structural headwinds detected.'}
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                <span className="text-[10px] text-slate-400 block mb-1 font-sans">Verified Ground-Truth Transcript Note:</span>
                "{activeX1Modal.company} management confirmed robust datacenter and physical infrastructure backlog with no order cancellations."
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveX1Modal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
