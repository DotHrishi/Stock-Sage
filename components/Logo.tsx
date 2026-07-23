import React from 'react'

export const Logo = ({ 
    className = "", 
    variant = "dark", 
    showText = true 
}: { 
    className?: string, 
    variant?: "dark" | "light", 
    showText?: boolean 
}) => {
    // variant 'dark' is for light backgrounds (uses slate-900 text and box)
    // variant 'light' is for dark backgrounds (uses white text and box)
    const isLight = variant === "light"
    const primaryColor = isLight ? "text-white" : "text-slate-900"
    const inverseColor = isLight ? "#0F172A" : "white" 

    return (
        <div className={`flex items-center gap-2.5 ${primaryColor} ${className}`}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect width="32" height="32" rx="6" fill="currentColor" />
                <path d="M8 9V22C8 23.1046 8.89543 24 10 24H25" stroke={inverseColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 20V16" stroke={inverseColor} strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M17 20V11" stroke={inverseColor} strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M21 20V14" stroke={inverseColor} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {showText && <span className="font-bold text-2xl tracking-tight leading-none pt-0.5">BitBull</span>}
        </div>
    )
}
