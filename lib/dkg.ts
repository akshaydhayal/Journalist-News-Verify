import { KnowledgeAsset } from '@/types'

/**
 * Note: This file contains utilities for creating Knowledge Assets.
 * Publishing is now handled through the /api/publish API route which uses dkg.js
 * to publish to the OriginTrail DKG public node.
 */

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

