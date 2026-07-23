'use client'

import { useState } from "react"
import { updateUserPreferences } from "@/lib/actions/userPreferences.actions"
import { useRouter } from "next/navigation"
import { Loader2, Landmark, Laptop, Zap, ShoppingCart, Car, Activity, Pickaxe, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const AVAILABLE_SECTORS = [
    { id: 'Finance', label: 'Finance & Banking', icon: Landmark, desc: 'Banks, NBFCs, Insurance' },
    { id: 'Tech', label: 'Information Technology', icon: Laptop, desc: 'Software, IT Services' },
    { id: 'Energy', label: 'Energy & Oil', icon: Zap, desc: 'Oil, Gas, Power generation' },
    { id: 'Consumer Goods', label: 'Consumer Goods (FMCG)', icon: ShoppingCart, desc: 'Food, Beverages, Household' },
    { id: 'Automotive', label: 'Automotive', icon: Car, desc: 'Cars, Commercial vehicles' },
    { id: 'Healthcare', label: 'Healthcare & Pharma', icon: Activity, desc: 'Pharmaceuticals, Hospitals' },
    { id: 'Metals', label: 'Metals & Mining', icon: Pickaxe, desc: 'Steel, Aluminum, Coal' },
]

export default function SettingsForm({ initialSectors }: { initialSectors: string[] }) {
    const [selected, setSelected] = useState<Set<string>>(new Set(initialSectors))
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const toggleSector = (id: string) => {
        const newSelected = new Set(selected)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelected(newSelected)
        setMessage(null)
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)
        try {
            const result = await updateUserPreferences(Array.from(selected))
            if (result.success) {
                setMessage({ type: 'success', text: 'Preferences saved successfully!' })
                router.refresh() // Refresh to update layout if needed
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save preferences.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Sector Interests</h2>
            
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-between w-full max-w-md px-4 py-3 bg-white border border-slate-200 rounded-sm text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                                <span>Select preferred sectors... ({selected.size} selected)</span>
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[320px] p-2">
                            <DropdownMenuLabel>Available Sectors</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {AVAILABLE_SECTORS.map((sector) => (
                                <DropdownMenuCheckboxItem
                                    key={sector.id}
                                    checked={selected.has(sector.id)}
                                    onCheckedChange={() => toggleSector(sector.id)}
                                    className="py-2.5 cursor-pointer flex items-center"
                                >
                                    <sector.icon className="w-4 h-4 text-slate-500 mr-2 ml-1" />
                                    {sector.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        
                        {message && (
                            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-teal-600' : 'text-red-600'}`}>
                                {message.text}
                            </span>
                        )}
                    </div>
                </div>
                
                {selected.size > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {Array.from(selected).map(id => {
                            const sector = AVAILABLE_SECTORS.find(s => s.id === id);
                            if (!sector) return null;
                            return (
                                <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-sm border border-slate-200">
                                    <sector.icon className="w-3.5 h-3.5" />
                                    {sector.label}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
