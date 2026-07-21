'use client'

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Star, Settings } from "lucide-react";

const NAV_ICONS: Record<string, React.ReactNode> = {
    '/': <LayoutDashboard className="h-5 w-5" />,
    '/watchlist': <Star className="h-5 w-5" />,
    '/settings': <Settings className="h-5 w-5" />,
};

const NavItems = ({ initialStocks, isVertical = false }: { initialStocks: StockWithWatchlistStatus[], isVertical?: boolean }) => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }

    return (
        <ul className={`flex ${isVertical ? 'flex-col gap-2' : 'items-center gap-2'}`}>
            {NAV_ITEMS.map(({ href, label }) => {
                const active = isActive(href);

                if (isVertical) {
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`
                                    flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 relative overflow-hidden group
                                    ${active
                                        ? 'text-white bg-blue-600/10'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }
                                `}
                            >
                                {active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                )}
                                <span className={`transition-colors ${active ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {NAV_ICONS[href]}
                                </span>
                                {label}
                            </Link>
                        </li>
                    );
                }

                // Horizontal (fallback for mobile menu)
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            className={`
                                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all duration-200
                                ${active
                                    ? 'text-blue-700 bg-blue-50 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }
                            `}
                        >
                            <span className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
                                {NAV_ICONS[href]}
                            </span>
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    )
}
export default NavItems