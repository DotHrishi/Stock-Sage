'use client'

import { useState, useEffect } from 'react'
import { getCompanyNews, type NewsArticle } from '@/lib/actions/news.actions'
import { formatTimeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Newspaper, ExternalLink } from 'lucide-react'

export const CompanyNewsWidget = ({ symbol }: { symbol: string }) => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            const data = await getCompanyNews(symbol, 6)
            setNews(data || [])
            setLoading(false)
        }
        fetchNews()
    }, [symbol])

    if (loading) {
        return <div className="mt-8 h-40 bg-slate-100 animate-pulse rounded-xl shadow-sm border border-slate-200"></div>
    }

    if (!news || news.length === 0) {
        return (
            <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="w-5 h-5 text-slate-500" />
                    <h2 className="text-base font-semibold text-slate-900">Latest Company News</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Newspaper className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-600">No recent news found</p>
                    <p className="text-xs text-slate-400 mt-1">We couldn't find any major news articles for this company in the last 7 days.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-900">Latest Company News</h2>
            </div>
            
            <div className="flex flex-col">
                {news.map((article, index) => (
                    <Link
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center justify-between py-4 hover:bg-slate-50/50 transition-colors ${
                            index !== news.length - 1 ? 'border-b border-slate-100' : ''
                        }`}
                    >
                        <div className="flex flex-col gap-1.5 flex-1 pr-4">
                            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {article.headline}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                    {article.source}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {formatTimeAgo(article.datetime)}
                                </span>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
