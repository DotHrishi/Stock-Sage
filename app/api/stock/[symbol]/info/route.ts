import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function resolveYFSymbol(sym: string): string {
    const decoded = decodeURIComponent(sym);
    if (decoded.startsWith('^') || decoded.includes('.')) return decoded;
    return `${decoded}.NS`;
}

const YF_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
};

async function fetchWikiDescription(companyName: string): Promise<string | null> {
    try {
        // Clean company name to improve search results
        let query = companyName.replace(/\b(Limited|Ltd\.?|Inc\.?|Corporation|Corp\.?|Company|Co\.?|PLC)\b/gi, '').trim();
        if (!query) query = companyName;

        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`, { next: { revalidate: 86400 } });
        if (!searchRes.ok) return null;
        const searchData = await searchRes.json();
        const title = searchData?.query?.search?.[0]?.title;
        if (!title) return null;

        const pageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(title)}&format=json`, { next: { revalidate: 86400 } });
        if (!pageRes.ok) return null;
        const pageData = await pageRes.json();
        const pages = pageData?.query?.pages;
        if (!pages) return null;
        
        const extract = pages[Object.keys(pages)[0]]?.extract;
        return typeof extract === 'string' && extract.trim().length > 0 ? extract.trim() : null;
    } catch (e) {
        return null;
    }
}

export async function GET(
    _req: Request,
    context: { params: Promise<{ symbol: string }> }
) {
    const { symbol: rawSymbol } = await context.params;
    const yfSymbol = resolveYFSymbol(rawSymbol);

    try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yfSymbol)}?interval=1d&range=1d&includePrePost=false`;

        const res = await fetch(url, { headers: YF_HEADERS, cache: 'no-store' });
        if (!res.ok) throw new Error(`YF HTTP ${res.status}`);

        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error('No meta found');

        const price: number = meta.regularMarketPrice ?? 0;
        const prevClose: number = meta.chartPreviousClose ?? price;
        const change = +(price - prevClose).toFixed(2);
        const changePct = prevClose !== 0 ? +((change / prevClose) * 100).toFixed(2) : 0;
        
        const longName = meta.longName ?? meta.shortName ?? meta.symbol;
        const description = await fetchWikiDescription(longName);

        return NextResponse.json({
            symbol: meta.symbol,
            shortName: meta.shortName ?? meta.symbol,
            longName,
            description,
            currency: meta.currency ?? 'INR',
            exchange: meta.fullExchangeName ?? meta.exchangeName ?? 'NSE',
            instrumentType: meta.instrumentType ?? 'EQUITY',
            price,
            prevClose,
            change,
            changePct,
            dayHigh: meta.regularMarketDayHigh ?? price,
            dayLow: meta.regularMarketDayLow ?? price,
            volume: meta.regularMarketVolume ?? 0,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? price,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? price,
            validRanges: meta.validRanges ?? ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y'],
            updatedAt: Date.now(),
        });
    } catch (err: any) {
        console.error(`/api/stock/${rawSymbol}/info error:`, err?.message);
        return NextResponse.json({ error: err?.message ?? 'Failed' }, { status: 500 });
    }
}
