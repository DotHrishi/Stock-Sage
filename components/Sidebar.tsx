import Link from "next/link"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"
import { BarChart3 } from "lucide-react"

const Sidebar = ({ user, initialStocks }: { user: User; initialStocks: StockWithWatchlistStatus[] }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 z-50">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Bit<span className="text-blue-400">Bull</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</p>
        <NavItems initialStocks={initialStocks} isVertical={true} />
      </div>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <UserDropdown user={user} initialStocks={initialStocks} isSidebar={true} />
      </div>
    </aside>
  )
}

export default Sidebar
