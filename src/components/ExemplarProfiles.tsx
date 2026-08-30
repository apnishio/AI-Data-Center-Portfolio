import React from 'react';
import { PROFILED_EXEMPLARS } from '../data/referenceData';
import { ExemplarProfile, ScreeningResult } from '../types';
import { EARNINGS_PACKETS } from '../data/earningsPackets';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Quote, 
  FileText, 
  Bookmark
} from 'lucide-react';
import { TermInfoButton } from './TermExplainer';

interface ExemplarProfilesProps {
  screeningResults?: ScreeningResult[];
  isLive?: boolean;
}

export const ExemplarProfiles: React.FC<ExemplarProfilesProps> = ({
  screeningResults,
  isLive = false
}) => {
  const resultMap = new Map<string, ScreeningResult>(
    (screeningResults || []).map(r => [r.ticker, r])
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-semibold text-white">
              Representative Case Studies & Lessons
            </h3>
            <TermInfoButton termId="physical_layer" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dives across 10 key companies showcasing why stocks passed or failed our trend and AI guidance rules
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 w-fit">
          10 Case Studies
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROFILED_EXEMPLARS.map((item) => {
          const liveResult = resultMap.get(item.ticker);
          
          let isPass = item.status === 'PASS';
          let isTrendFail = item.status === 'FAIL_TREND';
          let isMomFail = item.status === 'FAIL_MOMENTUM';
          let techSummary = item.technical_summary;
          let x1Verdict = item.x1_verdict;
          let x1Evidence = item.x1_evidence;

          if (liveResult) {
            isPass = liveResult.pass;
            isTrendFail = !liveResult.T1;
            isMomFail = liveResult.T1 && (!liveResult.T2 || !liveResult.T3);
            
            techSummary = liveResult.pass 
              ? `PASS: $${liveResult.close.toFixed(2)} (+${liveResult.t1_margin_pct.toFixed(1)}% vs 200 SMA), MACD ${liveResult.macd_hist > 0 ? '+' : ''}${liveResult.macd_hist.toFixed(2)}, RSI ${liveResult.rsi14.toFixed(1)}`
              : `FAIL: ${liveResult.fail_reason || 'Did not meet all rules'} (Price: $${liveResult.close.toFixed(2)}, 200 SMA: $${liveResult.sma200.toFixed(2)})`;
            
            if (liveResult.x1_verdict) {
              x1Verdict = liveResult.x1_verdict;
            }
            if (liveResult.x1_evidence) {
              x1Evidence = liveResult.x1_evidence;
            }
          }

          return (
            <div
              key={item.ticker}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isPass 
                  ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40' 
                  : isTrendFail
                  ? 'bg-rose-950/10 border-rose-500/30'
                  : 'bg-amber-950/10 border-amber-500/30'
              }`}
            >
              <div>
                
                {/* Header */}
                <div className="flex items-start justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-bold font-mono px-2 py-1 bg-slate-800 text-white rounded-lg border border-slate-700">
                      {item.ticker}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{item.company}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{item.cluster}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isPass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    isTrendFail ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isPass && <CheckCircle2 className="w-3 h-3" />}
                    {isTrendFail && <XCircle className="w-3 h-3" />}
                    {isMomFail && <AlertTriangle className="w-3 h-3" />}
                    <span>{isPass ? 'QUALIFIED' : isTrendFail ? 'FAILED TREND' : 'FAILED MOMENTUM'}</span>
                  </span>
                </div>

                {/* Technical Result */}
                <div className="mt-3 text-xs space-y-2">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                    <span className="text-slate-400 block text-[10px] font-sans">Screening Status & Verdict:</span>
                    <span className="text-slate-200 font-semibold">{techSummary}</span>
                  </div>

                  {/* Profile & Lesson Notes */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                    {item.profile_notes}
                  </p>
                </div>

              </div>

              {/* X1 Text Screen Section */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400 flex items-center gap-1 font-sans">
                    <FileText className="w-3 h-3 text-teal-400" />
                    <span>AI Earnings Transcript Review (X1):</span>
                    <TermInfoButton termId="x1_guidance" />
                  </span>
                  <span className={`font-bold uppercase text-[10px] ${
                    isLive && x1Verdict
                      ? x1Verdict === 'fail' ? 'text-rose-400' : 'text-emerald-400'
                      : 'text-slate-500'
                  }`}>
                    {isLive && x1Verdict ? x1Verdict.toUpperCase() : 'NOT RUN'}
                  </span>
                </div>
                
                <div className="space-y-1 mt-1.5">
                  {(() => {
                    const packet = EARNINGS_PACKETS[item.ticker];
                    const isPlaceholder = packet ? packet.isPlaceholder : true;
                    return isPlaceholder ? (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ILLUSTRATIVE TEXT — placeholder, not an actual company statement
                      </span>
                    ) : null;
                  })()}
                  {isLive && x1Verdict ? (
                    <blockquote className="text-[11px] text-slate-300 italic bg-slate-950 p-2 rounded border border-slate-800 line-clamp-2">
                      "{x1Evidence}"
                    </blockquote>
                  ) : (
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60 space-y-1">
                      {x1Evidence && (
                        <blockquote className="text-[11px] text-slate-400 italic line-clamp-2">
                          "{x1Evidence}"
                        </blockquote>
                      )}
                      <p className="text-[10px] text-slate-500 italic pt-0.5">
                        * AI guidance screen (X1) executes only in Live Mode with an OpenRouter API key; reference results reflect technical rules only.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
