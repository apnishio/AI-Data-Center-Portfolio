import { DailyPriceBar } from '../types';

export interface FetchProgress {
  currentTicker: string;
  currentIndex: number;
  totalTickers: number;
  percent: number;
  status: string;
}

/**
 * Fetches 320 daily bars from Twelve Data for a given ticker
 */
export async function fetchTickerPrices(ticker: string, apiKey: string): Promise<DailyPriceBar[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=320&order=ASC&apikey=${apiKey}`;
  
  const response = await fetch(url);
  const text = await response.text();
  
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text.trim() || `Invalid response format from Twelve Data for ${ticker}`);
  }

  if (data && data.status === 'error') {
    if (data.code === 401) {
      throw new Error(`Twelve Data API Key is invalid or expired for ${ticker}`);
    }
    if (data.code === 429) {
      throw new Error(`Twelve Data rate limit reached (8 requests/min on free plan). Wait a moment.`);
    }
    throw new Error(data.message || `Price fetch failed for ${ticker}`);
  }

  if (!response.ok) {
    throw new Error(`Twelve Data HTTP ${response.status}: Price fetch failed for ${ticker}`);
  }

  const values = data.values || [];
  if (!values.length) {
    throw new Error(`No price data returned for ${ticker}`);
  }

  // Ensure sorted oldest to newest
  const bars: DailyPriceBar[] = values.map((v: any) => ({
    date: v.datetime,
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: Number(v.volume || 0)
  }));

  bars.sort((a, b) => (a.date < b.date ? -1 : 1));
  return bars;
}

/**
 * Fast batch fetch for the 30-candidate universe without pacing restrictions
 */
export async function fetchUniversePrices(
  tickers: string[],
  apiKey: string,
  onProgress?: (progress: FetchProgress) => void,
  shouldCancel?: () => boolean
): Promise<{ prices: Record<string, DailyPriceBar[]>; errors: Record<string, string> }> {
  const prices: Record<string, DailyPriceBar[]> = {};
  const errors: Record<string, string> = {};

  // Fetch with controlled concurrency for fast and reliable throughput
  const CONCURRENCY = 6;
  let completed = 0;

  for (let i = 0; i < tickers.length; i += CONCURRENCY) {
    if (shouldCancel && shouldCancel()) {
      break;
    }

    const chunk = tickers.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (ticker) => {
        if (onProgress) {
          onProgress({
            currentTicker: ticker,
            currentIndex: completed + 1,
            totalTickers: tickers.length,
            percent: Math.round((completed / tickers.length) * 100),
            status: `Fetching ${ticker} (${completed + 1}/${tickers.length})...`
          });
        }

        try {
          const bars = await fetchTickerPrices(ticker, apiKey);
          prices[ticker] = bars;
        } catch (err: any) {
          errors[ticker] = err.message || 'Fetch failed';
        } finally {
          completed++;
          if (onProgress) {
            onProgress({
              currentTicker: ticker,
              currentIndex: completed,
              totalTickers: tickers.length,
              percent: Math.round((completed / tickers.length) * 100),
              status: `Fetched ${ticker} (${completed}/${tickers.length})`
            });
          }
        }
      })
    );
  }

  if (onProgress) {
    onProgress({
      currentTicker: '',
      currentIndex: tickers.length,
      totalTickers: tickers.length,
      percent: 100,
      status: 'Price fetch complete.'
    });
  }

  return { prices, errors };
}
