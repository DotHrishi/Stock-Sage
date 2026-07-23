"use client"

import { useState, useEffect } from "react"
import { Bookmark, Plus, Loader2 } from "lucide-react"
import { toggleWatchlist } from "@/lib/actions/watchlist.actions"
import { getWatchlistGroups, createWatchlistGroup } from "@/lib/actions/watchlistGroup.actions"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const WatchlistButton = ({ 
    symbol, 
    company, 
    initialWatchlistedGroupIds,
    availableGroups: initialAvailableGroups
}: { 
    symbol: string, 
    company: string, 
    initialWatchlistedGroupIds: string[],
    availableGroups?: { _id: string, name: string }[]
}) => {
    const [watchlistedGroupIds, setWatchlistedGroupIds] = useState<string[]>(initialWatchlistedGroupIds || [])
    const [availableGroups, setAvailableGroups] = useState<{ _id: string, name: string }[]>(initialAvailableGroups || [])
    const [isFetchingGroups, setIsFetchingGroups] = useState(!initialAvailableGroups)
    const [isLoadingToggle, setIsLoadingToggle] = useState<string | null>(null) // groupId being toggled
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    
    const router = useRouter()

    useEffect(() => {
        if (isOpen && !initialAvailableGroups && availableGroups.length === 0) {
            fetchGroups()
        }
    }, [isOpen])

    const fetchGroups = async () => {
        setIsFetchingGroups(true)
        try {
            const groups = await getWatchlistGroups()
            setAvailableGroups(groups)
        } catch (error) {
            console.error(error)
        } finally {
            setIsFetchingGroups(false)
        }
    }

    const handleToggle = async (e: React.MouseEvent, groupId: string) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (isLoadingToggle) return
        
        setIsLoadingToggle(groupId)
        const isCurrentlyWatchlisted = watchlistedGroupIds.includes(groupId)
        
        // Optimistic update
        setWatchlistedGroupIds(prev => 
            isCurrentlyWatchlisted ? prev.filter(id => id !== groupId) : [...prev, groupId]
        )
        
        try {
            const res = await toggleWatchlist(symbol, company, groupId)
            if (res.success) {
                // Confirm state
                setWatchlistedGroupIds(prev => {
                    const clean = prev.filter(id => id !== groupId)
                    return res.isAdded ? [...clean, groupId] : clean
                })
                router.refresh()
            } else {
                if (res.message === 'Unauthorized') {
                    router.push('/sign-in')
                }
                // Revert on fail
                setWatchlistedGroupIds(prev => 
                    isCurrentlyWatchlisted ? [...prev, groupId] : prev.filter(id => id !== groupId)
                )
            }
        } catch (error) {
            // Revert on fail
            setWatchlistedGroupIds(prev => 
                isCurrentlyWatchlisted ? [...prev, groupId] : prev.filter(id => id !== groupId)
            )
        } finally {
            setIsLoadingToggle(null)
        }
    }

    const handleCreateGroup = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!newGroupName.trim()) return

        setIsCreating(true)
        try {
            const res = await createWatchlistGroup(newGroupName)
            if (res.success && res.group) {
                setAvailableGroups([...availableGroups, res.group])
                setNewGroupName("")
                // Automatically add stock to the new group
                await handleToggle(e, res.group._id)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsCreating(false)
        }
    }

    const isWatchlistedAny = watchlistedGroupIds.length > 0

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button 
                    className={`p-1.5 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    aria-label="Manage watchlists"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                >
                    <Bookmark 
                        className={`h-5 w-5 transition-colors ${
                            isWatchlistedAny 
                                ? 'fill-white text-white' 
                                : 'text-slate-400 hover:text-white'
                        }`} 
                    />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel className="text-slate-900 font-semibold">Add to Watchlist</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                {isFetchingGroups ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                    </div>
                ) : (
                    <>
                        <div className="max-h-60 overflow-y-auto">
                            {availableGroups.length === 0 ? (
                                <div className="py-2 px-3 text-sm text-slate-500 text-center">No watchlists found.</div>
                            ) : (
                                availableGroups.map(group => (
                                    <DropdownMenuCheckboxItem
                                        key={group._id}
                                        checked={watchlistedGroupIds.includes(group._id)}
                                        onCheckedChange={(checked) => handleToggle({ preventDefault: () => {}, stopPropagation: () => {} } as any, group._id)}
                                        onSelect={(e) => e.preventDefault()}
                                        disabled={isLoadingToggle === group._id}
                                        className="text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
                                    >
                                        {group.name}
                                        {isLoadingToggle === group._id && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
                                    </DropdownMenuCheckboxItem>
                                ))
                            )}
                        </div>
                        
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <div className="p-2 flex gap-2 items-center">
                            <Input 
                                placeholder="New watchlist..." 
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateGroup(e as any)
                                    e.stopPropagation()
                                }}
                                className="h-8 text-sm bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                            />
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleCreateGroup}
                                disabled={isCreating || !newGroupName.trim()}
                                className="h-8 w-8 p-0 shrink-0 bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                                {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
