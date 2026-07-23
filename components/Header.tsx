import SearchCommand from "./SearchCommand"
import MobileNav from "./MobileNav"

const Header = ({ user, initialStocks }: { user: User; initialStocks: StockWithWatchlistStatus[] }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/60 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="flex h-20 items-center justify-between md:justify-end gap-4 px-4 sm:px-8">
        
        {/* Mobile Nav & Logo (Only visible on small screens) */}
        <div className="flex items-center gap-4 md:hidden">
          <MobileNav initialStocks={initialStocks} user={user} />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            BitBull
          </span>
        </div>

        {/* Global Search Bar (Prominent) */}
        <div className="flex-1 md:max-w-xl md:mx-auto lg:mr-auto lg:ml-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-sm blur-md transition-all group-hover:bg-blue-500/10"></div>
            <div className="relative flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-sm cursor-text transition-all hover:border-blue-400 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] shadow-sm">
              <SearchCommand
                initialStocks={initialStocks}
                renderAs="text"
                label={
                  <div className="flex items-center gap-3 text-base text-slate-400 font-medium w-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-blue-500 transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span className="flex-1 text-left group-hover:text-slate-600 transition-colors">Search symbols, companies...</span>
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-500">
                      <span>⌘</span>K
                    </kbd>
                  </div>
                }
              />
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header