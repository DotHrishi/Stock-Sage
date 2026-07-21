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
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white text-slate-900 shadow-2xl mb-6">
                        <BarChart3 className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Smarter Stock Analysis</h2>
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                        Join BitBull to track your favorite stocks, monitor trends in real-time, and make data-driven investment decisions.
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Layout