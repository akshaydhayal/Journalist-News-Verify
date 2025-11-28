export interface LocationInfo {
  city?: string
  state?: string
  country?: string
  displayName: string
  fullAddress?: string
}

/**
 * Reverse geocoding using OpenStreetMap Nominatim API
 * Converts GPS coordinates to human-readable location information
 * 
 * Note: OpenStreetMap Nominatim has usage limits (max 1 request per second).
 * For production use, consider using a commercial geocoding service or self-hosted Nominatim.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<LocationInfo> {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    // Note: Please respect their usage policy - max 1 request per second
    // For production, consider implementing rate limiting or using a commercial service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'JournalistNewsVerify/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()
    const address = data.address || {}

    // Extract location components
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      ''
    const state = address.state || address.region || ''
    const country = address.country || ''
    const fullAddress = data.display_name || ''

    // Build display name
    const parts: string[] = []
    if (city) parts.push(city)
    if (state && state !== city) parts.push(state)
    if (country) parts.push(country)

    const displayName = parts.length > 0 ? parts.join(', ') : fullAddress || 'Unknown Location'

    return {
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      displayName,
      fullAddress: fullAddress || undefined,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    // Return fallback if geocoding fails
    return {
      displayName: 'Location unavailable',
    }
  }
}

