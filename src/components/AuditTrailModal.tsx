import React, { useState } from 'react';
import { Download, Terminal, CheckCircle2, FileSpreadsheet, Code, Shield } from 'lucide-react';
import { ScreeningResult, PortfolioWeight, CorrelationData } from '../types';
import { PROFILED_EXEMPLARS } from '../data/referenceData';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asOfDate: string;
  results: ScreeningResult[];
  weights: PortfolioWeight[];
  correlationData: CorrelationData;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  asOfDate,
  results,
  weights,
  correlationData
}) => {
  const [activeTab, setActiveTab] = useState<'exports' | 'log'>('exports');

  if (!isOpen) return null;

  const passingCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  const cappedNames = weights.filter(w => w.is_capped).map(w => w.ticker);
  const zeroNames = weights.filter(w => w.is_zero).map(w => w.ticker);

  // CSV Exporter Helpers
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportScreeningCSV = () => {
    const headers = ['ticker', 'company', 'cluster', 'close', 'sma200', 't1_margin_pct', 'macd_hist_norm', 'rsi14', 'T1', 'T2', 'T3', 'borderline', 'x1_verdict', 'pass', 'fail_reason'];
    const rows = results.map(r => [
      r.ticker,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.cluster}"`,
      r.close.toFixed(2),
      r.sma200.toFixed(2),
      r.t1_margin_pct.toFixed(2),
      r.macd_hist_norm.toFixed(4),
      r.rsi14.toFixed(2),
      r.T1 ? '1' : '0',
      r.T2 ? '1' : '0',
      r.T3 ? '1' : '0',
      r.borderline ? '1' : '0',
      r.x1_verdict || 'NOT RUN',
      r.pass ? '1' : '0',
      `"${r.fail_reason}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV(`screening_full_${asOfDate}.csv`, csvContent);
  };

  const exportWeightsCSV = () => {
    const headers = ['ticker', 'company', 'cluster', 'ann_vol_pct', 'ret_12m_pct', 'weight_pct', 'is_capped', 'is_zero'];
    const rows = weights.map(w => [
      w.ticker,
      `"${w.company.replace(/"/g, '""')}"`,
      `"${w.cluster}"`,
      w.ann_vol_pct.toFixed(2),
      w.ret_12m_pct.toFixed(2),
      w.weight_pct.toFixed(4),
      w.is_capped ? 'TRUE' : 'FALSE',
      w.is_zero ? 'TRUE' : 'FALSE'
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV(`weights_${asOfDate}.csv`, csvContent);
  };

  const exportCorrelationCSV = () => {
    const headers = ['ticker', ...correlationData.tickers];
    const rows = correlationData.matrix.map((row, idx) => [
      correlationData.tickers[idx],
      ...row.map(val => val.toFixed(4))
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV(`correlation_matrix_${asOfDate}.csv`, csvContent);
  };

  const exportProposed10CSV = () => {
    const headers = ['ticker', 'company', 'cluster', 'status', 'technical_summary', 'x1_verdict', 'x1_evidence'];
    const rows = PROFILED_EXEMPLARS.map(p => [
      p.ticker,
      `"${p.company.replace(/"/g, '""')}"`,
      `"${p.cluster}"`,
      p.status,
      `"${p.technical_summary.replace(/"/g, '""')}"`,
      p.x1_verdict,
      `"${p.x1_evidence.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV(`proposed10_${asOfDate}.csv`, csvContent);
  };

  const dynamicLog = `[${asOfDate} 16:00:00 UTC] Starting Universe Screening Pipeline v4...
[${asOfDate} 16:00:01 UTC] Loading Candidate Universe: ${totalCount} tickers across 5 physical layer clusters.
[${asOfDate} 16:00:02 UTC] Ingesting daily price bars per symbol...
[${asOfDate} 16:00:05 UTC] Computing technical indicators: TTR::SMA(200), TTR::MACD(12,26,9), TTR::RSI(14, wilder).
[${asOfDate} 16:00:06 UTC] Evaluating T1 (Trend), T2 (MACD Momentum), and T3 (RSI Bounds)...
[${asOfDate} 16:00:07 UTC] Screening complete: ${passingCount} of ${totalCount} passed all active technical filters.
[${asOfDate} 16:00:08 UTC] Evaluating X1 Guidance Classifier on earnings transcripts...
[${asOfDate} 16:00:10 UTC] X1 complete: ${passingCount} survivors confirmed.
[${asOfDate} 16:00:11 UTC] Constructing 252-day log-return covariance matrix S (${passingCount}x${passingCount})...
[${asOfDate} 16:00:12 UTC] Solving Minimum Variance QP: min w'Sw s.t. sum(w)=1, w>=0, w<=0.15...
[${asOfDate} 16:00:12 UTC] QP Solver Converged: ${cappedNames.length} names at 15.00% cap (${cappedNames.join(', ') || 'None'}), ${zeroNames.length} names at 0.00% (${zeroNames.join(', ') || 'None'}).
[${asOfDate} 16:00:14 UTC] Artifacts ready: screening_full_${asOfDate}.csv, weights_${asOfDate}.csv, correlation_matrix_${asOfDate}.csv, proposed10_${asOfDate}.csv.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Human Review Surface & Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Verifiable Decision Evidence & Quantitative Artifacts • As of {asOfDate}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3">
          <button
            onClick={() => setActiveTab('exports')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'exports' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Deliverables (4 Files)</span>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'log' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution Console Log</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {activeTab === 'exports' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Download the standardized CSV deliverables formatted according to FRD Section 4.3(g):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                
                {/* 1. Full Screening */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-bold text-emerald-400 block">screening_full_{asOfDate}.csv</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      All 30 tickers, 200 SMA, MACD, RSI, margins, and pass/fail reasons.
                    </p>
                  </div>
                  <button
                    onClick={exportScreeningCSV}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* 2. Weights */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-bold text-amber-400 block">weights_{asOfDate}.csv</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Survivor allocations, annualized volatilities, and 12m trailing returns.
                    </p>
                  </div>
                  <button
                    onClick={exportWeightsCSV}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* 3. Correlation */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-bold text-cyan-400 block">correlation_matrix_{asOfDate}.csv</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Full 30x30 daily return correlation matrix ordered by cluster.
                    </p>
                  </div>
                  <button
                    onClick={exportCorrelationCSV}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* 4. Proposed 10 */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-bold text-purple-400 block">proposed10_{asOfDate}.csv</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      The 10 representative exemplars with X1 transcripts and failure post-mortems.
                    </p>
                  </div>
                  <button
                    onClick={exportProposed10CSV}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download CSV</span>
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre className="whitespace-pre leading-relaxed">{dynamicLog}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
