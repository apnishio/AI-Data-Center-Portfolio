# Trend-Confirmed AI Datacenter Enablement Portfolio
### Quantitative Screener & Minimum Variance Asset Allocation Platform

A quantitative investment analytics and portfolio construction platform focused on the **physical layer** of the Artificial Intelligence buildout.

**Author:** Ana Paula Nishio de Sousa  
**Live Application:** https://apnishio.github.io/AI-Data-Center-Portfolio/

---

## 📖 Overview & Project Evolution

This project originated from the **`genai-finance-spa-template` scaffold** (a single-asset equity research template demonstrating price lookups and LLM calls). 

We transformed that single-asset foundation into a **multi-asset quantitative equity screener and mathematical portfolio optimizer**. The platform evaluates a 30-stock candidate universe across the physical data center supply chain, applies strict multi-factor trend and momentum filters, verifies company health using AI earnings transcript audits, and constructs a risk-minimized, volatility-damped portfolio using quadratic programming.

---

## ⚡ The Physical Layer Investment Universe

While software and foundation models dominate headlines, the physical bottlenecks of AI scaling are **power, heat, and connectivity**. The application monitors **30 candidates across 5 core infrastructure clusters**:

1. Optics & Networking: GLW (Corning), COHR (Coherent), LITE (Lumentum), ANET (Arista Networks), CIEN (Ciena), FN (Fabrinet), AAOI (Applied Optoelectronics)
2. Electrical & Power Mgmt: ETN (Eaton), VRT (Vertiv), NVT (nVent Electric), HUBB (Hubbell), GEV (GE Vernova)
3. Semiconductors (non-GPU): AVGO (Broadcom), MRVL (Marvell), MPWR (Monolithic Power Systems), ALAB (Astera Labs), CRDO (Credo Technology)
4. Power Generation (low-carbon): NEE (NextEra), CEG (Constellation Energy), VST (Vistra), BE (Bloom Energy), FSLR (First Solar), TLN (Talen Energy)
5. Datacenter REITs & Thermal/Build: EQIX (Equinix), DLR (Digital Realty), FIX (Comfort Systems USA), TT (Trane Technologies), MOD (Modine), IRM (Iron Mountain), EME (EMCOR Group)

---

## 🛠️ Functional Requirements Document (FRD) & Architecture

The application implements the complete 4-stage institutional quantitative investment workflow:

```
[ 30 Candidate Universe ]
          │
          ▼
┌────────────────────────────────────────┐
│  Stage 1: Multi-Rule Technical Screen  │
│  • T1: 200-Day Trend (Price > SMA200)   │
│  • T2: Momentum (MACD Histogram > 0)   │
│  • T3: RSI Bounds (Standard / Fallback)│
└────────────────────────────────────────┘
          │ (Surviving Candidates)
          ▼
┌────────────────────────────────────────┐
│  Stage 2: AI Guidance Screen (X1)      │
│  • OpenRouter LLM Classifier           │
│  • Negative exclusion transcript check │
└────────────────────────────────────────┘
          │ (Validated Basket)
          ▼
┌────────────────────────────────────────┐
│  Stage 3: Minimum Variance Optimizer   │
│  • 252-day Log Return Covariance (Σ)   │
│  • Quadratic Program (min w'Σw)        │
│  • 15% Max Single-Asset Cap Constraint │
└────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────┐
│  Stage 4: Execution & Visual Analytics │
│  • Risk-Return Scatter Map             │
│  • 30x30 Pearson Correlation Matrix    │
│  • Portfolio Weights & Cluster Exposure│
│  • Live Audit Trail & CSV Artifacts    │
└────────────────────────────────────────┘
```

---

## 🔍 Key Capabilities Explained

### 1. Quantitative Screening Engine (Deliverable 1)
- **Rule T1 — 200-Day Trend Confirmation:** Requires closing price to be above the 200-day Simple Moving Average ($Price > SMA_{200}$), ensuring capital is only deployed into established long-term uptrends.
- **Rule T2 — Short/Medium-Term Momentum:** Requires the MACD Histogram (12, 26, 9) to be strictly positive ($MACD_{hist} > 0$), confirming active accumulation.
- **Rule T3 — Technical RSI Bounds:** Requires the 14-period Wilder RSI to remain between $[40, 70]$ (Standard Regime). If market pullbacks compress passing breadth below targets, the engine automatically engages **Fallback Regime 1** (expanding the RSI band to $[35, 75]$).
- **Rule X1 — AI Guidance Screen:** an LLM reads the company's most recent earnings call text and excludes any name whose management states explicit negative forward guidance or demand warnings. Verdicts are pass, fail, or insufficient, and every fail must include a verbatim evidence quote from the text. Insufficient is treated as pass with a logged flag.
- **Borderline detection:** a verdict is flagged borderline when the close is within ±2% of the 200-day SMA, the MACD histogram is within ±0.05% of price, or RSI is within 3 points of a band edge.

### 2. Minimum Variance Portfolio Optimization (Deliverable 2)
- **Mathematical Quadratic Solver:** Constructs a 252-day log-return covariance matrix $\Sigma$ and solves the convex optimization problem:
  $$\min_{w} \ w^T \Sigma w \quad \text{subject to} \quad \sum w_i = 1, \quad 0 \le w_i \le 0.15$$
- **15% Single-Name Concentration Cap:** Prevents portfolio over-concentration into any single winner.
- **Risk Budgeting & Zero-Weight Allocations:** The optimizer automatically allocates $0.0\%$ weight to hyper-volatile technical survivors (such as extreme beta optical or fuel-cell names) when their variance penalty exceeds their diversification benefit.
- **Benchmark Comparison:** Real-time calculation of realized risk reduction vs. an equal-weighted benchmark (achieving a ~22% volatility reduction).

### 3. Interactive Visualizations & Analytics
- **Portfolio Composition View:** Visual breakdown of asset weights, sector exposures, binding position caps, and individual asset risk contributions.
- **Risk vs. Return Scatter Plot:** Interactive SVG chart plotting annualized volatility against 12-month return for all assets, highlighting the optimal portfolio and equal-weight benchmark.
- **30×30 Pearson Correlation Matrix:** Heatmap showing cross-asset return dependencies, within-cluster correlation averages, and cross-cluster diversification benefits.
- **Profiled Exemplar Case Studies:** Deep-dive cards detailing real market examples (e.g. Vertiv `VRT`, Constellation `CEG`, Lumentum `LITE`, NextEra `NEE`).
- **Executive Commentary Generator:** Automated narrative summary combining screening outcomes, cluster rotations, and optimizer findings, with an option to generate live commentary via OpenRouter.

### 4. Audit Trail & CSV Artifacts
Provides one-click downloads for compliance and quantitative audit records:
- `screening_full.csv` (All 30 candidates with live price, indicator values, and pass/fail verdicts)
- `weights.csv` (Optimized portfolio weights, single-asset caps, and volatility metrics)
- `correlation_matrix.csv` (Full 30×30 candidate return correlation matrix)
- `proposed10.csv` (ten representative exemplar names selected for documentation purposes; not the portfolio and not an execution list — the portfolio is all screen survivors, weighted by minimum variance).

---

## 🚀 Running the App Locally

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `http://localhost:5173`) in your web browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

The application is deployed to GitHub Pages via GitHub Actions on push to main.

---

## 🔑 API Keys & Operation Modes

The application runs in two flexible modes:

1. **Pre-Computed Reference Mode (Default):** Runs immediately with complete pre-calculated 252-day price histories, indicator calculations, and optimizer results—no API keys required.
2. **Live Screener Mode:**
   - **Twelve Data API Key:** Enter your key in the header settings modal to fetch live real-time price bars and re-calculate all indicators and covariance matrices on the fly. Get a free key at [twelvedata.com](https://twelvedata.com).
   - **OpenRouter API Key:** Enter your key to run the live AI earnings guidance classifier (Rule X1) or generate dynamic executive commentary using models like Google Gemini 2.5 Flash, Claude 3.5 Sonnet, or OpenAI GPT-4o. Get a key at [openrouter.ai](https://openrouter.ai).

*Note: All API keys remain strictly in your browser session memory and are never persisted to a backend or logged.*

---

## ⚖️ License & Disclaimer

This project is for academic and quantitative research purposes. It does not constitute formal financial advice or an endorsement to buy or sell securities.