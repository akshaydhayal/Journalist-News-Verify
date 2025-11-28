import { KnowledgeAsset } from '@/types'

const DKG_NODE_URL = process.env.NEXT_PUBLIC_DKG_NODE_URL || 'http://localhost:8900'

export interface PublishResponse {
  ual: string
  hash: string
  transactionHash?: string
}

export async function publishToDKG(
  knowledgeAsset: KnowledgeAsset
): Promise<PublishResponse> {
  try {
    // Using DKG Edge Node REST API
    // In production, you might use @dkg/client SDK
    const response = await fetch(`${DKG_NODE_URL}/api/v1.0/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: knowledgeAsset,
        contentType: 'application/ld+json',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DKG publish failed: ${error}`)
    }

    const result = await response.json()
    
    return {
      ual: result.ual || result['@id'] || 'unknown',
      hash: result.hash || 'unknown',
      transactionHash: result.transactionHash,
    }
  } catch (error) {
    console.error('Error publishing to DKG:', error)
    
    // For demo/hackathon purposes, return a mock response if DKG is not available
    if (error instanceof Error && error.message.includes('fetch')) {
      console.warn('DKG node not available, returning mock response')
      return {
        ual: `did:dkg:otp:2043/0xMOCK/${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2)}`,
      }
    }
    
    throw error
  }
}

export function createKnowledgeAsset(
  headline: string,
  description: string,
  mediaUrl: string,
  mediaHash: string,
  location: { 
    latitude: number
    longitude: number
    displayName?: string
    city?: string
    state?: string
    country?: string
  },
  timestamp: string,
  reporterId?: string
): KnowledgeAsset {
  const mediaFormat = mediaUrl.includes('.jpg') || mediaUrl.includes('.jpeg') 
    ? 'image/jpeg' 
    : mediaUrl.includes('.png') 
    ? 'image/png' 
    : mediaUrl.includes('.mp4') 
    ? 'video/mp4' 
    : 'application/octet-stream'

  // Build spatial coverage with location name if available
  const spatialCoverage: any = {
    type: 'Place',
    'schema:latitude': location.latitude,
    'schema:longitude': location.longitude,
  }

  // Add location name information if available
  if (location.displayName) {
    spatialCoverage['schema:name'] = location.displayName
  }
  if (location.city) {
    spatialCoverage['schema:addressLocality'] = location.city
  }
  if (location.state) {
    spatialCoverage['schema:addressRegion'] = location.state
  }
  if (location.country) {
    spatialCoverage['schema:addressCountry'] = location.country
  }

  return {
    '@context': {
      schema: 'https://schema.org/',
      prov: 'http://www.w3.org/ns/prov#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      sioc: 'http://rdfs.org/sioc/ns#',
    },
    '@type': ['schema:SocialMediaPosting', 'prov:Entity'],
    'schema:headline': headline,
    'schema:description': description,
    'schema:datePublished': timestamp,
    'schema:url': mediaUrl,
    'prov:hadPrimarySource': {
      '@type': 'prov:Entity',
      '@id': mediaUrl,
      'schema:contentUrl': mediaUrl,
      'schema:spatialCoverage': spatialCoverage,
      'schema:creator': reporterId || 'did:example:reporter',
      'prov:generatedAtTime': timestamp,
      'schema:encodingFormat': mediaFormat,
      'schema:sha256': mediaHash,
    },
    ...(reporterId && {
      'prov:wasAttributedTo': {
        '@id': reporterId,
      },
    }),
  }
}

