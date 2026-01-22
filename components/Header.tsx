import Link from "next/link"
import Image from "next/image"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"

const Header = ({ user, initialStocks }: { user: User; initialStocks: StockWithWatchlistStatus[] }) => {
  return (
    <header className='sticky top-0 header'>
      <div className='container header-wrapper'>
        <Link href="/">
          <Image src="/assets/icons/logo.svg" alt="StockSage logo" width={140} height={32} className="cursor-pointer" priority style={{ width: 'auto' }} />
        </Link>
        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} />
        </nav>
        <UserDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  )
}

export default Header