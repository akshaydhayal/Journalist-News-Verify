'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface MediaItem {
  url: string
  hash: string
  type: 'image' | 'video'
}

interface ImageSliderProps {
  mediaItems: MediaItem[]
  mediaUrl?: string // Fallback for old data
  headline: string
}

export function ImageSlider({ mediaItems, mediaUrl, headline }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle backwards compatibility - if no mediaItems, use mediaUrl
  const items: MediaItem[] = mediaItems && mediaItems.length > 0 
    ? mediaItems 
    : mediaUrl 
    ? [{ url: mediaUrl, hash: '', type: 'image' as const }]
    : []

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        No media
      </div>
    )
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
  }

  const currentItem = items[currentIndex]

  return (
    <div className="relative w-full h-full group">
      {/* Media Display */}
      {currentItem.type === 'video' ? (
        <video
          src={currentItem.url}
          className="w-full h-full object-cover"
          controls
          poster={items.find(i => i.type === 'image')?.url}
        />
      ) : (
        <img
          src={currentItem.url}
          alt={`${headline} - ${currentIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}

      {/* Navigation Arrows - Always visible if more than 1 item */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full shadow-lg transition-all z-20 active:scale-95"
            aria-label="Previous image"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full shadow-lg transition-all z-20 active:scale-95"
            aria-label="Next image"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator - Always visible if more than 1 item */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setCurrentIndex(index)
              }}
              className={`rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8 h-2' 
                  : 'bg-white/60 hover:bg-white/80 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}

      {/* Media Count Badge - Only show if more than 1 item */}
      {items.length > 1 && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
          {currentIndex + 1} / {items.length}
        </div>
      )}

      {/* Video Indicator */}
      {currentItem.type === 'video' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-20">
          <Play className="w-3 h-3" />
          Video
        </div>
      )}
    </div>
  )
}
