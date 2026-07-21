'use client'

import { useState } from "react"
import { updateUserPreferences } from "@/lib/actions/userPreferences.actions"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"

const AVAILABLE_SECTORS = [
    { id: 'Finance', label: 'Finance & Banking', icon: '🏦', desc: 'Banks, NBFCs, Insurance' },
    { id: 'Tech', label: 'Information Technology', icon: '💻', desc: 'Software, IT Services' },
    { id: 'Energy', label: 'Energy & Oil', icon: '⚡', desc: 'Oil, Gas, Power generation' },
    { id: 'Consumer Goods', label: 'Consumer Goods (FMCG)', icon: '🛒', desc: 'Food, Beverages, Household' },
    { id: 'Automotive', label: 'Automotive', icon: '🚗', desc: 'Cars, Commercial vehicles' },
    { id: 'Healthcare', label: 'Healthcare & Pharma', icon: '⚕️', desc: 'Pharmaceuticals, Hospitals' },
    { id: 'Metals', label: 'Metals & Mining', icon: '⚒️', desc: 'Steel, Aluminum, Coal' },
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {AVAILABLE_SECTORS.map((sector) => {
                    const isSelected = selected.has(sector.id)
                    return (
                        <div
                            key={sector.id}
                            onClick={() => toggleSector(sector.id)}
                            className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                ${isSelected 
                                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-blue-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            )}
                            <div className="text-2xl mb-2">{sector.icon}</div>
                            <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                {sector.label}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{sector.desc}</p>
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
                
                {message && (
                    <span className={`text-sm font-medium ${message.type === 'success' ? 'text-teal-600' : 'text-red-600'}`}>
                        {message.text}
                    </span>
                )}
            </div>
        </div>
    )
}
