'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getLocation } from '@/lib/utils'
import { reverseGeocode } from '@/lib/geocoding'
import { LocationData } from '@/types'

interface LocationCaptureProps {
  onLocationCaptured: (location: LocationData) => void
}

export function LocationCapture({ onLocationCaptured }: LocationCaptureProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    captureLocation()
  }, [])

  const captureLocation = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const position = await getLocation()
      const loc: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }
      setLocation(loc)
      
      // Fetch location name (reverse geocoding)
      setGeocoding(true)
      try {
        const locationInfo = await reverseGeocode(loc.latitude, loc.longitude)
        const enrichedLoc: LocationData = {
          ...loc,
          ...locationInfo,
        }
        setLocation(enrichedLoc)
        onLocationCaptured(enrichedLoc)
      } catch (geocodeError) {
        // If geocoding fails, still use the coordinates
        console.warn('Geocoding failed, using coordinates only:', geocodeError)
        onLocationCaptured(loc)
      } finally {
        setGeocoding(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
      console.error('Location error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {(loading || geocoding) && (
            <div className="flex items-center gap-2 text-purple-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                {loading ? 'Capturing your location...' : 'Identifying location...'}
              </span>
            </div>
          )}
          {error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={captureLocation}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                Try again
              </button>
            </div>
          )}
          {location && !loading && !geocoding && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Location captured successfully</span>
              </div>
              {location.displayName && (
                <div className="bg-slate-700/50 rounded-lg px-3 py-2 border border-purple-500/30">
                  <p className="text-sm font-semibold text-slate-100">{location.displayName}</p>
                  {location.fullAddress && location.fullAddress !== location.displayName && (
                    <p className="text-xs text-slate-400 mt-1">{location.fullAddress}</p>
                  )}
                </div>
              )}
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <span className="font-medium">Coordinates:</span>{' '}
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
                {location.accuracy && (
                  <p className="text-slate-400">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </p>
                )}
              </div>
              <button
                onClick={captureLocation}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium mt-1"
              >
                Update location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

