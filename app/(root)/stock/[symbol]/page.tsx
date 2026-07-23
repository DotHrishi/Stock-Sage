import StockDetailPage from '@/components/StockDetailPage'
import { getWatchlistedGroupIds } from '@/lib/actions/watchlist.actions'

export const dynamic = 'force-dynamic'

// Resolve URL param → Yahoo Finance symbol
function resolveYFSymbol(sym: string): string {
    const decoded = decodeURIComponent(sym)
    if (decoded.startsWith('^') || decoded.includes('.')) return decoded
    return `${decoded}.NS`
}

const YF_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://finance.yahoo.com/',
}

async function fetchInitialInfo(yfSymbol: string) {
    try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yfSymbol)}?interval=1d&range=1d&includePrePost=false`
        const res = await fetch(url, { headers: YF_HEADERS, cache: 'no-store' })
        if (!res.ok) return null

        const json = await res.json()
        const meta = json?.chart?.result?.[0]?.meta
        if (!meta) return null

        const price: number = meta.regularMarketPrice ?? 0
        const prevClose: number = meta.chartPreviousClose ?? price
        const change = +(price - prevClose).toFixed(2)
        const changePct = prevClose !== 0 ? +((change / prevClose) * 100).toFixed(2) : 0

        return {
            symbol: meta.symbol,
            shortName: meta.shortName ?? meta.symbol,
            longName: meta.longName ?? meta.shortName ?? meta.symbol,
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
            validRanges: meta.validRanges ?? ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'],
        }
    } catch {
        return null
    }
}

export default async function StockPage({
    params,
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params
    const yfSymbol = resolveYFSymbol(symbol)
    
    // Fetch initial data and watchlist status in parallel
    const [initialInfo, watchlistedGroupIds] = await Promise.all([
        fetchInitialInfo(yfSymbol),
        getWatchlistedGroupIds(symbol)
    ])

    return (
        <StockDetailPage
            symbol={symbol}
            yfSymbol={yfSymbol}
            initialInfo={initialInfo}
            initialWatchlistedGroupIds={watchlistedGroupIds}
        />
    )
}
