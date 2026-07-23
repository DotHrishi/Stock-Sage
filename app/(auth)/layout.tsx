import { BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='auth-layout min-h-screen bg-slate-50 flex'>
            <section className='auth-left-section flex-1 flex flex-col justify-center items-center px-4 sm:px-12 py-10 bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] z-10 lg:max-w-xl'>
                <Link href="/" className="auth-logo absolute top-8 left-8 sm:left-12 flex items-center gap-2 group">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        BitBull
                    </span>
                </Link>

                <div className="pb-6 lg:pb-8 w-full max-w-md mx-auto mt-16">{children}</div>
            </section>

            {/* Right Side Background Area */}
            <section className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center overflow-hidden">
                <Image 
                    src="/assets/images/auth-bg.jpg" 
                    alt="Stock Analysis Dashboard" 
                    fill 
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </section>
        </main>
    )
}

export default Layout