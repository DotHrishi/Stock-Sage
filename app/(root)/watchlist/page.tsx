import { getWatchlistStocks } from "@/lib/actions/watchlist.actions"
import { getWatchlistGroups } from "@/lib/actions/watchlistGroup.actions"
import { getQuotes } from "@/lib/actions/fyers.actions";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Bookmark, Trash2 } from "lucide-react";
import { WatchlistButton } from "@/components/WatchlistButton";
import { WatchlistTabs } from "@/components/WatchlistTabs";

export const dynamic = 'force-dynamic';

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

export default async function WatchlistPage({
    searchParams
}: {
    searchParams: Promise<{ groupId?: string }>
}) {
    const { groupId } = await searchParams;
    
    // Fetch all user groups
    const groups = await getWatchlistGroups();
    
    // Determine active group
    const activeGroupId = groupId && groups.some(g => g._id === groupId) 
        ? groupId 
        : (groups.length > 0 ? groups[0]._id : null);

    const savedStocks = activeGroupId ? await getWatchlistStocks(activeGroupId) : [];
    
    let marketData: Record<string, any> = {};
    if (savedStocks.length > 0) {
        try {
            const symbols = savedStocks.map(s => s.symbol);
            marketData = await getQuotes(symbols);
        } catch (error) {
            console.error("Error fetching data for watchlist", error);
        }
    }

    const mergedData = savedStocks.map(stock => {
        const data = marketData[stock.symbol];
        
        const price = data?.price || 0;
        const change = data?.change || 0;
        const changePercent = data?.changePct || 0;
        const trend = change >= 0 ? (change === 0 ? 'flat' : 'up') : 'down';

        return {
            ...stock,
            price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price),
            change: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Math.abs(change)),
            changePercent: `${change >= 0 ? '+' : '-'}${Math.abs(changePercent).toFixed(2)}%`,
            trend: trend as 'up' | 'down' | 'flat',
            marketState: 'REGULAR'
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Bookmark className="h-6 w-6 fill-teal-400 text-teal-400" />
                    My Watchlists
                </h1>
                
                {groups.length > 0 && activeGroupId && (
                    <WatchlistTabs groups={groups} activeGroupId={activeGroupId} />
                )}
            </div>

            {mergedData.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-sm p-12 text-center shadow-sm">
                    <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                        <Bookmark className="h-6 w-6 text-teal-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No stocks in your watchlist</h2>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                        Use the search bar at the top or hit <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Cmd + K</kbd> to find and bookmark stocks you want to monitor.
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Symbol</th>
                                    <th className="px-6 py-3 font-medium">Company Name</th>
                                    <th className="px-6 py-3 font-medium text-right">Price</th>
                                    <th className="px-6 py-3 font-medium text-right">Day's Change</th>
                                    <th className="px-6 py-3 font-medium text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mergedData.map((stock) => (
                                    <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {stock.symbol}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">
                                            {stock.company}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium tabular-nums text-gray-900">
                                            {stock.price}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`flex items-center justify-end gap-1 font-medium ${TrendColor(stock.trend)}`}>
                                                <TrendIcon trend={stock.trend} />
                                                <span className="tabular-nums">{stock.change} ({stock.changePercent})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <WatchlistButton 
                                                symbol={stock.symbol} 
                                                company={stock.company} 
                                                initialWatchlistedGroupIds={activeGroupId ? [activeGroupId] : []}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
