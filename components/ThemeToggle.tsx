'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), [])
    if (!mounted) return (
        <div className="h-9 w-9 rounded-sm bg-white/[0.05] border border-white/[0.08] animate-pulse" />
    )

    const isDark = theme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={`
                relative flex items-center justify-center h-9 w-9 rounded-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40
                ${isDark
                    ? 'bg-white/[0.05] border-white/[0.08] text-gray-400 hover:bg-white/[0.1] hover:text-yellow-400 hover:border-yellow-500/30'
                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300'
                }
            `}
        >
            {/* Animated icon swap */}
            <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
                <Moon className="h-4 w-4" />
            </span>
            <span className={`absolute transition-all duration-300 ${!isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
                <Sun className="h-4 w-4" />
            </span>
        </button>
    )
}
