import Link from 'next/link'
import { TrendingUp, Github, Twitter, Linkedin, Activity, BarChart, Shield } from 'lucide-react'
import { Logo } from "./Logo"

export const Footer = () => {
    return (
        <footer className="w-full bg-black border-t border-gray-900 mt-auto relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 mb-10">
                    
                    {/* Brand Section (Takes up more space) */}
                    <div className="md:col-span-5 pr-8">
                        <Link href="/" className="inline-block mb-5 group transition-transform hover:scale-[1.02]">
                            <Logo variant="light" />
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                            Your intelligent, real-time companion for navigating the Indian stock market. We turn complex financial data into actionable, beautiful insights.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-all duration-300 hover:scale-110">
                                <Twitter className="h-3.5 w-3.5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 hover:scale-110">
                                <Github className="h-3.5 w-3.5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-blue-500 transition-all duration-300 hover:scale-110">
                                <Linkedin className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Features Links */}
                    <div className="md:col-span-3">
                        <h3 className="text-xs font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-blue-500" /> Platform
                        </h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm font-medium text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Live Dashboard</Link></li>
                            <li><Link href="/markets" className="text-sm font-medium text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Market Overview</Link></li>
                            <li><Link href="/portfolio" className="text-sm font-medium text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Portfolio Tracker</Link></li>
                            <li><Link href="/screener" className="text-sm font-medium text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Stock Screener</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-xs font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                            <BarChart className="w-3.5 h-3.5 text-indigo-500" /> Resources
                        </h3>
                        <ul className="space-y-3">
                            <li><Link href="/news" className="text-sm font-medium text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">Market News</Link></li>
                            <li><Link href="/learning" className="text-sm font-medium text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">Learning Center</Link></li>
                            <li><Link href="/api" className="text-sm font-medium text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">API Access</Link></li>
                            <li><Link href="/support" className="text-sm font-medium text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">Help & Support</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-xs font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Legal
                        </h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm font-medium text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 inline-block">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm font-medium text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 inline-block">Terms of Service</Link></li>
                            <li><Link href="/disclaimer" className="text-sm font-medium text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 inline-block">Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 flex flex-col md:flex-row items-center md:justify-end justify-center gap-4 w-full">
                    <p className="text-xs font-medium text-slate-500 text-center md:text-right">
                        &copy; {new Date().getFullYear()} BitBull. Designed with precision for Indian Markets.
                    </p>
                </div>
            </div>
        </footer>
    )
}
