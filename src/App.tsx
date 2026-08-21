import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  StatusBanner 
} from './components/StatusBanner';
import { 
  PortfolioOverviewCards 
} from './components/PortfolioOverviewCards';
import { 
  UniverseTable 
} from './components/UniverseTable';
import { 
  PortfolioWeights 
} from './components/PortfolioWeights';
import { 
  RiskReturnScatter 
} from './components/RiskReturnScatter';
import { 
  CorrelationHeatmap 
} from './components/CorrelationHeatmap';
import { 
  TradingSignals 
} from './components/TradingSignals';
import { 
  ExemplarProfiles 
} from './components/ExemplarProfiles';
import { 
  ExecutiveCommentary 
} from './components/ExecutiveCommentary';
import { 
  MethodologyModal 
} from './components/MethodologyModal';
import { 
  AuditTrailModal 
} from './components/AuditTrailModal';
import {
  PortfolioCompositionModal
} from './components/PortfolioCompositionModal';
import {
  PortfolioCompositionView
} from './components/PortfolioCompositionView';
import {
  CandidateScreenerModal
} from './components/CandidateScreenerModal';
import {
  TermExplainerModal,
  GlossaryModal
} from './components/TermExplainer';
import {
  PhysicalAILogo
} from './components/PhysicalAILogo';

import { 
  CANDIDATE_UNIVERSE 
} from './data/universe';
import { 
  REFERENCE_SCREENING_RESULTS,
  REFERENCE_PORTFOLIO_WEIGHTS,
  REFERENCE_PORTFOLIO_COMPARISON,
  REFERENCE_CLUSTER_WEIGHTS,
  REFERENCE_CORRELATION_DATA
} from './data/referenceData';
import { 
  ScreeningResult, 
  PortfolioWeight, 
  PortfolioComparison, 
  ClusterWeightSummary, 
  CorrelationData, 
  ScreeningRegime 
} from './types';
import { 
  fetchUniversePrices, 
  FetchProgress 
} from './lib/twelveData';
import { 
  runFullScreening 
} from './lib/indicators';
import { 
  optimizePortfolio,
  computeFullCorrelationMatrix
} from './lib/optimizer';
import {
  runX1Classifier
} from './lib/openRouter';

import { 
  Layers, 
  PieChart, 
  Network, 
  Bookmark, 
  Sparkles, 
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Application State
  const [asOfDate, setAsOfDate] = useState<string>('2026-08-20');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(null);

  // Quantitative Data State
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>(REFERENCE_SCREENING_RESULTS);
  const [portfolioWeights, setPortfolioWeights] = useState<PortfolioWeight[]>(REFERENCE_PORTFOLIO_WEIGHTS);
  const [portfolioComparison, setPortfolioComparison] = useState<PortfolioComparison>(REFERENCE_PORTFOLIO_COMPARISON);
  const [clusterWeights, setClusterWeights] = useState<ClusterWeightSummary[]>(REFERENCE_CLUSTER_WEIGHTS);
  const [correlationData, setCorrelationData] = useState<CorrelationData>(REFERENCE_CORRELATION_DATA);
  const [regime, setRegime] = useState<ScreeningRegime>('relaxed_t3');

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'portfolio' | 'screener' | 'correlation' | 'exemplars' | 'commentary'>('portfolio');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isScreenerModalOpen, setIsScreenerModalOpen] = useState<boolean>(false);
  const [isCompositionOpen, setIsCompositionOpen] = useState<boolean>(false);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Listen for global term explainer events from any TermInfoButton
  useEffect(() => {
    const handleOpenTerm = (e: Event) => {
      const customEvent = e as CustomEvent<{ termId: string }>;
      if (customEvent.detail?.termId) {
        setSelectedTermId(customEvent.detail.termId);
      }
    };

    window.addEventListener('open-term-explainer', handleOpenTerm);
    return () => {
      window.removeEventListener('open-term-explainer', handleOpenTerm);
    };
  }, []);

  // API Credentials State (Client memory only)
  const [twelveDataKey, setTwelveDataKey] = useState<string>('');
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('anthropic/claude-sonnet-5');

  // Reset to Benchmark Snapshot
  const handleResetToSnapshot = () => {
    setAsOfDate('2026-08-20');
    setIsLive(false);
    setScreeningResults(REFERENCE_SCREENING_RESULTS);
    setPortfolioWeights(REFERENCE_PORTFOLIO_WEIGHTS);
    setPortfolioComparison(REFERENCE_PORTFOLIO_COMPARISON);
    setClusterWeights(REFERENCE_CLUSTER_WEIGHTS);
    setCorrelationData(REFERENCE_CORRELATION_DATA);
    setRegime('relaxed_t3');
  };

  // Run Live Screening Pipeline across Twelve Data & Optimizer
  const handleRunLiveScreening = async () => {
    if (!twelveDataKey) return;

    setIsFetching(true);
    setIsLive(true);
    const today = new Date().toISOString().split('T')[0];
    setAsOfDate(today);

    try {
      const tickers = CANDIDATE_UNIVERSE.map(c => c.ticker);
      const { prices, errors } = await fetchUniversePrices(tickers, twelveDataKey, (progress) => {
        setFetchProgress(progress);
      });

      // 1. Run technical screening
      const { results, regime: computedRegime } = runFullScreening(CANDIDATE_UNIVERSE, prices, today);
      let finalResults = results;

      // 1b. If OpenRouter key is provided, execute live X1 checks for eligible candidates
      if (openRouterKey) {
        try {
          const updatedResults = await Promise.all(
            results.map(async (res) => {
              const candidate = CANDIDATE_UNIVERSE.find(c => c.ticker === res.ticker);
              if (candidate?.transcriptSample && res.eligible) {
                try {
                  const x1Res = await runX1Classifier(
                    res.ticker,
                    res.company,
                    candidate.callDate || today,
                    candidate.transcriptSample,
                    openRouterKey,
                    selectedModel
                  );
                  const isFail = x1Res.verdict === 'fail';
                  return {
                    ...res,
                    x1_verdict: x1Res.verdict,
                    x1_evidence: x1Res.evidence,
                    x1_reasoning: x1Res.reasoning,
                    pass: res.pass && !isFail,
                    overall_status: (isFail ? 'EXCLUDED_X1' : res.overall_status) as any,
                    fail_reason: isFail ? `Excluded: AI guidance check failed (${x1Res.evidence.slice(0, 40)}...)` : res.fail_reason
                  };
                } catch {
                  return res;
                }
              }
              return res;
            })
          );
          finalResults = updatedResults;
        } catch (e) {
          console.warn('X1 live check skipped due to error:', e);
        }
      }

      setScreeningResults(finalResults);
      setRegime(computedRegime);

      // 2. Identify survivors and optimize portfolio
      const survivors = finalResults.filter(r => r.pass);

      const { weights: weightsList, comparison: comp, clusterWeights: clWeights } = optimizePortfolio(
        survivors,
        prices,
        today,
        0.15,
        252
      );

      setPortfolioWeights(weightsList);
      setPortfolioComparison(comp);
      setClusterWeights(clWeights);

      // 3. Compute live 30x30 Pearson correlation matrix across universe candidates
      const liveCorr = computeFullCorrelationMatrix(
        CANDIDATE_UNIVERSE,
        prices,
        survivors,
        252
      );
      setCorrelationData(liveCorr);
    } catch (err: any) {
      console.error('Live screening error:', err);
    } finally {
      setIsFetching(false);
      setFetchProgress(null);
    }
  };

  const passCount = screeningResults.filter(r => r.pass).length;
  const borderlineCount = screeningResults.filter(r => r.borderline).length;
  const survivors = screeningResults.filter(r => r.pass);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Header */}
      <Header
        asOfDate={asOfDate}
        isLive={isLive}
        isFetching={isFetching}
        onRunScreening={handleRunLiveScreening}
        onResetToSnapshot={handleResetToSnapshot}
        twelveDataKey={twelveDataKey}
        setTwelveDataKey={setTwelveDataKey}
        openRouterKey={openRouterKey}
        setOpenRouterKey={setOpenRouterKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenScreener={() => setIsScreenerModalOpen(true)}
        passCount={passCount}
        totalCandidateCount={screeningResults.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Screening Regime Status Banner */}
        <StatusBanner
          asOfDate={asOfDate}
          regime={regime}
          passCount={passCount}
          totalCount={screeningResults.length}
          borderlineCount={borderlineCount}
          isFetching={isFetching}
          progress={fetchProgress}
        />

        {/* Portfolio Key Metric Cards */}
        <PortfolioOverviewCards
          comparison={portfolioComparison}
          clusterWeights={clusterWeights}
          onOpenScreener={() => setIsScreenerModalOpen(true)}
        />

        {/* Candidate Screening Table Quick Pop-up Trigger Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Candidate Screening Filter
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {passCount} of {screeningResults.length} Stocks Qualified
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">
                  (T1 Trend • T2 MACD • T3 RSI • X1 AI Review)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Inspect 30 universe candidate stocks, technical indicator tests, and earnings call transcript flags in a dedicated modal.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsScreenerModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-lg shadow-md shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all whitespace-nowrap border border-cyan-400/40 group self-stretch sm:self-auto"
          >
            <Layers className="w-4 h-4 text-cyan-100 group-hover:scale-110 transition-transform" />
            <span>Open Candidate Screening Table (Pop-up)</span>
          </button>
        </div>

        {/* Primary View Navigation Tabs & Terminology Quick Link */}
        <div className="border-b border-slate-800 flex items-center justify-between overflow-x-auto pb-px">
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Recommended Portfolio Composition ({portfolioComparison.nonzero_count} Active)</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'screener'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Candidate Screener Table ({passCount}/{screeningResults.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('correlation')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'correlation'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Diversification & Correlation</span>
            </button>

            <button
              onClick={() => setActiveTab('exemplars')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'exemplars'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Company Case Studies</span>
            </button>

            <button
              onClick={() => setActiveTab('commentary')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'commentary'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Market Insights & Strategy</span>
            </button>
          </div>

          {/* Quick Glossary Trigger */}
          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
            title="Browse full glossary of investment and technical terms"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Investment Glossary</span>
          </button>

        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          
          {/* TAB 1: Recommended Portfolio Composition (Main View) */}
          {activeTab === 'portfolio' && (
            <>
              <PortfolioCompositionView
                weights={portfolioWeights}
                comparison={portfolioComparison}
                clusterWeights={clusterWeights}
                asOfDate={asOfDate}
                onOpenScreenerModal={() => setIsScreenerModalOpen(true)}
              />

              <TradingSignals
                survivors={survivors}
                weights={portfolioWeights}
              />

              <RiskReturnScatter
                weights={portfolioWeights}
                comparison={portfolioComparison}
              />
            </>
          )}

          {/* TAB 2: Screener Table & Trading Signals */}
          {activeTab === 'screener' && (
            <>
              <UniverseTable
                results={screeningResults}
              />

              <TradingSignals
                survivors={survivors}
                weights={portfolioWeights}
              />
            </>
          )}

          {/* TAB 3: Correlation Matrix */}
          {activeTab === 'correlation' && (
            <CorrelationHeatmap
              correlationData={correlationData}
            />
          )}

          {/* TAB 4: Profiled Exemplars */}
          {activeTab === 'exemplars' && (
            <ExemplarProfiles
              screeningResults={screeningResults}
            />
          )}

          {/* TAB 5: Executive Commentary */}
          {activeTab === 'commentary' && (
            <ExecutiveCommentary
              asOfDate={asOfDate}
              regime={regime === 'relaxed_t3' ? 'Relaxed Momentum Band (35-75)' : regime === 'below_target' ? 'Defensive Breadth' : 'Standard'}
              results={screeningResults}
              weights={portfolioWeights}
              comparison={portfolioComparison}
              clusterWeights={clusterWeights}
              openRouterKey={openRouterKey}
              selectedModel={selectedModel}
            />
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PhysicalAILogo className="w-5 h-5 text-cyan-400" size={20} />
            <span>AI Data Center Portfolio • Quant Screener v4.0</span>
            <span className="mx-1 text-slate-700">|</span>
            <span className="text-slate-300">Ana Paula Nishio de Sousa</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <button 
              onClick={() => setIsGlossaryOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors underline font-sans"
            >
              Glossary of Terms
            </button>
            <button 
              onClick={() => setIsMethodologyOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors underline font-sans"
            >
              About this App
            </button>
            <span>Minimum Variance (15% Cap)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CandidateScreenerModal
        isOpen={isScreenerModalOpen}
        onClose={() => setIsScreenerModalOpen(false)}
        results={screeningResults}
        asOfDate={asOfDate}
      />

      <PortfolioCompositionModal
        isOpen={isCompositionOpen}
        onClose={() => setIsCompositionOpen(false)}
        weights={portfolioWeights}
        comparison={portfolioComparison}
        clusterWeights={clusterWeights}
        asOfDate={asOfDate}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <AuditTrailModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        asOfDate={asOfDate}
        results={screeningResults}
        weights={portfolioWeights}
        correlationData={correlationData}
      />

      <TermExplainerModal
        termId={selectedTermId}
        onClose={() => setSelectedTermId(null)}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

    </div>
  );
}
