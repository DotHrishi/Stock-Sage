"use client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon, ChevronsUpDown } from "lucide-react";
import { signOut } from "@/lib/actions/auth_actions";

const UserDropdown = ({ user, initialStocks, isSidebar = false }: { user: User; initialStocks: StockWithWatchlistStatus[], isSidebar?: boolean }) => {
    const router = useRouter();

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

    if (isSidebar) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 w-full p-2 rounded-sm hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 group text-left">
                        <Avatar className="h-9 w-9 bg-gray-900 border border-gray-800">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="top"
                    align="center"
                    sideOffset={16}
                    className="w-56 bg-white border border-slate-200 shadow-lg rounded-sm p-1"
                >
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer focus:bg-red-50 focus:text-red-700 my-0.5"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Fallback for non-sidebar (e.g. older design or mobile)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 group">
                    <Avatar className="h-7 w-7 bg-slate-200">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-slate-800 text-white text-xs font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors max-w-[120px] truncate">
                        {user.name}
                    </span>
                    <ChevronsUpDown className="h-3 w-3 text-slate-400 hidden md:block group-hover:text-slate-600 transition-colors" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-60 bg-white border border-slate-200 shadow-lg rounded-sm p-1 mt-2"
            >
                {/* User info header */}
                <DropdownMenuLabel className="px-3 py-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-slate-800 text-white font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate">{user.name}</span>
                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-100 mx-1" />

                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer focus:bg-red-50 focus:text-red-700 my-0.5"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserDropdown