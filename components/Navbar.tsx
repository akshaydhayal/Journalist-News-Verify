'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">
                Journalist News
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                Verified on DKG
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isActive('/')
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Home className="w-4 h-4" />
              <span>News Feed</span>
            </Link>
            
            <Link
              href="/publish"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isActive('/publish')
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

