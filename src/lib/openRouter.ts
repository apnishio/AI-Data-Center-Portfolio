export interface X1ClassificationResult {
  ticker: string;
  verdict: 'pass' | 'fail' | 'insufficient';
  evidence: string;
  reasoning: string;
}

export const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-sonnet-5', name: 'Claude Sonnet 5 (Recommended Default)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3' }
];

/**
 * Strips code fences (e.g. ```json ... ```) from LLM output
 */
export function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Executes the X1 Guidance Screen Prompt (FRD Appendix D)
 */
export async function runX1Classifier(
  ticker: string,
  companyName: string,
  callDate: string,
  transcriptText: string,
  apiKey: string,
  model: string = 'anthropic/claude-sonnet-5'
): Promise<X1ClassificationResult> {
  const systemPrompt = `You are a classifier for an investment screening process. Your only task is to determine whether the earnings call text below contains explicit negative forward guidance or demand-warning language from management.

Definitions:
- NEGATIVE FORWARD GUIDANCE: management states or clearly signals that future revenue, margins, or profits are expected to be lower than previously indicated or lower than the current period.
- DEMAND WARNING: management states that orders, bookings, backlog, or customer demand are weakening, slowing, being cancelled, or being pushed out.

Rules:
1. Judge ONLY the text provided. Do not use any outside knowledge about the company, its stock, or events after the call.
2. Statements about past results do not count; only forward-looking statements.
3. General caution, macro commentary, or standard risk boilerplate does NOT count as a fail. The language must be specific to the company's own outlook.
4. If the text contains no forward-looking statements at all, or is too short or unclear to judge, return verdict "insufficient" rather than guessing.
5. The evidence quote must be copied verbatim from the text. If you cannot quote it, you cannot fail the name.

Respond with ONLY this JSON object and nothing else:
{
  "ticker": "${ticker}",
  "verdict": "pass" | "fail" | "insufficient",
  "evidence": "<verbatim quote if verdict is fail, otherwise empty string>",
  "reasoning": "<one sentence explaining the verdict>"
}`;

  const userPrompt = `Earnings call text for ${ticker} (${companyName}, call date ${callDate}):
---
${transcriptText}
---`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin || 'https://ai.studio',
      'X-Title': 'AI Data Center Portfolio SPA'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      reasoning: { enabled: false },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await handleOpenRouterError(response);
    throw new Error(`OpenRouter API error: ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  const cleaned = stripCodeFences(rawContent);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      ticker: parsed.ticker || ticker,
      verdict: parsed.verdict || 'pass',
      evidence: parsed.evidence || '',
      reasoning: parsed.reasoning || 'Evaluated earnings call transcript successfully.'
    };
  } catch (err: any) {
    throw new Error(`Failed to parse LLM structured response: ${rawContent}`);
  }
}

/**
 * Generates an Executive Commentary grounded strictly on the quantitative results
 * using the COSTAR structured prompt framework.
 */
export async function generateExecutiveCommentary(
  contextData: {
    asOfDate: string;
    regime: string;
    survivorCount: number;
    totalCount: number;
    portVol: number;
    eqVol: number;
    riskReduction: number;
    portRet: number;
    eqRet: number;
    clusterAllocations: { cluster: string; weight: number }[];
    topHoldings: { ticker: string; company: string; weight: number; vol: number; ret: number }[];
    bindingCapHoldings: string[];
    zeroWeightSurvivors: string[];
    borderlineCount: number;
  },
  apiKey: string,
  model: string = 'anthropic/claude-sonnet-5'
): Promise<string> {
  const systemPrompt = `You are a Chief Investment Officer and quantitative portfolio strategist presenting an executive commentary for an institutional investment committee.

# FRAMEWORK: COSTAR
- CONTEXT: You are presenting the quarterly review of the Trend-Confirmed Physical AI Datacenter Enablement Portfolio. The portfolio runs a four-stage quantitative pipeline: technical trend & momentum screening (T1/T2/T3), fundamental X1 guidance screening, minimum-variance quadratic optimization with a 15% single-stock cap, and risk attribution.
- OBJECTIVE: Deliver a concise, rigorous 3-paragraph executive commentary explaining the current portfolio state, cluster exposures, and risk-reduction mechanics.
- STYLE: Institutional, disciplined, quantitative, and objective. Avoid promotional hype or generic SaaS buzzwords.
- TONE: Professional, authoritative, and grounded strictly in the provided mathematical results.
- AUDIENCE: Investment committee members, portfolio managers, and institutional allocators who understand quantitative equity concepts (e.g., minimum variance, covariance, 200-day SMA, Sharpe tradeoff).
- RESPONSE FORMAT: Exactly 3 structured paragraphs:
  * Paragraph 1 (Screening Regime & Universe Attrition): Detail the active screening regime, passing count out of candidate universe, technical failure drivers (e.g. 200-day SMA or MACD momentum breakdown during pullbacks), and borderline counts.
  * Paragraph 2 (Cluster Allocations & Green Tilt Reality): Explain the resulting cluster distribution (noting dominance of Datacenter REITs/Thermal/Optics vs zero or low weight in low-carbon power generation due to technical failure vs clean energy narrative).
  * Paragraph 3 (Minimum Variance Optimization & Risk Reduction): Detail the volatility reduction vs equal-weight benchmark, the down-weighting or zeroing of hyper-volatile survivors, and names reaching the 15% single-stock cap constraint.

CRITICAL RULES:
1. Cite and ground every statement strictly in the quantitative figures provided in the context. Never invent data or mention outside rumors.
2. Maintain strict fidelity to the numbers: portfolio volatility, equal-weight volatility, risk reduction percentage, and cluster weights.`;

  const userPrompt = `QUANTITATIVE PORTFOLIO DATA (As of ${contextData.asOfDate}):
- Active Screening Regime: ${contextData.regime}
- Candidate Universe Breadth: ${contextData.survivorCount} passed out of ${contextData.totalCount} total candidates (${contextData.borderlineCount} borderline verdicts)
- Risk & Return Profile:
  * Minimum Variance Portfolio Volatility: ${contextData.portVol.toFixed(1)}% (vs Equal-Weight Benchmark: ${contextData.eqVol.toFixed(1)}%)
  * Realized Volatility Reduction: ${contextData.riskReduction.toFixed(0)}%
  * Realized 12-Month Return: Min-Var ${contextData.portRet.toFixed(1)}% vs Equal-Weight ${contextData.eqRet.toFixed(1)}%
- Cluster Allocation Summary:
${contextData.clusterAllocations.map(c => `  * ${c.cluster}: ${c.weight.toFixed(1)}%`).join('\n')}
- Top Allocated Holdings:
${contextData.topHoldings.map(h => `  * ${h.ticker} (${h.company}): Weight ${h.weight.toFixed(2)}% | Ann Vol ${h.vol.toFixed(1)}% | 12m Ret ${h.ret.toFixed(1)}%`).join('\n')}
- 15.00% Capped Holdings: ${contextData.bindingCapHoldings.length > 0 ? contextData.bindingCapHoldings.join(', ') : 'None'}
- Zero-Weight Survivors: ${contextData.zeroWeightSurvivors.length > 0 ? contextData.zeroWeightSurvivors.join(', ') : 'None'}

Please construct the 3-paragraph executive commentary adhering strictly to the COSTAR framework.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin || 'https://ai.studio',
      'X-Title': 'AI Data Center Portfolio SPA'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      reasoning: { enabled: false },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await handleOpenRouterError(response);
    throw new Error(`OpenRouter API error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No commentary generated.';
}

async function handleOpenRouterError(response: Response): Promise<string> {
  let message = '';
  try {
    const body = await response.json();
    const err = body.error ?? body;
    message = err.message || '';
    if (err.metadata?.provider_name) {
      message += ` [provider: ${err.metadata.provider_name}]`;
    }
  } catch {
    // Non-JSON response
  }

  const hints: Record<number, string> = {
    401: 'API key is invalid or missing.',
    402: 'Insufficient OpenRouter credits for this model.',
    429: 'Rate limited. Please wait a moment.',
    400: 'Model rejected parameters or prompt format.'
  };

  const hint = hints[response.status] || '';
  return `(HTTP ${response.status}) ${hint} ${message}`.trim();
}
