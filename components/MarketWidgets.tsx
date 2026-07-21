import { TrendingUp, BarChart3, Activity, LineChart, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { getMarketIndices, getSectors, getTopMovers, getStocksBySectors } from "@/lib/actions/yahoo.actions"
import { getUserPreferences } from "@/lib/actions/userPreferences.actions"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

interface WidgetCardProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    className?: string
    badge?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-teal-600" />
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
}

const TrendColor = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return 'text-teal-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-500'
}

// ─── Wrapper Card ─────────────────────────────────────────────────────────────

const WidgetCard = ({ title, subtitle, children, className = '', badge }: WidgetCardProps) => (
    <div className={`rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm ${className}`}>
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {badge && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    {badge}
                </span>
            )}
        </div>
        <div>{children}</div>
    </div>
)

// ─── Market Overview Widget ───────────────────────────────────────────────────

export const MarketOverviewWidget = async () => {
    const indices = await getMarketIndices();

    return (
        <WidgetCard title="Market Overview" subtitle="Live NSE / BSE Indices" badge="Live">
            <div className="divide-y divide-gray-100">
                {indices.map((idx) => (
                    <div key={idx.symbol} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{idx.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{idx.symbol}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 tabular-nums">{idx.value}</p>
                            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${TrendColor(idx.trend)}`}>
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

export const SectorHeatmapWidget = async () => {
    const sectors = await getSectors();

    return (
        <WidgetCard title="Sector Performance" subtitle="Live NSE Sectoral Indices" badge="Live">
            <div className="px-5 py-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {sectors.map((s) => (
                        <div
                            key={s.name}
                            className={`rounded-lg px-4 py-3 overflow-hidden border ${
                                s.trend === 'up'
                                    ? 'bg-teal-50 border-teal-100'
                                    : 'bg-red-50 border-red-100'
                            }`}
                        >
                            <p className="text-xs font-medium text-gray-700 truncate">{s.name}</p>
                            <p className={`text-lg font-bold mt-1 ${TrendColor(s.trend)}`}>{s.change}</p>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetCard>
    )
}

// ─── Top Gainers / Losers Widget ──────────────────────────────────────────────

export const TopMoversWidget = async () => {
    const { gainers, losers } = await getTopMovers();

    return (
        <WidgetCard title="Top Movers" subtitle="Top liquid Nifty 50 movers" badge="Live">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div>
                    <p className="px-4 py-2 text-xs font-semibold text-teal-600 uppercase tracking-wider border-b border-gray-100 bg-teal-50/50">
                        Top Gainers
                    </p>
                    {gainers.map((s) => (
                        <div key={s.symbol} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">{s.symbol}</span>
                                <span className="text-sm font-semibold text-teal-600">+{s.change}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">{s.name}</span>
                                <span className="text-xs font-medium text-gray-700 tabular-nums">{s.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <p className="px-4 py-2 text-xs font-semibold text-red-600 uppercase tracking-wider border-b border-gray-100 bg-red-50/50">
                        Top Losers
                    </p>
                    {losers.map((s) => (
                        <div key={s.symbol} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">{s.symbol}</span>
                                <span className="text-sm font-semibold text-red-600">{s.change}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">{s.name}</span>
                                <span className="text-xs font-medium text-gray-700 tabular-nums">{s.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetCard>
    )
}

// ─── Market Snapshot Widget ───────────────────────────────────────────────────
// For snapshot, we can use static layout since exact A/D ratios need broad market queries
// which are hard with just Yahoo Finance symbols.
export const MarketSnapshotWidget = () => (
    <WidgetCard title="Market Sentiment" subtitle="General Market Breadth">
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
            {[
                { label: 'Advances', value: '1,847', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
                { label: 'Declines', value: '892', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                { label: 'Unchanged', value: '145', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
                { label: 'Total Volume', value: '1.2B', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-lg p-3 border ${bg}`}>
                    <p className={`text-base font-bold tabular-nums ${color}`}>{value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{label}</p>
                </div>
            ))}
        </div>
    </WidgetCard>
)

// ─── Recommended Stocks Widget ────────────────────────────────────────────────
export const RecommendedStocksWidget = async () => {
    const preferences = await getUserPreferences();
    
    if (!preferences || !preferences.sectors || preferences.sectors.length === 0) {
        return (
            <WidgetCard title="Personalized Picks" subtitle="Tailored to your interests" badge="New">
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center h-full min-h-[250px]">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No Interests Selected</h3>
                    <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                        Select sectors you are interested in to see personalized stock recommendations here.
                    </p>
                    <Link href="/settings" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                        Set Preferences
                    </Link>
                </div>
            </WidgetCard>
        )
    }

    const recommendedStocks = await getStocksBySectors(preferences.sectors);

    return (
        <WidgetCard title="Personalized Picks" subtitle="Based on your favorite sectors" badge="For You" className="h-full flex flex-col">
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto scrollbar-hide-default max-h-[300px]">
                {recommendedStocks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500">
                        No stocks found for selected sectors at the moment.
                    </div>
                ) : (
                    recommendedStocks.map((s) => (
                        <div key={s.symbol} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">{s.symbol}</span>
                                <span className={`text-sm font-semibold ${TrendColor(s.trend)}`}>{s.change}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">{s.name}</span>
                                <span className="text-xs font-medium text-gray-700 tabular-nums">{s.price}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetCard>
    )
}
