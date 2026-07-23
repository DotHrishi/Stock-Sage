'use client'

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bookmark, Settings } from "lucide-react";

const NAV_ICONS: Record<string, React.ReactNode> = {
    '/': <LayoutDashboard className="h-5 w-5" />,
    '/watchlist': <Bookmark className="h-5 w-5" />,
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
                                    flex items-center gap-4 px-4 py-3 rounded-sm text-base font-medium transition-all duration-300 relative overflow-hidden group
                                    ${active
                                        ? 'text-black bg-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                    }
                                `}
                            >
                                <span className={`transition-colors ${active ? 'text-black' : 'text-gray-500 group-hover:text-gray-300'}`}>
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
                                flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-semibold tracking-tight transition-all duration-200
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