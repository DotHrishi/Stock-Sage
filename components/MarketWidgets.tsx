'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePolling } from '@/hooks/usePolling'
import Link from 'next/link'
import type { MarketIndexData, SectorData, TopMoverData } from '@/lib/actions/fyers.actions'

// ─── Refresh Interval ─────────────────────────────────────────────────────────
const INTERVAL = 30_000 // 30 seconds

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <ArrowUpRight className="h-3.5 w-3.5 text-teal-600" />
    if (trend === 'down') return <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
    return <Minus className="h-3.5 w-3.5 text-gray-400" />
}

const trendColor = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return 'text-teal-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-500'
}

export const MarketStatusBadge = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            const d = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + istOffset);
            
            const day = istTime.getDay();
            const hour = istTime.getHours();
            const minute = istTime.getMinutes();
            
            const isWeekend = day === 0 || day === 6;
            const timeInMinutes = hour * 60 + minute;
            const isTradingHours = timeInMinutes >= (9 * 60 + 15) && timeInMinutes < (15 * 60 + 30);
            
            setIsOpen(!isWeekend && isTradingHours);
        };
        
        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-full w-fit">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {isOpen ? 'Market Open' : 'Market Closed'}
            </span>
        </div>
    );
}

// Relative "updated X seconds ago" label
const useRelativeTime = (updatedAt: number | null) => {
    const [label, setLabel] = useState<string>('')
    useEffect(() => {
        if (!updatedAt) return
        const tick = () => {
            const secs = Math.floor((Date.now() - updatedAt) / 1000)
            if (secs < 5) setLabel('just now')
            else if (secs < 60) setLabel(`${secs}s ago`)
            else setLabel(`${Math.floor(secs / 60)}m ago`)
        }
        tick()
        const t = setInterval(tick, 5000)
        return () => clearInterval(t)
    }, [updatedAt])
    return label
}

// ─── Live Badge ───────────────────────────────────────────────────────────────

const LiveBadge = ({
    updatedAt,
    loading,
    onRefresh,
}: {
    updatedAt: number | null
    loading: boolean
    onRefresh: () => void
}) => {
    const rel = useRelativeTime(updatedAt)
    return (
        <div className="flex items-center gap-2">
            {updatedAt && (
                <span className="text-[10px] text-gray-400 tabular-nums hidden sm:inline">{rel}</span>
            )}
            <button
                onClick={onRefresh}
                title="Refresh now"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <RefreshCw
                    className={`h-3 w-3 text-gray-400 ${loading ? 'animate-spin' : ''}`}
                />
            </button>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live
            </span>
        </div>
    )
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <div className="flex items-center justify-between px-5 py-3 animate-pulse">
        <div className="space-y-1.5">
            <div className="w-24 h-3.5 bg-slate-200 rounded" />
            <div className="w-32 h-3 bg-slate-100 rounded" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
            <div className="w-20 h-3.5 bg-slate-200 rounded" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
    </div>
)

// ─── Widget Card Wrapper ──────────────────────────────────────────────────────

interface WidgetCardProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    className?: string
    headerRight?: React.ReactNode
}

const WidgetCard = ({ title, subtitle, children, className = '', headerRight }: WidgetCardProps) => (
    <div className={`rounded-sm bg-white border border-gray-200 overflow-hidden shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {headerRight}
        </div>
        <div>{children}</div>
    </div>
)

// ─── Market Overview Widget ───────────────────────────────────────────────────

export const MarketOverviewWidget = () => {
    const { data, loading, updatedAt, refresh } = usePolling<MarketIndexData[]>(
        '/api/market/indices',
        null,
        { intervalMs: INTERVAL }
    )

    const indices = data ?? []

    return (
        <WidgetCard
            title="Market Overview"
            subtitle="Live NSE / BSE Indices"
            headerRight={
                <LiveBadge updatedAt={updatedAt} loading={loading} onRefresh={refresh} />
            }
        >
            <div className="divide-y divide-gray-100">
                {loading && !indices.length
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : indices.map((idx) => (
                          <div
                              key={idx.symbol}
                              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                          >
                              <div>
                                  <p className="text-sm font-semibold text-gray-900">{idx.name}</p>
                                  <p className="text-xs text-gray-400 font-mono">{idx.symbol}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900 tabular-nums">{idx.value}</p>
                                  <div
                                      className={`flex items-center justify-end gap-0.5 text-xs font-medium ${trendColor(idx.trend)}`}
                                  >
                                      <TrendIcon trend={idx.trend} />
                                      <span>{idx.change} ({idx.changePercent})</span>
                                  </div>
                              </div>
                          </div>
                      ))}
            </div>
        </WidgetCard>
    )
}

// ─── Sector Heatmap Widget ────────────────────────────────────────────────────

const SectorSkeleton = () => (
    <div className="rounded-sm px-4 py-3 bg-slate-100 border border-slate-200 animate-pulse">
        <div className="w-20 h-3 bg-slate-200 rounded mb-2" />
        <div className="w-14 h-5 bg-slate-200 rounded" />
    </div>
)

export const SectorHeatmapWidget = () => {
    const { data, loading, updatedAt, refresh } = usePolling<SectorData[]>(
        '/api/market/sectors',
        null,
        { intervalMs: INTERVAL }
    )

    const sectors = data ?? []

    return (
        <WidgetCard
            title="Sector Performance"
            subtitle="Live NSE Sectoral Indices"
            headerRight={
                <LiveBadge updatedAt={updatedAt} loading={loading} onRefresh={refresh} />
            }
        >
            <div className="px-5 py-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {loading && !sectors.length
                        ? Array.from({ length: 8 }).map((_, i) => <SectorSkeleton key={i} />)
                        : sectors.map((s) => (
                              <div
                                  key={s.name}
                                  className={`rounded-sm px-4 py-3 border transition-colors ${
                                      s.trend === 'up'
                                          ? 'bg-teal-50 border-teal-100'
                                          : 'bg-red-50 border-red-100'
                                  }`}
                              >
                                  <p className="text-xs font-medium text-gray-700 truncate">{s.name}</p>
                                  <p className={`text-lg font-bold mt-1 ${trendColor(s.trend)}`}>{s.change}</p>
                              </div>
                          ))}
                </div>
            </div>
        </WidgetCard>
    )
}

// ─── Top Movers Widget ────────────────────────────────────────────────────────

type Tab = 'gainers' | 'losers'

const MoverRow = ({ s, tab }: { s: TopMoverData; tab: Tab }) => (
    <Link
        href={`/stock/${encodeURIComponent(s.symbol.includes('.') || s.symbol.startsWith('^') ? s.symbol : s.symbol + '.NS')}`}
        className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
    >
        <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{s.symbol}</span>
            <span
                className={`text-sm font-semibold ${
                    tab === 'gainers' ? 'text-teal-600' : 'text-red-600'
                }`}
            >
                {s.change}
            </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-gray-500 truncate max-w-[140px]">{s.name}</span>
            <span className="text-xs font-medium text-gray-700 tabular-nums">{s.price}</span>
        </div>
    </Link>
)

const MoverSkeleton = () => (
    <div className="px-4 py-3 space-y-1.5 animate-pulse border-b border-gray-50 last:border-0">
        <div className="flex justify-between">
            <div className="w-20 h-3.5 bg-slate-200 rounded" />
            <div className="w-12 h-3.5 bg-slate-200 rounded" />
        </div>
        <div className="flex justify-between">
            <div className="w-28 h-3 bg-slate-100 rounded" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
    </div>
)

export const TopMoversWidget = () => {
    const { data, loading, updatedAt, refresh } = usePolling<{ gainers: TopMoverData[]; losers: TopMoverData[] }>(
        '/api/market/movers',
        null,
        { intervalMs: INTERVAL }
    )

    const gainers = data?.gainers ?? []
    const losers = data?.losers ?? []

    return (
        <WidgetCard
            title="Top Movers"
            subtitle="Top liquid Nifty 50 movers"
            headerRight={
                <LiveBadge updatedAt={updatedAt} loading={loading} onRefresh={refresh} />
            }
        >
            {/* Split List View */}
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* Gainers Column */}
                <div className="flex-1">
                    <div className="px-4 py-2.5 bg-teal-50/50 border-b border-gray-100 text-xs font-semibold text-teal-600 uppercase tracking-wider text-center">
                        ▲ Top Gainers
                    </div>
                    <div>
                        {loading && !gainers.length
                            ? Array.from({ length: 5 }).map((_, i) => <MoverSkeleton key={`g-${i}`} />)
                            : gainers.map((s) => <MoverRow key={s.symbol} s={s} tab="gainers" />)}
                    </div>
                </div>

                {/* Losers Column */}
                <div className="flex-1">
                    <div className="px-4 py-2.5 bg-red-50/50 border-b border-gray-100 text-xs font-semibold text-red-600 uppercase tracking-wider text-center">
                        ▼ Top Losers
                    </div>
                    <div>
                        {loading && !losers.length
                            ? Array.from({ length: 5 }).map((_, i) => <MoverSkeleton key={`l-${i}`} />)
                            : losers.map((s) => <MoverRow key={s.symbol} s={s} tab="losers" />)}
                    </div>
                </div>
            </div>
        </WidgetCard>
    )
}

// ─── Market Snapshot Widget (Static) ─────────────────────────────────────────

export const MarketSnapshotWidget = () => (
    <WidgetCard title="Market Sentiment" subtitle="General Market Breadth">
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
            {[
                { label: 'Advances', value: '1,847', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
                { label: 'Declines', value: '892', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                { label: 'Unchanged', value: '145', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
                { label: 'Total Volume', value: '1.2B', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-sm p-3 border ${bg}`}>
                    <p className={`text-base font-bold tabular-nums ${color}`}>{value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{label}</p>
                </div>
            ))}
        </div>
    </WidgetCard>
)

// ─── Recommended Stocks Widget ────────────────────────────────────────────────

export const RecommendedStocksWidget = ({ sectors }: { sectors: string[] }) => {
    const enabled = sectors.length > 0
    const scrollRef = useRef<HTMLDivElement>(null)
    const { data, loading, updatedAt, refresh } = usePolling<TopMoverData[]>(
        `/api/market/recommended?sectors=${sectors.join(',')}`,
        null,
        { intervalMs: INTERVAL, enabled }
    )

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    if (!enabled) {
        return (
            <div className="bg-black rounded-sm p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col flex-shrink-0 md:w-48 text-center md:text-left">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">For You</span>
                    <h2 className="text-lg font-bold text-white leading-tight">Personalized Picks</h2>
                </div>
                <div className="flex flex-col items-center gap-2 text-center py-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">No interests selected.</p>
                    <Link
                        href="/settings"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-sm transition-colors"
                    >
                        Set Preferences
                    </Link>
                </div>
            </div>
        )
    }

    const topPicks = (data ?? []).slice(0, 6)

    return (
        <div className="bg-black rounded-sm p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col flex-shrink-0 md:w-48 text-center md:text-left">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">For You</span>
                <h2 className="text-lg font-bold text-white leading-tight">Personalized Picks</h2>
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400">
                        {updatedAt ? `Updated just now` : 'Loading…'}
                    </span>
                </div>
            </div>

            <div className="relative flex-1 flex overflow-hidden group/carousel">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-black to-transparent text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5 drop-shadow-md" />
                </button>

                <div 
                    ref={scrollRef}
                    className="flex flex-1 gap-3 overflow-x-auto pb-1 md:pb-0 w-full snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                {loading && !topPicks.length ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="min-w-[150px] bg-white/10 rounded-sm p-3 flex-shrink-0 animate-pulse">
                            <div className="w-16 h-3.5 bg-white/20 rounded mb-2" />
                            <div className="w-10 h-3 bg-white/10 rounded" />
                        </div>
                    ))
                ) : topPicks.length === 0 ? (
                    <div className="text-sm text-slate-400 italic py-3">No picks found for your sectors.</div>
                ) : (
                    topPicks.map((s) => (
                        <Link
                            key={s.symbol}
                            href={`/stock/${encodeURIComponent(s.symbol.includes('.') || s.symbol.startsWith('^') ? s.symbol : s.symbol + '.NS')}`}
                            className="min-w-[150px] bg-white/10 rounded-sm p-3 flex-shrink-0 snap-center border border-white/5 hover:bg-white/20 transition-colors cursor-pointer group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">{s.symbol}</span>
                                <span
                                    className={`text-xs font-bold ${
                                        s.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                >
                                    {s.change}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] text-slate-300 truncate w-[60%] group-hover:text-white transition-colors">
                                    {s.name}
                                </span>
                                <span className="text-sm font-semibold text-white tabular-nums">{s.price}</span>
                            </div>
                        </Link>
                    ))
                )}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-black to-transparent text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5 drop-shadow-md" />
                </button>
            </div>
            {/* Manual refresh */}
            <button
                onClick={refresh}
                className="hidden md:flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Refresh"
            >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    )
}

// ─── Most Traded Widget ───────────────────────────────────────────────────────

export const MostTradedWidget = () => {
    const { data, loading, updatedAt, refresh } = usePolling<(TopMoverData & { volumeText: string })[]>(
        '/api/market/most-traded',
        null,
        { intervalMs: INTERVAL }
    )

    const list = data ?? []

    return (
        <WidgetCard
            title="Most Traded"
            subtitle="Highest volume today"
            headerRight={
                <LiveBadge updatedAt={updatedAt} loading={loading} onRefresh={refresh} />
            }
        >
            <div>
                {loading && !list.length
                    ? Array.from({ length: 5 }).map((_, i) => <MoverSkeleton key={`m-${i}`} />)
                    : list.map((s) => (
                        <Link
                            key={s.symbol}
                            href={`/stock/${encodeURIComponent(s.symbol.includes('.') || s.symbol.startsWith('^') ? s.symbol : s.symbol + '.NS')}`}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{s.symbol}</span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.price}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs text-gray-500 truncate max-w-[140px]">{s.name}</span>
                                <span className="text-xs font-medium text-gray-500">Vol: <span className="font-bold text-gray-700">{s.volumeText}</span></span>
                            </div>
                        </Link>
                    ))}
            </div>
        </WidgetCard>
    )
}

// ─── Trending Widget ──────────────────────────────────────────────────────────

export const TrendingWidget = () => {
    const { data, loading, updatedAt, refresh } = usePolling<TopMoverData[]>(
        '/api/market/trending',
        null,
        { intervalMs: INTERVAL }
    )

    const list = data ?? []

    return (
        <WidgetCard
            title="Popular in News"
            subtitle="Trending across markets"
            headerRight={
                <LiveBadge updatedAt={updatedAt} loading={loading} onRefresh={refresh} />
            }
        >
            <div>
                {loading && !list.length
                    ? Array.from({ length: 5 }).map((_, i) => <MoverSkeleton key={`t-${i}`} />)
                    : list.length === 0
                    ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No trending stocks right now.
                        </div>
                    )
                    : list.map((s) => <MoverRow key={s.symbol} s={s} tab={s.trend === 'up' ? 'gainers' : 'losers'} />)}
            </div>
        </WidgetCard>
    )
}
