import { Suspense } from "react"
import {
    MarketOverviewWidget,
    SectorHeatmapWidget,
    TopMoversWidget,
    MarketSnapshotWidget,
    RecommendedStocksWidget,
    MarketStatusBadge,
    MostTradedWidget
} from "@/components/MarketWidgets"
import { getUserPreferences } from "@/lib/actions/userPreferences.actions"
import { MarketNewsWidget } from "@/components/MarketNewsWidget"

export const dynamic = 'force-dynamic'

// ─── Main Page ────────────────────────────────────────────────────────────────

const Home = async () => {
    // Fetch user sector preferences server-side once (on initial load)
    const preferences = await getUserPreferences()
    const sectors = preferences?.sectors ?? []

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-slate-500 font-medium">Indian market overview · NSE / BSE</p>
                        <MarketStatusBadge />
                    </div>
                </div>
            </div>

            {/* Row 0: Personalized Picks Strip */}
            <div className="w-full">
                <RecommendedStocksWidget sectors={sectors} />
            </div>

            {/* Main Content Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column (2/3 width on large screens) */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <TopMoversWidget />
                    <SectorHeatmapWidget />
                </div>

                {/* Right Column (1/3 width on large screens) */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <MarketSnapshotWidget />
                    <MarketOverviewWidget />
                </div>

            </div>

            {/* Row 2: Bottom Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Half: Latest Market News */}
                <div className="w-full">
                    <Suspense fallback={<div className="h-40 bg-slate-100 animate-pulse rounded-md w-full"></div>}>
                        <MarketNewsWidget />
                    </Suspense>
                </div>
                
                {/* Right Half: Most Traded */}
                <div className="w-full flex flex-col gap-6">
                    <MostTradedWidget />
                </div>
            </div>
        </div>
    )
}

export default Home