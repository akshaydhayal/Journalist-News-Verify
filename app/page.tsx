'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, User, ExternalLink, Shield, Search, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'
import { ImageSlider } from '@/components/ImageSlider'

interface MediaItem {
  url: string
  hash: string
  type: 'image' | 'video'
}

interface NewsItem {
  _id: string
  headline: string
  description: string
  ual: string
  mediaUrl: string
  mediaItems?: MediaItem[]
  jsonld?: {
    associatedMedia?: Array<{
      contentUrl?: string
      encodingFormat?: string
      sha256?: string
    }>
  }
  location: {
    latitude: number
    longitude: number
    displayName?: string
    city?: string
    state?: string
    country?: string
  }
  journalist?: {
    name?: string
    email?: string
    organization?: string
  }
  publishedAt: string
  createdAt: string
}

// Helper function to extract media items from news item
function extractMediaItems(item: NewsItem): MediaItem[] {
  // First, try to use mediaItems field if it exists
  if (item.mediaItems && item.mediaItems.length > 0) {
    return item.mediaItems
  }
  
  // Otherwise, extract from jsonld.associatedMedia
  if (item.jsonld?.associatedMedia && Array.isArray(item.jsonld.associatedMedia)) {
    return item.jsonld.associatedMedia.map((media: any) => {
      const encodingFormat = media.encodingFormat || media['encodingFormat'] || ''
      const isVideo = encodingFormat.startsWith('video/')
      return {
        url: media.contentUrl || media['contentUrl'] || '',
        hash: media.sha256 || media['sha256'] || '',
        type: (isVideo ? 'video' : 'image') as 'image' | 'video',
      }
    }).filter((item: MediaItem) => item.url) // Filter out items without URLs
  }
  
  // Fallback to single mediaUrl
  if (item.mediaUrl) {
    return [{
      url: item.mediaUrl,
      hash: '',
      type: 'image' as const,
    }]
  }
  
  return []
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Initial load
  useEffect(() => {
    fetchNews()
  }, [])

  // Debounced search - triggers as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedInput = searchInput.trim()
      if (trimmedInput !== searchQuery) {
        setSearchQuery(trimmedInput)
        fetchNews(trimmedInput || undefined)
      }
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const fetchNews = async (search?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (search && search.trim()) {
        params.append('search', search.trim())
      }
      params.append('limit', '50')
      
      const response = await fetch(`/api/news?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setNews(data.news || [])
      } else {
        setError(data.error || 'Failed to load news')
      }
    } catch (err) {
      setError('Failed to fetch news')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect, but we can keep this for form submission
    setSearchQuery(searchInput.trim())
    fetchNews(searchInput.trim() || undefined)
  }

  const handleClear = () => {
    setSearchInput('')
    setSearchQuery('')
    fetchNews()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getLocationDisplay = (location: NewsItem['location']) => {
    if (location.displayName) return location.displayName
    if (location.city && location.state) return `${location.city}, ${location.state}`
    if (location.city) return location.city
    if (location.country) return location.country
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-indigo-900/30">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-sm text-slate-400">
            Browse verifiable news reports published on the OriginTrail DKG
          </p>
        </div>


        {/* Search Bar */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search news by headline or description..."
                className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-600/50 transition-colors border border-slate-600"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-slate-300">Loading news...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/40 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <>
            {news.length === 0 ? (
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 p-12 text-center">
                <p className="text-slate-200 text-lg">No news reports found</p>
                {searchQuery && (
                  <p className="text-slate-400 mt-2">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <article
                    key={item._id}
                    className="bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 overflow-hidden hover:shadow-2xl hover:border-purple-500/40 hover:bg-slate-800/80 transition-all duration-300 group"
                  >
                    {/* Media */}
                    {(() => {
                      const extractedMedia = extractMediaItems(item)
                      return extractedMedia.length > 0 ? (
                        <div className="relative aspect-video bg-gray-200 overflow-hidden">
                          <ImageSlider 
                            mediaItems={extractedMedia}
                            mediaUrl={item.mediaUrl}
                            headline={item.headline}
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-video bg-slate-700/50 border-b border-purple-500/20 flex items-center justify-center">
                          <div className="text-center px-4">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                            <p className="text-sm text-slate-400 font-medium">No media published</p>
                            <p className="text-xs text-slate-500 mt-1">Text-only report</p>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        </div>
                      )
                    })()}

                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {item.headline}
                      </h2>
                      
                      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        {item.location && (
                          <div className="flex items-start gap-2 text-sm text-slate-400">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                            <span className="line-clamp-1">{getLocationDisplay(item.location)}</span>
                          </div>
                        )}

                        {item.journalist?.name && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <User className="w-4 h-4 text-purple-400" />
                            <span>
                              {item.journalist.name}
                              {item.journalist.organization && (
                                <span className="text-slate-500"> • {item.journalist.organization}</span>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-purple-500/20">
                        <a
                          href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(item.ual)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-purple-500/50"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Verify on DKG
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Results Count */}
            {searchQuery && news.length > 0 && (
              <div className="mt-6 text-center text-slate-400 text-sm">
                Found {news.length} result{news.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

