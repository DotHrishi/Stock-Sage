import Link from "next/link"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"
import { BarChart3 } from "lucide-react"

const Sidebar = ({ user, initialStocks }: { user: User; initialStocks: StockWithWatchlistStatus[] }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-black border-r border-gray-900 z-50">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-gray-900">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-white text-black shadow-lg transition-all group-hover:scale-105">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Bit<span className="text-gray-400">Bull</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</p>
        <NavItems initialStocks={initialStocks} isVertical={true} />
      </div>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-gray-900 bg-black">
        <UserDropdown user={user} initialStocks={initialStocks} isSidebar={true} />
      </div>
    </aside>
  )
}

export default Sidebar
