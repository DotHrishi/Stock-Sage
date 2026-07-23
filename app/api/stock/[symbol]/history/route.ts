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

const RANGE_INTERVAL_MAP: Record<string, string> = {
    '5d':   '1d',
    '1mo':  '1d',
    '3mo':  '1d',
    '6mo':  '1d',
    '1y':   '1d',
    '5y':   '1wk',
    '10y':  '1mo',
    'max':  '1mo',
};

export async function GET(
    req: Request,
    context: { params: Promise<{ symbol: string }> }
) {
    const { symbol: rawSymbol } = await context.params;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') ?? '1y';
    const interval = RANGE_INTERVAL_MAP[range] ?? '1d';
    const yfSymbol = resolveYFSymbol(rawSymbol);

    try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yfSymbol)}?interval=${interval}&range=${range}&includePrePost=false`;

        const res = await fetch(url, {
            headers: YF_HEADERS,
            cache: 'no-store',
        });

        if (!res.ok) throw new Error(`YF HTTP ${res.status}`);

        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (!result) throw new Error('No chart result');

        const meta = result.meta;
        const timestamps: number[] = result.timestamp ?? [];
        const quote = result.indicators?.quote?.[0] ?? {};
        const opens: number[] = quote.open ?? [];
        const highs: number[] = quote.high ?? [];
        const lows: number[] = quote.low ?? [];
        const closes: number[] = quote.close ?? [];
        const volumes: number[] = quote.volume ?? [];

        const candles: any[] = [];
        const volumeData: any[] = [];

        for (let i = 0; i < timestamps.length; i++) {
            const o = opens[i], h = highs[i], l = lows[i], c = closes[i], v = volumes[i];
            if (o == null || h == null || l == null || c == null) continue;

            // lightweight-charts uses YYYY-MM-DD for daily/weekly, unix seconds for intraday
            const time = interval === '1d' || interval === '1wk' || interval === '1mo'
                ? new Date(timestamps[i] * 1000).toISOString().slice(0, 10)
                : timestamps[i];

            const isUp = c >= o;
            candles.push({ time, open: +o.toFixed(2), high: +h.toFixed(2), low: +l.toFixed(2), close: +c.toFixed(2) });
            volumeData.push({ time, value: v ?? 0, color: isUp ? 'rgba(20,184,166,0.5)' : 'rgba(244,63,94,0.5)' });
        }

        return NextResponse.json({
            candles,
            volumes: volumeData,
            meta: {
                symbol: meta.symbol,
                shortName: meta.shortName,
                longName: meta.longName,
                currency: meta.currency,
                exchange: meta.fullExchangeName ?? meta.exchangeName,
                regularMarketPrice: meta.regularMarketPrice,
                chartPreviousClose: meta.chartPreviousClose,
                fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
                dayHigh: meta.regularMarketDayHigh,
                dayLow: meta.regularMarketDayLow,
                volume: meta.regularMarketVolume,
                validRanges: meta.validRanges,
            },
            range,
            interval,
            updatedAt: Date.now(),
        });
    } catch (err: any) {
        console.error(`/api/stock/${rawSymbol}/history error:`, err?.message);
        return NextResponse.json({ error: err?.message ?? 'Failed' }, { status: 500 });
    }
}
