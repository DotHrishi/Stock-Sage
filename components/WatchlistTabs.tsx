"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pencil, Trash2, Check, X, Plus, Loader2 } from "lucide-react"
import { renameWatchlistGroup, deleteWatchlistGroup, createWatchlistGroup } from "@/lib/actions/watchlistGroup.actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const WatchlistTabs = ({ 
    groups, 
    activeGroupId 
}: { 
    groups: { _id: string, name: string }[], 
    activeGroupId: string 
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState("")

    const handleSelect = (id: string) => {
        if (editingId) return // Prevent switching while editing
        const params = new URLSearchParams(searchParams.toString())
        params.set('groupId', id)
        router.push(`/watchlist?${params.toString()}`)
    }

    const handleStartEdit = (id: string, currentName: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingId(id)
        setEditName(currentName)
    }

    const handleSaveEdit = async (id: string, e: React.MouseEvent | React.FormEvent) => {
        e.stopPropagation()
        if (e && 'preventDefault' in e) e.preventDefault()
        if (!editName.trim()) return

        setIsProcessing(true)
        try {
            await renameWatchlistGroup(id, editName)
            setEditingId(null)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this watchlist? All saved stocks in it will be removed.')) return

        setIsProcessing(true)
        try {
            await deleteWatchlistGroup(id)
            if (activeGroupId === id) {
                router.push('/watchlist') // Go back to default
            }
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setIsProcessing(true)
        try {
            const res = await createWatchlistGroup(newName)
            if (res.success && res.group) {
                setNewName("")
                setIsCreating(false)
                handleSelect(res.group._id)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-2">
            {groups.map(g => {
                const isActive = g._id === activeGroupId
                const isEditing = editingId === g._id

                if (isEditing) {
                    return (
                        <form key={g._id} onSubmit={(e) => handleSaveEdit(g._id, e)} className="flex items-center gap-1 bg-white border border-teal-500 rounded-md p-1 shadow-sm">
                            <Input 
                                autoFocus
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="h-7 text-sm w-32 border-none shadow-none focus-visible:ring-0 px-2"
                            />
                            <Button size="icon" variant="ghost" type="submit" disabled={isProcessing} className="h-7 w-7 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
                                {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" type="button" disabled={isProcessing} onClick={() => setEditingId(null)} className="h-7 w-7 text-gray-400 hover:bg-gray-100">
                                <X className="h-4 w-4" />
                            </Button>
                        </form>
                    )
                }

                return (
                    <div 
                        key={g._id}
                        onClick={() => handleSelect(g._id)}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-t-md cursor-pointer transition-colors border-b-2 -mb-[2px] ${
                            isActive 
                                ? 'bg-white border-teal-500 text-teal-700 font-medium shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
                                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-sm">{g.name}</span>
                        {isActive && (
                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleStartEdit(g._id, g.name, e)} className="p-1 text-gray-400 hover:text-teal-600 rounded">
                                    <Pencil className="h-3 w-3" />
                                </button>
                                <button onClick={(e) => handleDelete(g._id, e)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )
            })}

            {isCreating ? (
                <form onSubmit={handleCreate} className="flex items-center gap-1 bg-white border border-gray-300 rounded-md p-1 shadow-sm ml-2">
                    <Input 
                        autoFocus
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="New list..."
                        className="h-7 text-sm w-28 border-none shadow-none focus-visible:ring-0 px-2"
                    />
                    <Button size="icon" variant="ghost" type="submit" disabled={isProcessing} className="h-7 w-7 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" type="button" disabled={isProcessing} onClick={() => setIsCreating(false)} className="h-7 w-7 text-gray-400 hover:bg-gray-100">
                        <X className="h-4 w-4" />
                    </Button>
                </form>
            ) : (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsCreating(true)} 
                    className="ml-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 h-8 px-2 gap-1"
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs">New List</span>
                </Button>
            )}
        </div>
    )
}
