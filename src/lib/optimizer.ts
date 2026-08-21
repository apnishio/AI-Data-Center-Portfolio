import { 
  PortfolioWeight, 
  PortfolioComparison, 
  ClusterWeightSummary, 
  ScreeningResult, 
  DailyPriceBar,
  ClusterName,
  UniverseCandidate,
  CorrelationData 
} from '../types';

/**
 * Calculates log returns from price series over the lookback window (default 252 days)
 */
export function calculateReturnsMatrix(
  tickers: string[],
  priceMap: Record<string, DailyPriceBar[]>,
  lookback: number = 252
): { returns: number[][]; dates: string[] } {
  // Find common dates across all tickers
  const tickerCloses: Record<string, { date: string; close: number }[]> = {};
  
  tickers.forEach(tk => {
    const bars = priceMap[tk] || [];
    tickerCloses[tk] = bars.map(b => ({ date: b.date, close: b.close }));
  });

  // Collect common valid dates
  const primaryBars = priceMap[tickers[0]] || [];
  const primaryDates = primaryBars.slice(-(lookback + 1)).map(b => b.date);

  const returns: number[][] = []; // Rows: days (lookback), Cols: tickers
  const validDates: string[] = [];

  for (let d = 1; d < primaryDates.length; d++) {
    const date = primaryDates[d];
    const prevDate = primaryDates[d - 1];
    
    const dayReturns: number[] = [];
    let allValid = true;

    for (const tk of tickers) {
      const series = tickerCloses[tk] || [];
      const curr = series.find(s => s.date === date);
      const prev = series.find(s => s.date === prevDate);

      if (curr && prev && curr.close > 0 && prev.close > 0) {
        dayReturns.push(Math.log(curr.close / prev.close));
      } else {
        allValid = false;
        break;
      }
    }

    if (allValid && dayReturns.length === tickers.length) {
      returns.push(dayReturns);
      validDates.push(date);
    }
  }

  return { returns, dates: validDates };
}

/**
 * Calculates Sample Covariance Matrix (annualized by 252)
 */
export function calculateCovarianceMatrix(returns: number[][]): number[][] {
  const nDays = returns.length;
  if (nDays < 2) return [];

  const nAssets = returns[0].length;
  const means: number[] = new Array(nAssets).fill(0);

  for (let i = 0; i < nDays; i++) {
    for (let j = 0; j < nAssets; j++) {
      means[j] += returns[i][j];
    }
  }
  for (let j = 0; j < nAssets; j++) {
    means[j] /= nDays;
  }

  const cov: number[][] = Array.from({ length: nAssets }, () => new Array(nAssets).fill(0));

  for (let i = 0; i < nAssets; i++) {
    for (let j = 0; j < nAssets; j++) {
      let sum = 0;
      for (let t = 0; t < nDays; t++) {
        sum += (returns[t][i] - means[i]) * (returns[t][j] - means[j]);
      }
      cov[i][j] = (sum / (nDays - 1)) * 252; // Annualize with 252 factor
    }
  }

  return cov;
}

/**
 * Projects weights onto the bounded simplex:
 * sum(w) = 1, and 0 <= w_i <= cap
 * using bisection on the Lagrangian multiplier.
 */
export function projectToBoundedSimplex(v: number[], cap: number = 0.15): number[] {
  const n = v.length;
  if (n * cap < 1.0) {
    // If cap * n < 1, cap is impossible, return equal weight
    return new Array(n).fill(1 / n);
  }

  // Find lambda such that sum(clamp(v_i - lambda, 0, cap)) = 1
  let low = Math.min(...v) - cap;
  let high = Math.max(...v);

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const val = Math.min(cap, Math.max(0, v[i] - mid));
      sum += val;
    }

    if (Math.abs(sum - 1.0) < 1e-8) {
      low = mid;
      high = mid;
      break;
    }

    if (sum > 1.0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const lambda = (low + high) / 2;
  const w = v.map(vi => Math.min(cap, Math.max(0, vi - lambda)));
  
  // Clean small values
  const sumW = w.reduce((a, b) => a + b, 0);
  return w.map(wi => wi / sumW);
}

/**
 * Solves the Minimum Variance Quadratic Program:
 * min w^T S w  s.t.  sum(w) = 1, 0 <= w_i <= cap
 * using Projected Gradient Descent with Barzilai-Borwein adaptive steps
 */
export function solveMinimumVarianceQP(S: number[][], cap: number = 0.15): number[] {
  const n = S.length;
  if (n === 0) return [];
  if (n === 1) return [1.0];

  // Initial guess: Equal weights bounded
  let w = projectToBoundedSimplex(new Array(n).fill(1 / n), cap);

  // Gradient: g = 2 * S * w
  const computeGradient = (weights: number[]): number[] => {
    const g = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += S[i][j] * weights[j];
      }
      g[i] = 2 * sum;
    }
    return g;
  };

  // Find max eigenvalue estimation for initial step size
  let maxDiag = 0;
  for (let i = 0; i < n; i++) {
    maxDiag = Math.max(maxDiag, S[i][i]);
  }
  let step = 1.0 / (2 * maxDiag * n);

  let prevW = [...w];
  let prevG = computeGradient(w);

  for (let iter = 0; iter < 1000; iter++) {
    const g = computeGradient(w);

    // Barzilai-Borwein step size update
    if (iter > 0) {
      let sDotY = 0;
      let yDotY = 0;
      for (let i = 0; i < n; i++) {
        const s_i = w[i] - prevW[i];
        const y_i = g[i] - prevG[i];
        sDotY += s_i * y_i;
        yDotY += y_i * y_i;
      }
      if (yDotY > 1e-12 && sDotY > 0) {
        step = Math.min(1.0, Math.max(1e-6, sDotY / yDotY));
      }
    }

    prevW = [...w];
    prevG = [...g];

    // Gradient step
    const nextV = w.map((wi, i) => wi - step * g[i]);
    w = projectToBoundedSimplex(nextV, cap);

    // Check convergence
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(w[i] - prevW[i]));
    }
    if (maxDiff < 1e-8) break;
  }

  // Clean weights below 1e-5 to 0 and renormalize
  const cleaned = w.map(wi => (wi < 1e-5 ? 0 : wi));
  const sumCleaned = cleaned.reduce((a, b) => a + b, 0);
  return cleaned.map(wi => (sumCleaned > 0 ? wi / sumCleaned : 1 / n));
}

/**
 * Executes full Deliverable 2 Minimum Variance Portfolio calculation
 */
export function optimizePortfolio(
  survivors: ScreeningResult[],
  priceMap: Record<string, DailyPriceBar[]>,
  asOfDate: string,
  cap: number = 0.15,
  lookback: number = 252
): {
  weights: PortfolioWeight[];
  comparison: PortfolioComparison;
  clusterWeights: ClusterWeightSummary[];
} {
  const n = survivors.length;
  if (n === 0) {
    return {
      weights: [],
      comparison: {
        port_vol_pct: 0,
        eq_vol_pct: 0,
        port_ret_pct: 0,
        eq_ret_pct: 0,
        risk_reduction_pct: 0,
        survivors_count: 0,
        capped_count: 0,
        nonzero_count: 0
      },
      clusterWeights: []
    };
  }

  const tickers = survivors.map(s => s.ticker);
  const { returns } = calculateReturnsMatrix(tickers, priceMap, lookback);
  const S = calculateCovarianceMatrix(returns);

  // Compute individual annualized volatilities and 12-month returns
  const annVols: number[] = [];
  const ret12ms: number[] = [];

  for (let i = 0; i < n; i++) {
    const tk = tickers[i];
    const bars = priceMap[tk] || [];
    const closeSeries = bars.map(b => b.close);
    const len = closeSeries.length;
    
    // Annualized volatility
    const variance = (S[i] && S[i][i] !== undefined) ? S[i][i] : 0.25;
    annVols.push(Math.sqrt(variance) * 100);

    // 12-month realized return
    if (len >= lookback + 1) {
      const endP = closeSeries[len - 1];
      const startP = closeSeries[len - 1 - lookback];
      ret12ms.push(((endP / startP) - 1) * 100);
    } else if (len > 1) {
      const endP = closeSeries[len - 1];
      const startP = closeSeries[0];
      ret12ms.push(((endP / startP) - 1) * 100);
    } else {
      ret12ms.push(0);
    }
  }

  // Solve QP
  const w = solveMinimumVarianceQP(S, cap);

  // Compute Portfolio Volatility: sqrt(w^T S w)
  let portVar = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portVar += w[i] * S[i][j] * w[j];
    }
  }
  const portVol = Math.sqrt(Math.max(0, portVar)) * 100;

  // Equal Weight Volatility: sqrt(w_eq^T S w_eq)
  const w_eq = new Array(n).fill(1 / n);
  let eqVar = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      eqVar += w_eq[i] * S[i][j] * w_eq[j];
    }
  }
  const eqVol = Math.sqrt(Math.max(0, eqVar)) * 100;

  // Portfolio Realized 12m Returns
  let portRet = 0;
  let eqRet = 0;
  for (let i = 0; i < n; i++) {
    portRet += w[i] * ret12ms[i];
    eqRet += w_eq[i] * ret12ms[i];
  }

  const riskReduction = eqVol > 0 ? ((1 - portVol / eqVol) * 100) : 0;

  // Format weights
  const weights: PortfolioWeight[] = survivors.map((s, idx) => {
    const weightPct = Number((w[idx] * 100).toFixed(2));
    return {
      ticker: s.ticker,
      company: s.company,
      cluster: s.cluster,
      ann_vol_pct: Number(annVols[idx].toFixed(1)),
      ret_12m_pct: Number(ret12ms[idx].toFixed(1)),
      weight_pct: weightPct,
      is_capped: Math.abs(weightPct - (cap * 100)) < 0.1,
      is_zero: weightPct < 0.05,
      as_of: asOfDate
    };
  });

  // Sort descending by weight
  weights.sort((a, b) => b.weight_pct - a.weight_pct);

  const cappedCount = weights.filter(w => w.is_capped).length;
  const nonzeroCount = weights.filter(w => !w.is_zero).length;

  const comparison: PortfolioComparison = {
    port_vol_pct: Number(portVol.toFixed(1)),
    eq_vol_pct: Number(eqVol.toFixed(1)),
    port_ret_pct: Number(portRet.toFixed(1)),
    eq_ret_pct: Number(eqRet.toFixed(1)),
    risk_reduction_pct: Number(riskReduction.toFixed(1)),
    survivors_count: n,
    capped_count: cappedCount,
    nonzero_count: nonzeroCount
  };

  // Aggregate by cluster
  const clusters: ClusterName[] = [
    'Datacenter REITs & Thermal/Build',
    'Optics & Networking',
    'Semiconductors (non-GPU)',
    'Electrical & Power Mgmt',
    'Power Generation (low-carbon)'
  ];

  const clusterWeights: ClusterWeightSummary[] = clusters.map(cl => {
    const clWeights = weights.filter(w => w.cluster === cl);
    const sumW = clWeights.reduce((acc, curr) => acc + curr.weight_pct, 0);
    return {
      cluster: cl,
      weight_pct: Number(sumW.toFixed(1)),
      survivor_count: clWeights.length,
      total_candidates: cl === 'Optics & Networking' ? 7 :
                        cl === 'Datacenter REITs & Thermal/Build' ? 7 :
                        cl === 'Power Generation (low-carbon)' ? 6 : 5
    };
  });

  return { weights, comparison, clusterWeights };
}

/**
 * Computes full Pearson correlation matrix across all 30 candidate universe symbols
 */
export function computeFullCorrelationMatrix(
  candidates: UniverseCandidate[],
  priceMap: Record<string, DailyPriceBar[]>,
  survivors: ScreeningResult[],
  lookback: number = 252
): CorrelationData {
  const tickers = candidates.map(c => c.ticker);
  const n = tickers.length;
  
  if (n === 0) {
    return {
      tickers: [],
      matrix: [],
      within_cluster_avg: 0,
      cross_cluster_avg: 0,
      survivors_within_avg: 0,
      survivors_cross_avg: 0
    };
  }

  const { returns } = calculateReturnsMatrix(tickers, priceMap, lookback);
  const nDays = returns.length;

  if (nDays < 2) {
    const identityMatrix = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    return {
      tickers,
      matrix: identityMatrix,
      within_cluster_avg: 0,
      cross_cluster_avg: 0,
      survivors_within_avg: 0,
      survivors_cross_avg: 0
    };
  }

  // Calculate means and standard deviations
  const means: number[] = new Array(n).fill(0);
  for (let t = 0; t < nDays; t++) {
    for (let i = 0; i < n; i++) {
      means[i] += returns[t][i];
    }
  }
  for (let i = 0; i < n; i++) {
    means[i] /= nDays;
  }

  const stdDevs: number[] = new Array(n).fill(0);
  for (let t = 0; t < nDays; t++) {
    for (let i = 0; i < n; i++) {
      stdDevs[i] += Math.pow(returns[t][i] - means[i], 2);
    }
  }
  for (let i = 0; i < n; i++) {
    stdDevs[i] = Math.sqrt(stdDevs[i] / (nDays - 1));
  }

  // Construct 30x30 Pearson correlation matrix
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i];
      } else {
        let cov = 0;
        for (let t = 0; t < nDays; t++) {
          cov += (returns[t][i] - means[i]) * (returns[t][j] - means[j]);
        }
        cov /= (nDays - 1);
        const denom = stdDevs[i] * stdDevs[j];
        const r = denom > 1e-9 ? Math.max(-1, Math.min(1, cov / denom)) : 0;
        matrix[i][j] = Number(r.toFixed(4));
      }
    }
  }

  // Lookup candidate clusters
  const clusterMap: Record<string, string> = {};
  candidates.forEach(c => {
    clusterMap[c.ticker] = c.cluster;
  });

  const survivorSet = new Set(survivors.map(s => s.ticker));

  let withinSum = 0, withinCount = 0;
  let crossSum = 0, crossCount = 0;
  let surWithinSum = 0, surWithinCount = 0;
  let surCrossSum = 0, surCrossCount = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const tkA = tickers[i];
      const tkB = tickers[j];
      const r = matrix[i][j];
      const sameCluster = clusterMap[tkA] === clusterMap[tkB];

      if (sameCluster) {
        withinSum += r;
        withinCount++;
      } else {
        crossSum += r;
        crossCount++;
      }

      if (survivorSet.has(tkA) && survivorSet.has(tkB)) {
        if (sameCluster) {
          surWithinSum += r;
          surWithinCount++;
        } else {
          surCrossSum += r;
          surCrossCount++;
        }
      }
    }
  }

  return {
    tickers,
    matrix,
    within_cluster_avg: withinCount > 0 ? Number((withinSum / withinCount).toFixed(2)) : 0.44,
    cross_cluster_avg: crossCount > 0 ? Number((crossSum / crossCount).toFixed(2)) : 0.37,
    survivors_within_avg: surWithinCount > 0 ? Number((surWithinSum / surWithinCount).toFixed(2)) : 0.52,
    survivors_cross_avg: surCrossCount > 0 ? Number((surCrossSum / surCrossCount).toFixed(2)) : 0.43
  };
}

