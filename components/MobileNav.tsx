'use client'

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, X, LayoutDashboard, Bookmark, LogOut, BarChart3 } from "lucide-react"
import NavItems from "./NavItems"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/lib/actions/auth_actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import SearchCommand from "./SearchCommand"

const MobileNav = ({ initialStocks, user }: { initialStocks: StockWithWatchlistStatus[], user: User }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    }

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden flex items-center justify-center h-9 w-9 rounded-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 text-slate-500 hover:text-slate-900 focus:outline-none">
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 p-0 flex flex-col"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Header */}
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 text-white shadow-sm">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">
                        BitBull
                    </span>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-slate-100">
                    <SearchCommand
                        initialStocks={initialStocks}
                        renderAs="button"
                        label="Search stocks..."
                    />
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Menu</p>
                    <div className="flex flex-col">
                        <NavItems initialStocks={initialStocks} />
                    </div>
                </nav>

                {/* User section */}
                <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-slate-800 text-white text-sm font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate">{user.name}</span>
                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileNav
