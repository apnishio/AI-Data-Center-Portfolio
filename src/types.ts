export type ClusterName = 
  | 'Optics & Networking'
  | 'Electrical & Power Mgmt'
  | 'Semiconductors (non-GPU)'
  | 'Power Generation (low-carbon)'
  | 'Datacenter REITs & Thermal/Build';

export interface UniverseCandidate {
  ticker: string;
  company: string;
  cluster: ClusterName;
  role: string;
  sampleGuidanceText?: string;
  callDate?: string;
}

export interface ScreeningResult {
  ticker: string;
  company: string;
  cluster: ClusterName;
  role: string;
  days: number;
  close: number;
  sma200: number;
  t1_margin_pct: number;
  macd_hist: number;
  macd_hist_norm: number;
  rsi14: number;
  T1: boolean;
  T2: boolean;
  T3: boolean;
  borderline: boolean;
  eligible: boolean;
  pass: boolean;
  x1_verdict?: 'pass' | 'fail' | 'insufficient';
  x1_evidence?: string;
  x1_reasoning?: string;
  overall_status: 'HELD' | 'FAILED_TECHNICAL' | 'EXCLUDED_X1' | 'INELIGIBLE';
  fail_reason?: string;
  as_of: string;
}

export interface PortfolioWeight {
  ticker: string;
  company: string;
  cluster: ClusterName;
  ann_vol_pct: number;
  ret_12m_pct: number;
  weight_pct: number;
  is_capped: boolean; // binding 15% cap
  is_zero: boolean;   // survivor with 0% weight
  as_of: string;
}

export interface PortfolioComparison {
  port_vol_pct: number;
  eq_vol_pct: number;
  port_ret_pct: number;
  eq_ret_pct: number;
  risk_reduction_pct: number;
  survivors_count: number;
  capped_count: number;
  nonzero_count: number;
}

export interface ClusterWeightSummary {
  cluster: ClusterName;
  weight_pct: number;
  survivor_count: number;
  total_candidates: number;
}

export interface CorrelationData {
  tickers: string[];
  matrix: number[][]; // NxN correlation values
  within_cluster_avg: number;
  cross_cluster_avg: number;
  survivors_within_avg: number;
  survivors_cross_avg: number;
}

export interface ExemplarProfile {
  ticker: string;
  company: string;
  cluster: ClusterName;
  technical_summary: string;
  x1_verdict: 'pass' | 'fail' | 'insufficient';
  x1_evidence: string;
  x1_reasoning: string;
  profile_notes: string;
  status: 'PASS' | 'FAIL_MOMENTUM' | 'FAIL_TREND' | 'FAIL_X1';
}

export type ScreeningRegime = 'standard' | 'relaxed_t3' | 'below_target';

export interface DailyPriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
