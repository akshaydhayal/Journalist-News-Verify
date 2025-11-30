'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-slate-800/80 backdrop-blur-md border-b border-purple-500/20 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-100 leading-tight">
                Journalist News
              </span>
              <span className="text-xs text-slate-400 leading-tight">
                Verified on DKG
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                isActive('/')
                  ? "bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              )}
            >
              <Home className="w-4 h-4" />
              <span>News Feed</span>
            </Link>
            
            <Link
              href="/publish"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                isActive('/publish')
                  ? "bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Publish News</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

