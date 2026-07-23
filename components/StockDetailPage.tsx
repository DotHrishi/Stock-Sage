'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
    ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCw,
    TrendingUp, Building2, BarChart2,
} from 'lucide-react'
import { usePolling } from '@/hooks/usePolling'
import { WatchlistButton } from '@/components/WatchlistButton'
import { CompanyNewsWidget } from '@/components/CompanyNewsWidget'

// SSR-safe chart import
const StockCandleChart = dynamic(() => import('@/components/StockCandleChart'), {
    ssr: false,
    loading: () => (
        <ChartLoadingBars />
    ),
})


// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Skeleton / Loading Components ───────────────────────────────────────────

// Shimmer keyframe injected once
const shimmerStyle = `
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
@keyframes barBreathe {
  0%, 100% { transform: scaleY(0.25); opacity: 0.35; }
  50%       { transform: scaleY(1);    opacity: 0.85; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.shimmer {
  background: linear-gradient(90deg, #1e293b 0%, #334155 40%, #1e293b 80%);
  background-size: 600px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
.shimmer-light {
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
  background-size: 600px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
`;

const ShimmerInject = () => (
    <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />
)

// Animated candlestick bars used inside the dark chart placeholder
const ChartLoadingBars = () => {
    const bars = [
        { h: '35%', delay: '0ms',    wick_t: '8%',  wick_b: '10%' },
        { h: '55%', delay: '120ms',  wick_t: '12%', wick_b: '8%'  },
        { h: '40%', delay: '240ms',  wick_t: '6%',  wick_b: '12%' },
        { h: '70%', delay: '360ms',  wick_t: '10%', wick_b: '5%'  },
        { h: '45%', delay: '480ms',  wick_t: '8%',  wick_b: '9%'  },
        { h: '60%', delay: '600ms',  wick_t: '14%', wick_b: '7%'  },
        { h: '30%', delay: '720ms',  wick_t: '5%',  wick_b: '11%' },
        { h: '80%', delay: '840ms',  wick_t: '7%',  wick_b: '6%'  },
        { h: '50%', delay: '960ms',  wick_t: '9%',  wick_b: '8%'  },
        { h: '65%', delay: '1080ms', wick_t: '11%', wick_b: '10%' },
        { h: '42%', delay: '1200ms', wick_t: '8%',  wick_b: '7%'  },
        { h: '75%', delay: '1320ms', wick_t: '6%',  wick_b: '9%'  },
    ]
    const colors = ['#14b8a6', '#f43f5e', '#14b8a6', '#14b8a6', '#f43f5e', '#14b8a6', '#f43f5e', '#14b8a6', '#14b8a6', '#f43f5e', '#14b8a6', '#14b8a6']

    return (
        <div className="w-full h-[470px] bg-black rounded-xl border border-slate-800 flex flex-col">
            {/* Controls skeleton */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                <div className="flex gap-1">
                    {['1W','1M','3M','6M','1Y','5Y'].map(l => (
                        <div key={l} className="shimmer w-8 h-6 rounded-md opacity-40" />
                    ))}
                </div>
                <div className="flex gap-2">
                    {[...Array(3)].map((_,i) => <div key={i} className="shimmer w-14 h-6 rounded-md opacity-30" />)}
                </div>
            </div>
            {/* Animated candlesticks */}
            <div className="flex-1 flex items-end justify-center gap-[6px] px-8 pb-10 pt-6">
                {bars.map((b, i) => (
                    <div key={i} className="relative flex flex-col items-center" style={{ flex: 1, height: '100%', maxWidth: 28 }}>
                        {/* Top wick */}
                        <div
                            className="w-[2px] rounded-full"
                            style={{
                                backgroundColor: colors[i] + '99',
                                height: b.wick_t,
                                animation: `barBreathe 1.8s ease-in-out infinite`,
                                animationDelay: b.delay,
                                transformOrigin: 'bottom',
                            }}
                        />
                        {/* Body */}
                        <div
                            className="w-full rounded-sm"
                            style={{
                                backgroundColor: colors[i] + 'cc',
                                height: b.h,
                                animation: `barBreathe 1.8s ease-in-out infinite`,
                                animationDelay: b.delay,
                                transformOrigin: 'bottom',
                                boxShadow: `0 0 8px ${colors[i]}44`,
                            }}
                        />
                        {/* Bottom wick */}
                        <div
                            className="w-[2px] rounded-full"
                            style={{
                                backgroundColor: colors[i] + '99',
                                height: b.wick_b,
                                animation: `barBreathe 1.8s ease-in-out infinite`,
                                animationDelay: b.delay,
                                transformOrigin: 'top',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Full page error state
const StockErrorState = ({ symbol, message }: { symbol: string; message?: string }) => (
    <div className="space-y-6 pb-10">
        <ShimmerInject />
        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-500 font-mono">{symbol}</span>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <BarChart2 className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center max-w-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Could not load stock data</h2>
                <p className="text-sm text-slate-500">
                    Symbol <span className="font-mono font-semibold text-slate-700">{symbol}</span> could not be found.
                    {message && <span className="block mt-1 text-xs text-slate-400">{message}</span>}
                </p>
            </div>
            <div className="flex gap-3">
                <Link
                    href="/"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    </div>
)

const StockLoadingSkeleton = () => (
    <div className="space-y-6 pb-10" style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
        <ShimmerInject />

        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
            <div className="shimmer w-24 h-4 rounded-md" />
            <div className="shimmer w-2 h-3 rounded" />
            <div className="shimmer w-40 h-4 rounded-md" />
        </div>

        {/* Hero skeleton */}
        <div className="bg-black rounded-xl p-6 border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4 flex-1">
                    {/* Badges */}
                    <div className="flex gap-2">
                        <div className="shimmer w-14 h-5 rounded-md" />
                        <div className="shimmer w-10 h-5 rounded-md" />
                        <div className="shimmer w-16 h-5 rounded-md" />
                    </div>
                    {/* Company name */}
                    <div className="shimmer w-72 h-7 rounded-lg" />
                    <div className="shimmer w-28 h-4 rounded" />
                    {/* Price */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="shimmer w-48 h-10 rounded-xl" />
                        <div className="shimmer w-32 h-8 rounded-xl" />
                    </div>
                    {/* Live indicator */}
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="shimmer w-24 h-3 rounded" />
                    </div>
                </div>
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="shimmer h-14 rounded-lg" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
            </div>
        </div>

        {/* 52W range skeleton */}
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
            <div className="flex justify-between mb-3">
                <div className="shimmer-light w-32 h-3 rounded" />
                <div className="shimmer-light w-20 h-3 rounded" />
            </div>
            <div className="shimmer-light w-full h-1.5 rounded-full" />
            <div className="flex justify-between mt-2">
                <div className="shimmer-light w-16 h-3 rounded" />
                <div className="shimmer-light w-20 h-3 rounded" />
                <div className="shimmer-light w-16 h-3 rounded" />
            </div>
        </div>

        {/* Chart */}
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="shimmer-light w-4 h-4 rounded" />
                    <div className="shimmer-light w-28 h-4 rounded" />
                </div>
                <div className="shimmer-light w-36 h-3 rounded" />
            </div>
            <ChartLoadingBars />
        </div>

        {/* Company info skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="shimmer-light w-4 h-4 rounded" />
                <div className="shimmer-light w-16 h-4 rounded" />
            </div>
            <div className="space-y-2">
                <div className="shimmer-light w-full h-3 rounded" />
                <div className="shimmer-light w-5/6 h-3 rounded" />
                <div className="shimmer-light w-4/5 h-3 rounded" />
            </div>
        </div>
    </div>
)

interface StockInfo {
    symbol: string
    shortName: string
    longName: string
    description?: string | null
    currency: string
    exchange: string
    instrumentType: string
    price: number
    prevClose: number
    change: number
    changePct: number
    dayHigh: number
    dayLow: number
    volume: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    validRanges: string[]
    updatedAt?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number, dec = 2) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)

const fmtVol = (v: number) => {
    if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(2)} Cr`
    if (v >= 1_00_000) return `${(v / 1_00_000).toFixed(2)} L`
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)} K`
    return String(v)
}

const fmtCurrency = (n: number, currency = 'INR') => {
    if (currency === 'INR') return `₹${fmt(n)}`
    if (currency === 'USD') return `$${fmt(n)}`
    return `${currency} ${fmt(n)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
)

// 52-week range visual progress bar
const WeekRange = ({ low, high, current, currency }: { low: number; high: number; current: number; currency: string }) => {
    const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100))
    return (
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">52-Week Range</span>
                <span className="text-xs font-mono font-bold text-slate-700">{pct.toFixed(0)}% of range</span>
            </div>
            <div className="relative">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-teal-400 rounded-full"
                        style={{ width: '100%' }}
                    />
                </div>
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-700 rounded-full shadow-md"
                    style={{ left: `calc(${pct}% - 6px)` }}
                />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-xs font-mono font-bold text-rose-500">{fmtCurrency(low, currency)}</span>
                <span className="text-xs font-mono font-bold text-slate-700">{fmtCurrency(current, currency)}</span>
                <span className="text-xs font-mono font-bold text-teal-600">{fmtCurrency(high, currency)}</span>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StockDetailPageProps {
    symbol: string         // URL param (e.g. "RELIANCE" or "RELIANCE.NS")
    yfSymbol: string       // Resolved Yahoo symbol (e.g. "RELIANCE.NS")
    initialInfo: StockInfo | null
    initialWatchlistedGroupIds?: string[]
}

export default function StockDetailPage({ symbol, yfSymbol, initialInfo, initialWatchlistedGroupIds }: StockDetailPageProps) {
    const { data: info, loading, error, updatedAt, refresh } = usePolling<StockInfo>(
        `/api/stock/${encodeURIComponent(yfSymbol)}/info`,
        initialInfo,
        { intervalMs: 30_000 }
    )

    // Show error after 1 failed fetch (no initial data + error)
    const showError = !info && !!error

    const [secsSince, setSecsSince] = useState('')
    useEffect(() => {
        if (!updatedAt) return
        const tick = () => {
            const s = Math.floor((Date.now() - updatedAt) / 1000)
            setSecsSince(s < 5 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`)
        }
        tick()
        const t = setInterval(tick, 5000)
        return () => clearInterval(t)
    }, [updatedAt])

    if (showError) {
        return <StockErrorState symbol={symbol} message={error ?? undefined} />
    }

    if (!info) {
        return <StockLoadingSkeleton />
    }

    const isUp = info.change >= 0
    const currency = info.currency ?? 'INR'

    return (
        <div className="space-y-6 pb-10">

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Dashboard
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-medium text-slate-700">{info.shortName || symbol}</span>
            </div>

            {/* ── Hero ── */}
            <div className="bg-black rounded-xl p-6 border border-slate-800 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    {/* Left: name + price */}
                    <div>
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                {info.exchange}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
                                {info.currency}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
                                {info.instrumentType}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white leading-tight">{info.longName || info.shortName}</h1>
                            {initialWatchlistedGroupIds !== undefined && (
                                <WatchlistButton symbol={info.symbol} company={info.shortName} initialWatchlistedGroupIds={initialWatchlistedGroupIds} />
                            )}
                        </div>
                        <p className="text-slate-400 text-sm font-mono mt-0.5">{info.symbol}</p>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mt-4">
                            <span className="text-4xl font-mono font-bold text-white tabular-nums tracking-tight">
                                {fmtCurrency(info.price, currency)}
                            </span>
                            <div className={`flex items-center gap-1 text-lg font-mono font-semibold ${
                                isUp ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {isUp ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                {isUp ? '+' : ''}{fmt(info.change)} ({isUp ? '+' : ''}{fmt(info.changePct)}%)
                            </div>
                        </div>

                        {/* Live refresh */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-500">{secsSince ? `Updated ${secsSince}` : 'Live'}</span>
                            <button onClick={refresh} className="text-slate-600 hover:text-slate-300 transition-colors ml-1">
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Right: key stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:min-w-[340px]">
                        {[
                            { label: 'Prev Close', value: fmtCurrency(info.prevClose, currency) },
                            { label: 'Day High', value: fmtCurrency(info.dayHigh, currency) },
                            { label: 'Day Low', value: fmtCurrency(info.dayLow, currency) },
                            { label: 'Volume', value: fmtVol(info.volume) },
                            { label: '52W High', value: fmtCurrency(info.fiftyTwoWeekHigh, currency) },
                            { label: '52W Low', value: fmtCurrency(info.fiftyTwoWeekLow, currency) },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                                <p className="text-sm font-mono font-bold text-white tabular-nums mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 52W Range Bar ── */}
            <WeekRange
                low={info.fiftyTwoWeekLow}
                high={info.fiftyTwoWeekHigh}
                current={info.price}
                currency={currency}
            />

            {/* ── Chart ── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                        Price History
                    </h2>
                    <span className="text-xs text-slate-400">Scroll to zoom · Drag to pan</span>
                </div>
                <StockCandleChart symbol={yfSymbol} />
            </div>

            {/* ── Company Info ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    About
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed">
                    {info.description ? (
                        <p className="line-clamp-6" title={info.description}>
                            {info.description}
                        </p>
                    ) : (
                        <p>
                            {info.longName} trades on the <strong>{info.exchange}</strong> under the ticker symbol{' '}
                            <strong className="font-mono">{info.symbol}</strong> in {info.currency}.
                            The stock is currently priced at{' '}
                            <strong>{fmtCurrency(info.price, currency)}</strong> with a 52-week trading range between{' '}
                            <strong>{fmtCurrency(info.fiftyTwoWeekLow, currency)}</strong> and{' '}
                            <strong>{fmtCurrency(info.fiftyTwoWeekHigh, currency)}</strong>.
                        </p>
                    )}
                </div>
            </div>

            {/* ── Company News ── */}
            <Suspense fallback={<div className="mt-8 h-40 bg-slate-100 animate-pulse rounded-xl shadow-sm"></div>}>
                <CompanyNewsWidget symbol={yfSymbol} />
            </Suspense>
        </div>
    )
}
