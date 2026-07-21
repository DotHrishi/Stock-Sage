import { getWatchlistStocks } from "@/lib/actions/watchlist.actions"
import YahooFinance from 'yahoo-finance2';
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Star, Trash2 } from "lucide-react";
import { WatchlistButton } from "@/components/WatchlistButton";

export const dynamic = 'force-dynamic';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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

export default async function WatchlistPage() {
    const savedStocks = await getWatchlistStocks();
    
    let marketData: any[] = [];
    if (savedStocks.length > 0) {
        try {
            // Some stocks might not have .NS or might be US stocks, yahoo finance will resolve them
            marketData = await yahooFinance.quote(savedStocks.map(s => s.symbol));
        } catch (error) {
            console.error("Error fetching yahoo data for watchlist", error);
        }
    }

    const mergedData = savedStocks.map(stock => {
        const data = marketData.find(m => m.symbol === stock.symbol || m.symbol.replace('.NS', '') === stock.symbol);
        const price = data?.regularMarketPrice || 0;
        const change = data?.regularMarketChange || 0;
        const changePercent = data?.regularMarketChangePercent || 0;
        const trend = change >= 0 ? (change === 0 ? 'flat' : 'up') : 'down';

        return {
            ...stock,
            price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: data?.currency || 'INR' }).format(price),
            change: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Math.abs(change)),
            changePercent: `${change >= 0 ? '+' : '-'}${Math.abs(changePercent).toFixed(2)}%`,
            trend: trend as 'up' | 'down' | 'flat',
            marketState: data?.marketState || 'REGULAR'
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    My Watchlist
                </h1>
                <p className="text-sm text-gray-500 mt-1">Monitor your favorite stocks in real-time.</p>
            </div>

            {mergedData.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-50 mb-4">
                        <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No stocks in your watchlist</h2>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                        Use the search bar at the top or hit <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Cmd + K</kbd> to find and bookmark stocks you want to monitor.
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                                                initialIsWatchlisted={true} 
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
