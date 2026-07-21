"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toggleWatchlist } from "@/lib/actions/watchlist.actions"
import { useRouter } from "next/navigation"

export const WatchlistButton = ({ 
    symbol, 
    company, 
    initialIsWatchlisted 
}: { 
    symbol: string, 
    company: string, 
    initialIsWatchlisted: boolean 
}) => {
    const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (isLoading) return
        
        setIsLoading(true)
        // Optimistic update
        setIsWatchlisted(!isWatchlisted)
        
        try {
            const res = await toggleWatchlist(symbol, company)
            if (res.success) {
                setIsWatchlisted(res.isAdded)
                router.refresh()
            } else {
                if (res.message === 'Unauthorized') {
                    router.push('/sign-in')
                }
                // Revert on fail
                setIsWatchlisted(isWatchlisted)
            }
        } catch (error) {
            // Revert on fail
            setIsWatchlisted(isWatchlisted)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button 
            onClick={handleToggle} 
            disabled={isLoading}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
        >
            <Star 
                className={`h-4 w-4 transition-colors ${
                    isWatchlisted 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-400 hover:text-gray-600'
                }`} 
            />
        </button>
    )
}
