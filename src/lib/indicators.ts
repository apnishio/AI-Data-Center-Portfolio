import { DailyPriceBar, ScreeningResult, ScreeningRegime, UniverseCandidate } from '../types';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN);
  if (data.length < period) return result;
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  result[period - 1] = sum / period;
  
  for (let i = period; i < data.length; i++) {
    sum += data[i] - data[i - period];
    result[i] = sum / period;
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 * Matching R TTR / standard financial conventions: alpha = 2 / (period + 1)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN);
  if (data.length < period) return result;
  
  // Seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  result[period - 1] = sum / period;
  
  const alpha = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    result[i] = data[i] * alpha + result[i - 1] * (1 - alpha);
  }
  return result;
}

/**
 * Calculates MACD(12, 26, 9)
 * Returns { macd, signal, histogram }
 */
export function calculateMACD(
  closes: number[], 
  nFast: number = 12, 
  nSlow: number = 26, 
  nSignal: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(closes, nFast);
  const emaSlow = calculateEMA(closes, nSlow);
  
  const macd: number[] = new Array(closes.length).fill(NaN);
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(emaFast[i]) && !isNaN(emaSlow[i])) {
      macd[i] = emaFast[i] - emaSlow[i];
    }
  }
  
  // Find first non-NaN index in macd to compute Signal EMA
  const validMacdValues: number[] = [];
  const validIndices: number[] = [];
  for (let i = 0; i < macd.length; i++) {
    if (!isNaN(macd[i])) {
      validMacdValues.push(macd[i]);
      validIndices.push(i);
    }
  }
  
  const signalEmaValid = calculateEMA(validMacdValues, nSignal);
  const signal: number[] = new Array(closes.length).fill(NaN);
  const histogram: number[] = new Array(closes.length).fill(NaN);
  
  for (let k = 0; k < validIndices.length; k++) {
    const origIdx = validIndices[k];
    const sigVal = signalEmaValid[k];
    signal[origIdx] = sigVal;
    if (!isNaN(sigVal) && !isNaN(macd[origIdx])) {
      histogram[origIdx] = macd[origIdx] - sigVal;
    }
  }
  
  return { macd, signal, histogram };
}

/**
 * Calculates 14-day RSI using Wilder's smoothing (standard in R TTR)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return result;
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // First average (SMA of gains/losses)
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;
  
  result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
  
  // Wilder's smoothing for subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    if (avgLoss === 0) {
      result[i + 1] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i + 1] = 100 - (100 / (1 + rs));
    }
  }
  
  return result;
}

/**
 * Screens a single candidate's price series
 */
export function screenCandidate(
  candidate: UniverseCandidate, 
  priceBars: DailyPriceBar[],
  asOfDate: string,
  regime: ScreeningRegime = 'standard'
): ScreeningResult {
  if (!priceBars || priceBars.length < 210) {
    return {
      ticker: candidate.ticker,
      company: candidate.company,
      cluster: candidate.cluster,
      role: candidate.role,
      days: priceBars ? priceBars.length : 0,
      close: 0,
      sma200: 0,
      t1_margin_pct: 0,
      macd_hist: 0,
      macd_hist_norm: 0,
      rsi14: 0,
      T1: false,
      T2: false,
      T3: false,
      borderline: false,
      eligible: false,
      pass: false,
      overall_status: 'INELIGIBLE',
      fail_reason: 'Insufficient price history (< 210 trading days)',
      as_of: asOfDate
    };
  }

  const closes = priceBars.map(b => b.close);
  const n = closes.length;
  const lastClose = closes[n - 1];

  const sma200Arr = calculateSMA(closes, 200);
  const lastSma200 = sma200Arr[n - 1];

  const { histogram } = calculateMACD(closes, 12, 26, 9);
  const lastMacdHist = histogram[n - 1];

  const rsiArr = calculateRSI(closes, 14);
  const lastRsi = rsiArr[n - 1];

  const t1_margin = ((lastClose / lastSma200) - 1) * 100;
  const hist_norm = (lastMacdHist / lastClose) * 100;

  const T1 = lastClose > lastSma200;
  const T2 = lastMacdHist > 0;
  
  // T3 evaluation based on active regime
  const isRelaxed = regime === 'relaxed_t3' || regime === 'below_target';
  const T3 = isRelaxed 
    ? (lastRsi >= 35 && lastRsi <= 75)
    : (lastRsi >= 40 && lastRsi <= 70);

  const borderline = 
    Math.abs(t1_margin) < 2.0 || 
    Math.abs(hist_norm) < 0.05 || 
    lastRsi < (isRelaxed ? 38 : 43) || 
    lastRsi > (isRelaxed ? 72 : 67);

  const pass = T1 && T2 && T3;
  
  let failReason = '';
  if (!T1) failReason += `T1 failed (${t1_margin >= 0 ? '+' : ''}${t1_margin.toFixed(1)}% vs SMA200); `;
  if (!T2) failReason += `T2 failed (MACD hist ${lastMacdHist.toFixed(3)}); `;
  if (!T3) failReason += `T3 failed (RSI ${lastRsi.toFixed(1)} out of ${isRelaxed ? '35-75' : '40-70'} band); `;
  failReason = failReason.trim();

  return {
    ticker: candidate.ticker,
    company: candidate.company,
    cluster: candidate.cluster,
    role: candidate.role,
    days: n,
    close: Number(lastClose.toFixed(2)),
    sma200: Number(lastSma200.toFixed(2)),
    t1_margin_pct: Number(t1_margin.toFixed(1)),
    macd_hist: Number(lastMacdHist.toFixed(3)),
    macd_hist_norm: Number(hist_norm.toFixed(3)),
    rsi14: Number(lastRsi.toFixed(1)),
    T1,
    T2,
    T3,
    borderline,
    eligible: true,
    pass,
    overall_status: pass ? 'HELD' : 'FAILED_TECHNICAL',
    fail_reason: failReason || undefined,
    as_of: asOfDate
  };
}

/**
 * Runs full universe screening with fallback relaxation check
 */
export function runFullScreening(
  candidates: UniverseCandidate[],
  priceMap: Record<string, DailyPriceBar[]>,
  asOfDate: string
): { results: ScreeningResult[]; regime: ScreeningRegime; passCount: number; borderlineCount: number } {
  // First pass: Standard regime
  let results = candidates.map(c => screenCandidate(c, priceMap[c.ticker], asOfDate, 'standard'));
  let passCount = results.filter(r => r.pass).length;
  let regime: ScreeningRegime = 'standard';

  // Fallback rule 1: If fewer than 15 names pass, relax T3 to RSI 35-75
  if (passCount < 15) {
    regime = 'relaxed_t3';
    results = candidates.map(c => screenCandidate(c, priceMap[c.ticker], asOfDate, 'relaxed_t3'));
    passCount = results.filter(r => r.pass).length;
    
    // Fallback rule 2: If still fewer than 15, flag below-target breadth
    if (passCount < 15) {
      regime = 'below_target';
    }
  }

  const borderlineCount = results.filter(r => r.borderline).length;

  return { results, regime, passCount, borderlineCount };
}
