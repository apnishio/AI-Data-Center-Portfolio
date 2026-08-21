export interface GlossaryTerm {
  id: string;
  title: string;
  shortDefinition: string; // Under 100 words
  category: 'Strategy' | 'Screening' | 'Optimization' | 'Metrics' | 'Infrastructure';
  whyItMatters?: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  portfolio_volatility: {
    id: 'portfolio_volatility',
    title: 'Portfolio Volatility (Annualized)',
    category: 'Metrics',
    shortDefinition: 'Portfolio volatility measures how much the total investment value fluctuates over a year. Expressed as a percentage, lower volatility means smoother, steadier returns with smaller ups and downs, while higher volatility indicates larger price swings and greater uncertainty.',
    whyItMatters: 'Minimizing volatility helps protect capital from severe market drawdowns.'
  },
  realized_12m_return: {
    id: 'realized_12m_return',
    title: 'Past 12-Month Return (Realized)',
    category: 'Metrics',
    shortDefinition: 'The actual percentage price gain or loss of a stock or portfolio over the preceding 12 months. In this application, past return is shown purely for descriptive context — it is never used as an input to predict the future or drive the portfolio weighting algorithm.',
    whyItMatters: 'Past performance does not guarantee future results.'
  },
  screen_survivors: {
    id: 'screen_survivors',
    title: 'Screen Survivors (Qualified Stocks)',
    category: 'Screening',
    shortDefinition: 'Candidate companies from our 30-stock physical layer universe that successfully passed every technical quality filter (200-day trend, positive MACD momentum, healthy RSI) and showed no negative forward demand warnings in their earnings calls.',
    whyItMatters: 'Only qualified survivors are eligible for investment weighting.'
  },
  risk_reduction: {
    id: 'risk_reduction',
    title: 'Risk Reduction vs Equal-Weight',
    category: 'Optimization',
    shortDefinition: 'The percentage reduction in overall volatility achieved by mathematically sizing positions based on how stocks move together, compared to simply allocating equal dollar amounts (e.g., ~9% each) to every surviving stock.',
    whyItMatters: 'Demonstrates the practical benefit of intelligent portfolio construction.'
  },
  binding_cap: {
    id: 'binding_cap',
    title: '15% Maximum Safety Cap',
    category: 'Optimization',
    shortDefinition: 'A hard risk management rule preventing any single company from exceeding 15% of the total portfolio. Even if a stock has exceptionally low volatility, this cap enforces diversification and protects against company-specific shocks.',
    whyItMatters: 'Prevents the portfolio from becoming overly concentrated in just 1 or 2 names.'
  },
  zero_weight: {
    id: 'zero_weight',
    title: '0% Weight (Risk Excluded)',
    category: 'Optimization',
    shortDefinition: 'Stocks that passed the initial screening filters but were assigned a 0% allocation by the risk optimization engine. This happens when a stock has extremely high individual volatility or moves too closely with other holdings, adding unwanted risk.',
    whyItMatters: 'Eliminates wild, speculative swings even if a stock is trending up.'
  },
  green_tilt: {
    id: 'green_tilt',
    title: 'Low-Carbon Power & Green Energy Tilt',
    category: 'Infrastructure',
    shortDefinition: 'Our candidate list intentionally includes clean power and nuclear energy providers fueling AI datacenters. However, our rules strictly prioritize market trend over narrative: if clean energy stocks break their 200-day moving average, they are excluded until they recover.',
    whyItMatters: 'Ensures we invest in themes only when market prices confirm health.'
  },
  sma_200: {
    id: 'sma_200',
    title: '200-Day Moving Average (SMA-200)',
    category: 'Screening',
    shortDefinition: 'The average closing price of a stock over the past 200 trading sessions (roughly 10 months). When a stock trades above this line, technical analysts consider it to be in a confirmed, healthy long-term upward trend.',
    whyItMatters: 'Filters out falling stocks and protects against extended bear markets.'
  },
  t1_trend: {
    id: 't1_trend',
    title: 'Long-Term Trend Rule (Price > 200 SMA)',
    category: 'Screening',
    shortDefinition: 'Rule 1 checks that the current stock price is strictly higher than its 200-day moving average. This confirms long-term institutional buying support and prevents buying into falling knives or downtrends.',
    whyItMatters: 'Our foundational rule for establishing upward trend momentum.'
  },
  t2_momentum: {
    id: 't2_momentum',
    title: 'Positive Momentum Rule (MACD > 0)',
    category: 'Screening',
    shortDefinition: 'Rule 2 uses the MACD (Moving Average Convergence Divergence) histogram to ensure short-term price momentum is positive and accelerating, rather than stalling or rolling over.',
    whyItMatters: 'Confirms that recent price action is actively strengthening.'
  },
  t3_rsi: {
    id: 't3_rsi',
    title: 'Momentum Strength Rule (RSI 40–70)',
    category: 'Screening',
    shortDefinition: 'Rule 3 checks the 14-day Relative Strength Index (RSI). A value between 40 and 70 confirms strong buying demand while filtering out exhausted, overbought stocks (above 70) and weak, oversold stocks (below 40).',
    whyItMatters: 'Avoids buying at excessive peaks right before sharp pullbacks.'
  },
  borderline_verdict: {
    id: 'borderline_verdict',
    title: 'Close Call (Borderline Status)',
    category: 'Screening',
    shortDefinition: 'A stock classified as borderline is hovering within 2% of a technical boundary (such as being just above or below its 200-day average). A single day of typical market price movement could flip its status between Pass and Fail.',
    whyItMatters: 'Highlights how sensitive momentum strategies can be during market swings.'
  },
  x1_guidance: {
    id: 'x1_guidance',
    title: 'Earnings Call Guidance (AI Review)',
    category: 'Screening',
    shortDefinition: 'An AI-powered screening step that analyzes the most recent quarterly earnings call transcripts. It searches for explicit management warnings regarding slowing AI customer demand, order cancellations, or reduced revenue guidance.',
    whyItMatters: 'Ensures fundamental business health matches positive technical chart trends.'
  },
  min_variance_optimization: {
    id: 'min_variance_optimization',
    title: 'Minimum Variance Optimization',
    category: 'Optimization',
    shortDefinition: 'A quantitative mathematics method that calculates the optimal weight for each qualified stock. It looks at individual stock volatilities and how they move together (covariance) to build a portfolio with the lowest possible total price volatility.',
    whyItMatters: 'Constructs the smoothest possible ride for long-term investors.'
  },
  correlation_matrix: {
    id: 'correlation_matrix',
    title: 'Correlation Matrix & Heatmap',
    category: 'Optimization',
    shortDefinition: 'A grid showing how closely stock prices move in tandem on a scale from -1.0 to +1.0. A score of 1.0 means two stocks move in lockstep, while lower numbers (0.2 to 0.4) indicate great diversification benefits.',
    whyItMatters: 'Combining uncorrelated stocks significantly dampens portfolio risk.'
  },
  physical_layer: {
    id: 'physical_layer',
    title: 'AI Datacenter Physical Layer',
    category: 'Infrastructure',
    shortDefinition: 'The tangible physical infrastructure required to power, cool, house, and connect artificial intelligence: electrical transformers, liquid cooling units, optical fiber transceivers, specialized power chips, and purpose-built datacenter properties.',
    whyItMatters: 'Captures massive AI capital expenditure without GPU hype.'
  },
  equal_weight: {
    id: 'equal_weight',
    title: 'Equal-Weight Benchmark',
    category: 'Metrics',
    shortDefinition: 'A standard comparison portfolio where every qualified stock receives an identical dollar percentage (e.g., 9.09% each if 11 stocks qualify). We compare our optimized weights against this baseline to measure risk reduction.',
    whyItMatters: 'Provides a fair, unbiased benchmark for portfolio performance.'
  },
  fallback_regime: {
    id: 'fallback_regime',
    title: 'Automatic Fallback Rule',
    category: 'Strategy',
    shortDefinition: 'An automated safety guideline: during broad market pullbacks, if fewer than 15 stocks pass standard rules, the RSI criteria slightly widens to 35–75 to maintain sufficient breadth while strictly maintaining 200-day trend and momentum discipline.',
    whyItMatters: 'Prevents the portfolio from collapsing into too few holdings during normal market dips.'
  },
  datacenter_reits: {
    id: 'datacenter_reits',
    title: 'Datacenter REITs & Thermal Cooling',
    category: 'Infrastructure',
    shortDefinition: 'Specialized real estate investment trusts (REITs) and electrical/mechanical contractors that build, house, and cool hyperscale server racks, managing the intense heat generated by high-density AI clusters.',
    whyItMatters: 'Essential physical hosts of modern cloud and enterprise AI computing.'
  },
  optics_networking: {
    id: 'optics_networking',
    title: 'Optics & High-Speed Networking',
    category: 'Infrastructure',
    shortDefinition: 'Companies manufacturing high-speed laser transceivers, optical fiber cables, and network processors that transfer data between thousands of AI chips with minimal latency and high bandwidth.',
    whyItMatters: 'Overcomes inter-server communication bottlenecks in AI supercomputing.'
  }
};

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY[id];
}
