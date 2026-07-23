'use server'

import { unstable_noStore as noStore } from 'next/cache';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface MarketIndexData {
    name: string
    symbol: string
    value: string
    change: string
    changePercent: string
    trend: 'up' | 'down' | 'flat'
}

export interface SectorData {
    name: string
    symbol: string
    change: string
    trend: 'up' | 'down' | 'flat'
}

export interface TopMoverData {
    symbol: string
    name: string
    change: string
    price: string
    trend: 'up' | 'down'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatValue = (num: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num);

const formatChange = (num: number) => {
    const formatted = formatValue(Math.abs(num));
    return num >= 0 ? `+${formatted}` : `-${formatted}`;
};

const formatChangePercent = (num: number) => {
    const formatted = Math.abs(num).toFixed(2);
    return num >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

// ─── Yahoo Finance Chart API (no auth required, works after close too) ────────
// v8/finance/chart returns last known price + previous close regardless of
// market hours — perfect for showing data at all times.

const YF_CHART = 'https://query2.finance.yahoo.com/v8/finance/chart';

const YF_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
};

interface YFQuote {
    price: number
    prevClose: number
    change: number
    changePct: number
    name: string
    volume: number
}

async function fetchChartQuote(symbol: string): Promise<YFQuote | null> {
    try {
        const url = `${YF_CHART}/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`;
        const res = await fetch(url, {
            headers: YF_HEADERS,
            next: { revalidate: 60 }, // server-side cache for 60s
        });

        if (!res.ok) {
            console.warn(`YF chart ${symbol}: HTTP ${res.status}`);
            return null;
        }

        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (!result) return null;

        const meta = result.meta;
        const price: number = meta.regularMarketPrice ?? meta.previousClose ?? 0;
        const prevClose: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
        const change = price - prevClose;
        const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
        const volume: number = meta.regularMarketVolume ?? 0;

        return {
            price,
            prevClose,
            change,
            changePct,
            name: meta.shortName || meta.longName || symbol,
            volume,
        };
    } catch (err) {
        console.error(`YF chart fetch failed for ${symbol}:`, err);
        return null;
    }
}

// Fetch multiple symbols in parallel
async function fetchMany(symbols: string[]): Promise<Record<string, YFQuote | null>> {
    const entries = await Promise.all(
        symbols.map(async (sym) => [sym, await fetchChartQuote(sym)] as const)
    );
    return Object.fromEntries(entries);
}

// ─── Public helper ────────────────────────────────────────────────────────────

export async function getQuotes(symbols: string[]) {
    noStore();
    return fetchMany(symbols);
}

// ─── Market Indices ────────────────────────────────────────────────────────────

export async function getMarketIndices(): Promise<MarketIndexData[]> {
    noStore();

    const indices = [
        { name: 'NIFTY 50',     symbol: '^NSEI'      },
        { name: 'SENSEX',       symbol: '^BSESN'     },
        { name: 'NIFTY BANK',   symbol: '^NSEBANK'   },
        { name: 'NIFTY IT',     symbol: '^CNXIT'     },
        { name: 'NIFTY MIDCAP', symbol: '^NSEMDCP50' },
        { name: 'INDIA VIX',    symbol: '^INDIAVIX'  },
    ];

    const quotes = await fetchMany(indices.map(i => i.symbol));

    return indices.map(idx => {
        const q = quotes[idx.symbol];
        if (!q) {
            return { name: idx.name, symbol: idx.symbol, value: 'N/A', change: 'N/A', changePercent: 'N/A', trend: 'flat' as const };
        }
        return {
            name: idx.name,
            symbol: idx.symbol,
            value: formatValue(q.price),
            change: formatChange(q.change),
            changePercent: formatChangePercent(q.changePct),
            trend: q.change >= 0 ? 'up' : 'down',
        };
    });
}

// ─── Sectors ──────────────────────────────────────────────────────────────────

export async function getSectors(): Promise<SectorData[]> {
    noStore();

    const sectors = [
        { name: 'Information Tech.',  symbol: '^CNXIT'    },
        { name: 'Financial Services', symbol: '^CNXFIN'   },
        { name: 'Healthcare',         symbol: '^CNXPHARMA'},
        { name: 'Consumer Goods',     symbol: '^CNXFMCG'  },
        { name: 'Energy',             symbol: '^CNXENERGY'},
        { name: 'Metals & Mining',    symbol: '^CNXMETAL' },
        { name: 'Auto',               symbol: '^CNXAUTO'  },
        { name: 'Realty',             symbol: '^CNXREALTY'},
    ];

    const quotes = await fetchMany(sectors.map(s => s.symbol));

    return sectors.map(s => {
        const q = quotes[s.symbol];
        const changePct = q?.changePct ?? 0;
        return {
            name: s.name,
            symbol: s.symbol,
            change: formatChangePercent(changePct),
            trend: changePct >= 0 ? 'up' : 'down',
        };
    });
}

// ─── Top Movers ───────────────────────────────────────────────────────────────

export async function getTopMovers(): Promise<{ gainers: TopMoverData[]; losers: TopMoverData[] }> {
    noStore();

    const basket = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
        'LT.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'HCLTECH.NS',
        'TITAN.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'TATAMOTORS.NS', 'MM.NS',
        'WIPRO.NS', 'ONGC.NS', 'COALINDIA.NS', 'BPCL.NS', 'NTPC.NS',
    ];

    const quotes = await fetchMany(basket);

    const valid = Object.entries(quotes)
        .filter(([, q]) => q !== null)
        .map(([sym, q]) => ({
            symbol: sym.replace('.NS', '').replace('.BO', ''),
            name: q!.name || sym.replace('.NS', ''),
            changePct: q!.changePct,
            price: q!.price,
        }));

    valid.sort((a, b) => b.changePct - a.changePct);

    const toMover = (m: typeof valid[0]): TopMoverData => ({
        symbol: m.symbol,
        name: m.name,
        price: `₹${formatValue(m.price)}`,
        change: formatChangePercent(m.changePct),
        trend: m.changePct >= 0 ? 'up' : 'down',
    });

    const gainers = valid.slice(0, 5).map(toMover);
    const losers = [...valid].sort((a, b) => a.changePct - b.changePct).slice(0, 5).map(toMover);

    return { gainers, losers };
}

// ─── Stocks by Sector ─────────────────────────────────────────────────────────

export async function getStocksBySectors(sectors: string[]): Promise<TopMoverData[]> {
    noStore();
    if (!sectors || sectors.length === 0) return [];

    const sectorBaskets: Record<string, string[]> = {
        'Finance':        ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS'],
        'Tech':           ['TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TECHM.NS'],
        'Energy':         ['RELIANCE.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'COALINDIA.NS'],
        'Consumer Goods': ['ITC.NS', 'HINDUNILVR.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'TATACONSUM.NS'],
        'Automotive':     ['TATAMOTORS.NS', 'MM.NS', 'MARUTI.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS'],
        'Healthcare':     ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS'],
        'Metals':         ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'COALINDIA.NS', 'NMDC.NS'],
    };

    const symbolSet = new Set<string>();
    for (const sector of sectors) {
        (sectorBaskets[sector] ?? []).forEach(s => symbolSet.add(s));
    }

    const uniqueSymbols = Array.from(symbolSet);
    if (!uniqueSymbols.length) return [];

    const quotes = await fetchMany(uniqueSymbols);

    const valid = Object.entries(quotes)
        .filter(([, q]) => q !== null)
        .map(([sym, q]) => ({
            symbol: sym.replace('.NS', '').replace('.BO', ''),
            name: q!.name || sym.replace('.NS', ''),
            changePct: q!.changePct,
            price: q!.price,
        }));

    valid.sort((a, b) => b.changePct - a.changePct);

    return valid.map(m => ({
        symbol: m.symbol,
        name: m.name,
        price: `₹${formatValue(m.price)}`,
        change: formatChangePercent(m.changePct),
        trend: m.changePct >= 0 ? 'up' : 'down',
    }));
}

// ─── Most Traded ──────────────────────────────────────────────────────────────

export async function getMostTraded(): Promise<(TopMoverData & { volumeText: string })[]> {
    noStore();

    const basket = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
        'LT.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'HCLTECH.NS',
        'TITAN.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'TATAMOTORS.NS', 'MM.NS',
        'WIPRO.NS', 'ONGC.NS', 'COALINDIA.NS', 'BPCL.NS', 'NTPC.NS',
    ];

    const quotes = await fetchMany(basket);

    const valid = Object.entries(quotes)
        .filter(([, q]) => q !== null)
        .map(([sym, q]) => ({
            symbol: sym.replace('.NS', '').replace('.BO', ''),
            name: q!.name || sym.replace('.NS', ''),
            changePct: q!.changePct,
            price: q!.price,
            volume: q!.volume,
        }));

    // Sort by volume descending
    valid.sort((a, b) => b.volume - a.volume);

    return valid.slice(0, 5).map(m => ({
        symbol: m.symbol,
        name: m.name,
        price: `₹${formatValue(m.price)}`,
        change: formatChangePercent(m.changePct),
        trend: m.changePct >= 0 ? 'up' : 'down',
        volumeText: m.volume >= 1e7 ? `${(m.volume / 1e7).toFixed(1)}Cr` : m.volume >= 1e5 ? `${(m.volume / 1e5).toFixed(1)}L` : m.volume.toLocaleString(),
    }));
}

// ─── Popular in News (Trending) ───────────────────────────────────────────────

export async function getTrendingStocks(): Promise<TopMoverData[]> {
    noStore();
    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/trending/IN`;
        const res = await fetch(url, { headers: YF_HEADERS, next: { revalidate: 300 } });
        if (!res.ok) return [];

        const json = await res.json();
        const trending = json?.finance?.result?.[0]?.quotes || [];
        
        // Extract top 5 stock symbols (ignore indices like ^NSEI)
        const symbols = trending
            .filter((q: any) => !q.symbol.startsWith('^'))
            .slice(0, 5)
            .map((q: any) => q.symbol);

        if (symbols.length === 0) return [];

        const quotes = await fetchMany(symbols);

        const valid = Object.entries(quotes)
            .filter(([, q]) => q !== null)
            .map(([sym, q]) => ({
                symbol: sym.replace('.NS', '').replace('.BO', ''),
                name: q!.name || sym.replace('.NS', ''),
                changePct: q!.changePct,
                price: q!.price,
            }));

        return valid.map(m => ({
            symbol: m.symbol,
            name: m.name,
            price: `₹${formatValue(m.price)}`,
            change: formatChangePercent(m.changePct),
            trend: m.changePct >= 0 ? 'up' : 'down',
        }));
    } catch (error) {
        console.error("Error fetching trending stocks:", error);
        return [];
    }
}
