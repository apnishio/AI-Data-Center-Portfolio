import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Layers, Database } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                About this App
              </h2>
              <p className="text-xs text-slate-400">
                Trend-Confirmed AI Datacenter Enablement Portfolio • Ana Paula Nishio de Sousa
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
              1. Investment Thesis & Physical Layer Universe
            </h3>
            <p>
              This strategy invests in US-listed companies that supply the physical layer of AI datacenter construction: optics and networking, electrical equipment and power management, low-carbon power generation, datacenter real estate, and thermal management/cooling.
            </p>
            <p>
              <strong>Compute Layer Exclusion:</strong> The compute layer (GPU manufacturers like NVIDIA) and hyperscalers are deliberately excluded. Market prices for compute are heavily scrutinized, carry extreme volatility, and trade at elevated valuation multiples. The physical layer captures the same capex expansion wave with more structural durability.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
              2. Selection Criteria & Technical Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">T1: 200-Day Trend</span>
                <p className="text-slate-300 font-sans">
                  The last close price must be strictly above the 200-day simple moving average (SMA-200).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">T2: MACD Momentum</span>
                <p className="text-slate-300 font-sans">
                  MACD(12, 26, 9) histogram must be strictly positive (MACD line above Signal line).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">T3: Healthy RSI Range</span>
                <p className="text-slate-300 font-sans">
                  14-day RSI must lie between 40 and 70 (Wilder's smoothing). Filters decaying and overextended momentum.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
              <span className="font-bold text-teal-400 block">X1: LLM Guidance Text Screen</span>
              <p className="text-slate-300 font-sans">
                An LLM screens the company's most recent earnings call transcript. Any stock with explicit negative forward guidance or customer demand warnings is excluded from portfolio allocation.
              </p>
            </div>
          </section>

          {/* Section 3: Fallback Rules */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
              3. Fallback Rules for Market Pullbacks
            </h3>
            <p>
              <strong>Fallback Rule 1:</strong> If fewer than 15 names pass under the standard RSI [40, 70] band, T3 is relaxed to RSI [35, 75], and the relaxation is reported prominently.
            </p>
            <p>
              <strong>Fallback Rule 2:</strong> If fewer than 15 names still pass after relaxation, the portfolio proceeds with surviving names and displays a prominent notice that the portfolio is below target breadth due to prevailing market pullbacks. The strategy never force-fills names that fail rules.
            </p>
          </section>

          {/* Section 4: Deliverable 2 Optimization */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
              4. Deliverable 2: Minimum Variance Optimization
            </h3>
            <p>
              The portfolio consists of all screen survivors weighted via Quadratic Programming:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-xs">
              <li>Objective: Minimize portfolio variance <code className="text-emerald-400">w^T S w</code> over 252-day annualized covariance.</li>
              <li>Fully Invested constraint: <code className="text-emerald-400">sum(w) = 1.0</code></li>
              <li>Long-Only constraint: <code className="text-emerald-400">w_i &gt;= 0</code></li>
              <li>Maximum Single-Stock Cap: <code className="text-emerald-400">w_i &lt;= 0.15 (15%)</code></li>
            </ul>
          </section>

          {/* Section 5: Risk Factors */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
              5. Known Limitations & Institutional Findings
            </h3>
            <p>
              • <strong>Day-to-day sensitivity:</strong> 16 of 30 candidate verdicts are borderline, meaning ordinary market fluctuations can flip verdicts.
              <br />
              • <strong>Green Tilt Reality:</strong> The low-carbon power cluster failed almost entirely on 20 August 2026 (1/6 passing), because rate-sensitive utilities broke 200 SMA trend. The strategy holds rules over narrative.
              <br />
              • <strong>Correlation Concentration:</strong> Screen survivors exhibit higher mutual correlation (0.43 vs 0.37) as uncorrelated utilities get screened out.
            </p>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
};
