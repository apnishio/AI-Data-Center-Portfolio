import React, { useState } from 'react';
import { PortfolioWeight, PortfolioComparison } from '../types';
import { Sparkles, Info } from 'lucide-react';
import { TermInfoButton } from './TermExplainer';

interface RiskReturnScatterProps {
  weights: PortfolioWeight[];
  comparison: PortfolioComparison;
}

export const RiskReturnScatter: React.FC<RiskReturnScatterProps> = ({
  weights,
  comparison
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PortfolioWeight | null>(null);

  // Dynamic bounds for SVG coordinate scaling
  const allVols = [comparison.port_vol_pct, comparison.eq_vol_pct, ...weights.map(w => w.ann_vol_pct)].filter(v => !isNaN(v) && v > 0);
  const allRets = [comparison.port_ret_pct, comparison.eq_ret_pct, ...weights.map(w => w.ret_12m_pct)].filter(r => !isNaN(r));

  const minX = Math.max(0, Math.floor(Math.min(...allVols, 20) / 10) * 10);
  const maxX = Math.max(140, Math.ceil(Math.max(...allVols, 140) / 20) * 20 + 20);
  const minY = Math.min(0, Math.floor(Math.min(...allRets, 0) / 50) * 50);
  const maxY = Math.max(600, Math.ceil(Math.max(...allRets, 600) / 100) * 100 + 50);

  const width = 800;
  const height = 480;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const scaleX = (x: number) => padding.left + ((Math.max(minX, Math.min(maxX, x)) - minX) / (maxX - minX)) * plotWidth;
  const scaleY = (y: number) => padding.top + plotHeight - ((Math.max(minY, Math.min(maxY, y)) - minY) / (maxY - minY)) * plotHeight;

  // Generate 5-7 dynamic grid tick marks
  const xStep = Math.max(10, Math.round((maxX - minX) / 6 / 10) * 10);
  const xTicks: number[] = [];
  for (let x = minX + xStep; x < maxX; x += xStep) {
    xTicks.push(x);
  }

  const yStep = Math.max(50, Math.round((maxY - minY) / 6 / 50) * 50);
  const yTicks: number[] = [];
  for (let y = minY; y <= maxY; y += yStep) {
    yTicks.push(y);
  }

  const getClusterColor = (cluster: string) => {
    switch (cluster) {
      case 'Optics & Networking': return '#06b6d4'; // Cyan
      case 'Electrical & Power Mgmt': return '#f59e0b'; // Amber
      case 'Semiconductors (non-GPU)': return '#a855f7'; // Purple
      case 'Power Generation (low-carbon)': return '#14b8a6'; // Teal
      case 'Datacenter REITs & Thermal/Build': return '#3b82f6'; // Blue
      default: return '#10b981';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Risk vs. Return Visual Map
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Dot Size = Position Weight
            </span>
            <TermInfoButton termId="portfolio_volatility" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            X-Axis: Annualized Volatility (Price Fluctuation) • Y-Axis: Past 12-Month Gain (Context Only)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>REIT / Cooling</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Optics & Fiber</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span>Datacenter Chips</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Power Equipment</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Clean Energy</span>
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-full font-mono text-[11px]"
        >
          {/* Grid lines */}
          {xTicks.map(tick => (
            <g key={`x-grid-${tick}`}>
              <line
                x1={scaleX(tick)}
                y1={padding.top}
                x2={scaleX(tick)}
                y2={padding.top + plotHeight}
                stroke="#334155"
                strokeDasharray="3,3"
                strokeOpacity="0.5"
              />
              <text
                x={scaleX(tick)}
                y={padding.top + plotHeight + 20}
                fill="#94a3b8"
                textAnchor="middle"
              >
                {tick}%
              </text>
            </g>
          ))}

          {yTicks.map(tick => (
            <g key={`y-grid-${tick}`}>
              <line
                x1={padding.left}
                y1={scaleY(tick)}
                x2={padding.left + plotWidth}
                y2={scaleY(tick)}
                stroke="#334155"
                strokeDasharray="3,3"
                strokeOpacity="0.5"
              />
              <text
                x={padding.left - 12}
                y={scaleY(tick) + 4}
                fill="#94a3b8"
                textAnchor="end"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 12}
            fill="#cbd5e1"
            textAnchor="middle"
            className="font-sans font-medium text-xs"
          >
            Annual Price Volatility (Lower = Steadier)
          </text>
          <text
            transform={`rotate(-90)`}
            x={-(padding.top + plotHeight / 2)}
            y={20}
            fill="#cbd5e1"
            textAnchor="middle"
            className="font-sans font-medium text-xs"
          >
            Past 12-Month Return (Context Only)
          </text>

          {/* Minimum Variance Portfolio Point */}
          <g>
            <circle
              cx={scaleX(comparison.port_vol_pct)}
              cy={scaleY(comparison.port_ret_pct)}
              r={10}
              fill="#10b981"
              fillOpacity="0.3"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
            <circle
              cx={scaleX(comparison.port_vol_pct)}
              cy={scaleY(comparison.port_ret_pct)}
              r={4}
              fill="#10b981"
            />
            <text
              x={scaleX(comparison.port_vol_pct) + 12}
              y={scaleY(comparison.port_ret_pct) + 4}
              fill="#34d399"
              className="font-bold text-[11px]"
            >
              ★ Optimized Portfolio ({comparison.port_vol_pct.toFixed(1)}% Vol, +{comparison.port_ret_pct.toFixed(0)}% Ret)
            </text>
          </g>

          {/* Equal-Weight Portfolio Point */}
          <g>
            <circle
              cx={scaleX(comparison.eq_vol_pct)}
              cy={scaleY(comparison.eq_ret_pct)}
              r={4}
              fill="#f59e0b"
            />
            <text
              x={scaleX(comparison.eq_vol_pct) + 8}
              y={scaleY(comparison.eq_ret_pct) + 4}
              fill="#fbbf24"
              className="text-[10px]"
            >
              Simple Equal-Weight ({comparison.eq_vol_pct.toFixed(1)}% Vol, +{comparison.eq_ret_pct.toFixed(0)}% Ret)
            </text>
          </g>

          {/* Data Points */}
          {weights.map((item) => {
            const cx = scaleX(item.ann_vol_pct);
            const cy = scaleY(item.ret_12m_pct);
            const color = getClusterColor(item.cluster);

            // Radius scales from 5px to 22px based on weight
            const radius = Math.max(5, Math.min(22, 5 + (item.weight_pct / 15) * 17));

            return (
              <g
                key={item.ticker}
                className="cursor-pointer transition-transform duration-150 group"
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer Glow */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius + 3}
                  fill={color}
                  fillOpacity={hoveredPoint?.ticker === item.ticker ? 0.4 : 0.15}
                  className="transition-all"
                />

                {/* Main Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={color}
                  fillOpacity={item.is_zero ? 0.3 : 0.85}
                  stroke="#ffffff"
                  strokeWidth={hoveredPoint?.ticker === item.ticker ? 2.5 : 1}
                />

                {/* Ticker Label */}
                <text
                  x={cx}
                  y={cy - radius - 5}
                  fill="#ffffff"
                  textAnchor="middle"
                  className="font-bold text-[11px] select-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {item.ticker}
                </text>

                {/* Weight badge if > 0 */}
                {item.weight_pct > 0 && (
                  <text
                    x={cx}
                    y={cy + 3.5}
                    fill="#0f172a"
                    textAnchor="middle"
                    className="font-bold text-[9px] select-none pointer-events-none"
                  >
                    {item.weight_pct.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Detail Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl z-20 text-xs font-mono space-y-1.5 backdrop-blur max-w-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white text-sm">{hoveredPoint.ticker}</span>
              <span className="text-[10px] text-slate-400 font-sans">{hoveredPoint.cluster}</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">{hoveredPoint.company}</p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Annual Price Volatility:</span>
                <span className="text-amber-300 font-bold">{hoveredPoint.ann_vol_pct.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Past 12M Return:</span>
                <span className="text-emerald-300 font-bold">+{hoveredPoint.ret_12m_pct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Portfolio Allocation:</span>
              <span className={`font-bold ${
                hoveredPoint.is_capped ? 'text-amber-400' :
                hoveredPoint.is_zero ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {hoveredPoint.weight_pct.toFixed(2)}% {hoveredPoint.is_capped ? '(Max 15% Cap)' : hoveredPoint.is_zero ? '(0% Risk Excluded)' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Insight footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400 leading-relaxed font-sans">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>How to read this chart:</strong> Companies on the left (like Equinix, EMCOR, Comfort Systems, Vertiv, Corning) have much lower price swings, earning significant portfolio weights. Explosive high-beta stocks in the upper-right (like Lumentum, Applied Optoelectronics, Bloom Energy) carry 95%–139% volatility, so the risk optimizer excludes them (0% weight) to keep overall volatility calm.
        </p>
      </div>
    </div>
  );
};
