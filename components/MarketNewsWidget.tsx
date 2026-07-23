'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getMarketNews, type NewsArticle } from '@/lib/actions/news.actions'
import { formatTimeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Newspaper, ExternalLink, Loader2 } from 'lucide-react'

export const MarketNewsWidget = () => {
    const [news, setNews] = useState<NewsArticle[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const observer = useRef<IntersectionObserver | null>(null)

    const fetchNews = async (pageNum: number) => {
        setLoading(true)
        const newArticles = await getMarketNews(8, pageNum)
        
        if (newArticles.length === 0) {
            setHasMore(false)
        } else {
            setNews(prev => {
                // Filter out duplicates based on headline just in case
                const existingIds = new Set(prev.map(a => a.headline))
                const uniqueNew = newArticles.filter(a => !existingIds.has(a.headline))
                return [...prev, ...uniqueNew]
            })
        }
        setLoading(false)
    }

    // Initial fetch
    useEffect(() => {
        fetchNews(1)
    }, [])

    const lastArticleRef = useCallback((node: HTMLAnchorElement | null) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => {
                    const nextPage = prev + 1
                    fetchNews(nextPage)
                    return nextPage
                })
            }
        }, { threshold: 1.0 })
        
        if (node) observer.current.observe(node)
    }, [loading, hasMore])

    if (news.length === 0 && !loading) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Latest & Trending News</h2>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center bg-black rounded-md border border-dashed border-gray-900">
                    <Newspaper className="w-8 h-8 text-slate-700 mb-3" />
                    <p className="text-sm font-medium text-slate-400">No trending news right now</p>
                    <p className="text-xs text-slate-500 mt-1">Check back later for the latest market updates.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Latest & Trending News</h2>
                </div>
            </div>
            
            <div className="bg-black rounded-md border border-gray-900 shadow-sm overflow-hidden flex flex-col">
                <div className="max-h-[350px] overflow-y-auto" style={{ colorScheme: 'dark' }}>
                    {news.map((article, index) => {
                        const isLast = index === news.length - 1
                        return (
                            <Link
                                key={`${article.headline}-${index}`}
                                ref={isLast ? lastArticleRef : null}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex items-center justify-between p-4 hover:bg-slate-900/50 transition-colors border-b border-gray-900 last:border-0`}
                            >
                                <div className="flex flex-col gap-1.5 flex-1 pr-4">
                                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {article.headline}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                                            {article.source}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {formatTimeAgo(article.datetime)}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                            </Link>
                        )
                    })}
                    
                    {loading && (
                        <div className="flex justify-center p-6 border-t border-gray-900">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
