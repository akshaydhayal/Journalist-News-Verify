'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getLocation } from '@/lib/utils'

interface LocationCaptureProps {
  onLocationCaptured: (location: { latitude: number; longitude: number }) => void
}

export function LocationCapture({ onLocationCaptured }: LocationCaptureProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    captureLocation()
  }, [])

  const captureLocation = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const position = await getLocation()
      const loc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      setLocation(loc)
      onLocationCaptured(loc)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
      console.error('Location error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">Location Capture</h3>
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Capturing your location...</span>
            </div>
          )}
          {error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={captureLocation}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}
          {location && !loading && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Location captured successfully</span>
              </div>
              <p className="text-xs text-gray-600">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              <button
                onClick={captureLocation}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
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

