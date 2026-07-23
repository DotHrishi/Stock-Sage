import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
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
    <div className='min-h-screen bg-slate-50'>
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} initialStocks={initialStocks} />

      {/* Main Content Area */}
      <div className='flex flex-col md:ml-64 min-h-screen relative'>
        <Header user={user} initialStocks={initialStocks} />
        
        <main className='flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout