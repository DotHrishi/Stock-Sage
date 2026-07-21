'use server'

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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

const formatValue = (num: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num);
}

const formatChange = (num: number) => {
    const formatted = formatValue(Math.abs(num));
    return num >= 0 ? `+${formatted}` : `-${formatted}`;
}

const formatChangePercent = (num: number) => {
    const formatted = Math.abs(num).toFixed(2);
    return num >= 0 ? `+${formatted}%` : `-${formatted}%`;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getMarketIndices(): Promise<MarketIndexData[]> {
    const symbols = [
        { name: 'NIFTY 50', symbol: '^NSEI' },
        { name: 'SENSEX', symbol: '^BSESN' },
        { name: 'NIFTY BANK', symbol: '^NSEBANK' },
        { name: 'NIFTY IT', symbol: '^CNXIT' },
        { name: 'NIFTY MIDCAP', symbol: '^NSEMDCP50' },
        { name: 'INDIA VIX', symbol: '^INDIAVIX' },
    ];

    try {
        const results = await yahooFinance.quote(symbols.map(s => s.symbol));
        
        return symbols.map(s => {
            const data = results.find(r => r.symbol === s.symbol);
            if (!data || data.regularMarketPrice === undefined) {
                return {
                    name: s.name,
                    symbol: s.symbol,
                    value: 'N/A',
                    change: 'N/A',
                    changePercent: 'N/A',
                    trend: 'flat'
                }
            }

            const price = data.regularMarketPrice;
            const change = data.regularMarketChange || 0;
            const changePercent = data.regularMarketChangePercent || 0;

            return {
                name: s.name,
                symbol: s.symbol,
                value: formatValue(price),
                change: formatChange(change),
                changePercent: formatChangePercent(changePercent),
                trend: change >= 0 ? 'up' : 'down'
            }
        });
    } catch (error) {
        console.error("Error fetching market indices:", error);
        return [];
    }
}

export async function getSectors(): Promise<SectorData[]> {
    // Top 8 Sectoral Indices mapping to Yahoo Finance symbols
    const symbols = [
        { name: 'Information Technology', symbol: '^CNXIT' },
        { name: 'Financial Services', symbol: '^CNXFIN' },
        { name: 'Healthcare', symbol: '^CNXPHARMA' },
        { name: 'Consumer Goods', symbol: '^CNXFMCG' },
        { name: 'Energy', symbol: '^CNXENERGY' },
        { name: 'Metals & Mining', symbol: '^CNXMETAL' },
        { name: 'Auto', symbol: '^CNXAUTO' },
        { name: 'Realty', symbol: '^CNXREALTY' },
    ];

    try {
        const results = await yahooFinance.quote(symbols.map(s => s.symbol));
        
        return symbols.map(s => {
            const data = results.find(r => r.symbol === s.symbol);
            const changePercent = data?.regularMarketChangePercent || 0;
            return {
                name: s.name,
                symbol: s.symbol,
                change: formatChangePercent(changePercent),
                trend: changePercent >= 0 ? 'up' : 'down'
            }
        });
    } catch (error) {
        console.error("Error fetching sectors:", error);
        return [];
    }
}

export async function getTopMovers(): Promise<{ gainers: TopMoverData[], losers: TopMoverData[] }> {
    // Yahoo Finance doesn't have a reliable free "top movers" endpoint specifically for India.
    // Instead, we will fetch a predefined basket of liquid Nifty 50 stocks and sort them.
    const basket = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'HUL.NS', 'ITC.NS', 'SBI.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
        'LT.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'HCLTECH.NS',
        'TITAN.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'TATAMOTORS.NS', 'M&M.NS',
        'WIPRO.NS', 'ONGC.NS', 'COALINDIA.NS', 'BPCL.NS', 'NTPC.NS'
    ];

    try {
        const results = await yahooFinance.quote(basket);
        
        const validResults = results
            .filter(r => r.regularMarketPrice && r.regularMarketChangePercent !== undefined)
            .map(r => ({
                symbol: r.symbol.replace('.NS', ''),
                name: r.shortName || r.symbol,
                changePercent: r.regularMarketChangePercent || 0,
                price: r.regularMarketPrice || 0,
                change: r.regularMarketChange || 0
            }));

        // Sort by percentage change
        validResults.sort((a, b) => b.changePercent - a.changePercent);

        const topGainers = validResults.slice(0, 4);
        const topLosers = [...validResults].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);

        const formatMover = (m: any): TopMoverData => ({
            symbol: m.symbol,
            name: m.name,
            price: `₹${formatValue(m.price)}`,
            change: formatChangePercent(m.changePercent),
            trend: m.changePercent >= 0 ? 'up' : 'down'
        });

        return {
            gainers: topGainers.map(formatMover),
            losers: topLosers.map(formatMover)
        };
    } catch (error) {
        console.error("Error fetching top movers:", error);
        return { gainers: [], losers: [] };
    }
}

export async function getStocksBySectors(sectors: string[]): Promise<TopMoverData[]> {
    if (!sectors || sectors.length === 0) return [];

    // Map sectors to a basket of relevant Indian stocks
    const sectorBaskets: Record<string, string[]> = {
        'Finance': ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBI.NS', 'KOTAKBANK.NS', 'AXISBANK.NS'],
        'Tech': ['TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TECHM.NS'],
        'Energy': ['RELIANCE.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'COALINDIA.NS'],
        'Consumer Goods': ['ITC.NS', 'HUL.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'TATACONSUM.NS'],
        'Automotive': ['TATAMOTORS.NS', 'M&M.NS', 'MARUTI.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS'],
        'Healthcare': ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS'],
        'Metals': ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'COALINDIA.NS', 'NMDC.NS'],
    };

    // Collect all symbols for the requested sectors
    let symbolsToFetch = new Set<string>();
    for (const sector of sectors) {
        const basket = sectorBaskets[sector];
        if (basket) {
            basket.forEach(s => symbolsToFetch.add(s));
        }
    }

    const uniqueSymbols = Array.from(symbolsToFetch);
    if (uniqueSymbols.length === 0) return [];

    try {
        const results = await yahooFinance.quote(uniqueSymbols);
        
        const validResults = results
            .filter(r => r.regularMarketPrice !== undefined)
            .map(r => ({
                symbol: r.symbol.replace('.NS', ''),
                name: r.shortName || r.symbol,
                changePercent: r.regularMarketChangePercent || 0,
                price: r.regularMarketPrice || 0,
                change: r.regularMarketChange || 0
            }));

        // Sort by biggest gainers first for a nice display
        validResults.sort((a, b) => b.changePercent - a.changePercent);

        return validResults.map(m => ({
            symbol: m.symbol,
            name: m.name,
            price: `₹${formatValue(m.price)}`,
            change: formatChangePercent(m.changePercent),
            trend: m.changePercent >= 0 ? 'up' : 'down'
        }));
    } catch (error) {
        console.error("Error fetching recommended stocks:", error);
        return [];
    }
}
