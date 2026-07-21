import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { searchStocks } from '@/lib/actions/finnhub.actions';

const Layout = async ({ children }: { children: React.ReactNode }) => {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect('/sign-in');

  const user = {
    id: session?.user.id,
    name: session?.user.name,
    email: session?.user.email
  }

  const initialStocks = await searchStocks();

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50'>
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} initialStocks={initialStocks} />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col md:ml-64 w-full h-full relative overflow-y-auto overflow-x-hidden scrollbar-hide-default'>
        <Header user={user} initialStocks={initialStocks} />
        
        <main className='flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout