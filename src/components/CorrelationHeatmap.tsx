import React, { useState } from 'react';
import { CorrelationData } from '../types';
import { Network, Info, ArrowUpRight } from 'lucide-react';
import { TermInfoButton } from './TermExplainer';

interface CorrelationHeatmapProps {
  correlationData: CorrelationData;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationData
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    val: number;
    ticker1: string;
    ticker2: string;
  } | null>(null);

  const { tickers, matrix, within_cluster_avg, cross_cluster_avg, survivors_within_avg, survivors_cross_avg } = correlationData;
  const n = tickers.length;

  // Cluster groupings for headers and boundaries
  const clusters = [
    { name: 'Optics & Net', count: 7, color: '#06b6d4' },
    { name: 'Power Mgmt', count: 5, color: '#f59e0b' },
    { name: 'Semis', count: 5, color: '#a855f7' },
    { name: 'Clean Power', count: 6, color: '#14b8a6' },
    { name: 'REITs / Build', count: 7, color: '#3b82f6' }
  ];

  // Helper for color mapping: correlation from 0.0 to 1.0 (Dark Blue -> Teal -> Purple -> Warm Amber -> Bright Red)
  const getCellColor = (val: number) => {
    if (val >= 0.99) return '#ffffff'; // Diagonal
    if (val >= 0.70) return '#ef4444'; // Red (High correlation)
    if (val >= 0.55) return '#f97316'; // Orange
    if (val >= 0.45) return '#eab308'; // Yellow/Amber
    if (val >= 0.35) return '#10b981'; // Green/Teal
    if (val >= 0.25) return '#06b6d4'; // Cyan
    return '#1e3a8a';                  // Blue (Low correlation)
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              Stock Diversification & Correlation Heatmap
            </h3>
            <TermInfoButton termId="correlation_matrix" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Measures how closely stocks move together: Cooler colors (blue/cyan) = great diversification, warmer colors = move in sync
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-slate-400">Low / Uncorrelated (0.2)</span>
          <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-blue-900 via-teal-500 via-amber-500 to-red-500"></div>
          <span className="text-slate-400">High / In Sync (0.8+)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Heatmap Matrix (3 cols) */}
        <div className="lg:col-span-3 overflow-x-auto flex flex-col items-center">
          
          <div className="inline-block p-2 bg-slate-950 rounded-xl border border-slate-800">
            {/* Top Cluster Labels */}
            <div className="flex ml-7 mb-1 font-sans text-[10px] text-slate-400 font-semibold">
              {clusters.map(cl => (
                <div 
                  key={cl.name} 
                  className="text-center truncate px-0.5" 
                  style={{ width: `${cl.count * 18}px`, borderBottom: `2px solid ${cl.color}` }}
                  title={cl.name}
                >
                  {cl.name}
                </div>
              ))}
            </div>

            {/* Matrix Grid */}
            <div className="flex flex-col">
              {matrix.map((row, rIdx) => {
                const isClusterBoundary = [6, 11, 16, 22].includes(rIdx);

                return (
                  <div key={`row-${rIdx}`} className="flex items-center">
                    
                    {/* Left Ticker Label */}
                    <span className="w-7 text-[9px] font-mono text-slate-400 text-right pr-1 select-none">
                      {tickers[rIdx]}
                    </span>

                    {/* Row cells */}
                    <div className={`flex ${isClusterBoundary ? 'border-b border-slate-600/70 mb-0.5' : ''}`}>
                      {row.map((val, cIdx) => {
                        const isColBoundary = [6, 11, 16, 22].includes(cIdx);
                        const isDiag = rIdx === cIdx;
                        const cellColor = isDiag ? '#334155' : getCellColor(val);

                        return (
                          <div
                            key={`cell-${rIdx}-${cIdx}`}
                            className={`w-[17px] h-[17px] m-[0.5px] rounded-[1px] transition-all cursor-pointer relative ${
                              isColBoundary ? 'mr-1 border-r border-slate-600/70' : ''
                            } ${
                              hoveredCell?.row === rIdx && hoveredCell?.col === cIdx 
                                ? 'scale-125 z-10 ring-2 ring-white shadow-lg' 
                                : ''
                            }`}
                            style={{ backgroundColor: cellColor }}
                            onMouseEnter={() => setHoveredCell({
                              row: rIdx,
                              col: cIdx,
                              val,
                              ticker1: tickers[rIdx],
                              ticker2: tickers[cIdx]
                            })}
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Ticker Labels */}
            <div className="flex ml-7 mt-1 font-mono text-[8px] text-slate-500">
              {tickers.map(tk => (
                <div key={`bot-${tk}`} className="w-[18px] text-center transform -rotate-90 select-none origin-center mt-2">
                  {tk}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Correlation Statistics & Findings (1 col) */}
        <div className="space-y-4">
          
          {/* Active Hover Inspector */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[11px] font-sans block mb-1">Pairwise Inspector:</span>
            {hoveredCell ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{hoveredCell.ticker1} ↔ {hoveredCell.ticker2}</span>
                  <span className="font-bold text-sm px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                    r = {hoveredCell.val.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  {hoveredCell.row === hoveredCell.col ? 'Diagonal self-correlation (1.0)' : 'Co-movement correlation score'}
                </p>
              </div>
            ) : (
              <span className="text-slate-500 italic text-[11px] font-sans">
                Hover over any cell in the grid to see how two stocks move together.
              </span>
            )}
          </div>

          {/* Statistical Metrics */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 font-sans">Average Correlation Scores</h4>
              <TermInfoButton termId="correlation_matrix" />
            </div>
            
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400 text-[11px]">All Stocks (Same Sector):</span>
                <span className="font-bold text-amber-300">{within_cluster_avg.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400 text-[11px]">All Stocks (Across Sectors):</span>
                <span className="font-bold text-cyan-300">{cross_cluster_avg.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400 text-[11px]">Qualified Stocks (Same Sector):</span>
                <span className="font-bold text-rose-300">{survivors_within_avg.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Qualified Stocks (Across Sectors):</span>
                <span className="font-bold text-purple-300">{survivors_cross_avg.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Key Insight Callout */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 leading-relaxed font-sans">
            <span className="font-semibold block mb-1">Why This Matters:</span>
            When clean power utilities fall out of the portfolio due to broken price trends, the remaining technology stocks naturally move more closely together (correlation rises from 0.37 to 0.43). The mathematical optimizer protects you by eliminating duplicate high-risk stocks.
          </div>

        </div>

      </div>

    </div>
  );
};
