import { Suspense } from "react"
import {
    MarketOverviewWidget,
    SectorHeatmapWidget,
    TopMoversWidget,
    MarketSnapshotWidget,
    RecommendedStocksWidget,
} from "@/components/MarketWidgets"

export const dynamic = 'force-dynamic'

// ─── Loading Skeletons ────────────────────────────────────────────────────────

const WidgetSkeleton = ({ height = "h-80" }: { height?: string }) => (
    <div className={`rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm animate-pulse`}>
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="w-32 h-5 bg-slate-200 rounded"></div>
            <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
        </div>
        <div className={`w-full ${height} bg-slate-50`}></div>
    </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────

const Home = () => {
    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Indian market overview · NSE / BSE</p>
            </div>

            {/* Row 1: Market Overview + Top Movers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 h-full">
                    <Suspense fallback={<WidgetSkeleton height="h-[380px]" />}>
                        <MarketOverviewWidget />
                    </Suspense>
                </div>
                <div className="xl:col-span-2 h-full">
                    <Suspense fallback={<WidgetSkeleton height="h-[380px]" />}>
                        <TopMoversWidget />
                    </Suspense>
                </div>
            </div>

            {/* Row 2: Market Sentiment + Sector Heatmap + Recommended Stocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1 h-full">
                    <MarketSnapshotWidget />
                </div>
                <div className="xl:col-span-2 h-full">
                    <Suspense fallback={<WidgetSkeleton height="h-[250px]" />}>
                        <SectorHeatmapWidget />
                    </Suspense>
                </div>
                <div className="xl:col-span-1 h-full">
                    <Suspense fallback={<WidgetSkeleton height="h-[250px]" />}>
                        <RecommendedStocksWidget />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default Home