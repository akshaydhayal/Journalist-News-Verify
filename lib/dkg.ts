import { KnowledgeAsset } from '@/types'

/**
 * Note: This file contains utilities for creating Knowledge Assets.
 * Publishing is now handled through the /api/publish API route which uses dkg.js
 * to publish to the OriginTrail DKG public node.
 */

interface MediaItem {
  url: string
  hash: string
  type: 'image' | 'video'
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
  reporterId?: string,
  journalist?: {
    name?: string
    email?: string
    organization?: string
    contact?: string
  },
  mediaItems?: MediaItem[]
): KnowledgeAsset {
  const getMediaFormat = (url: string, type?: string) => {
    if (type === 'video') return 'video/mp4'
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg'
    if (url.includes('.png')) return 'image/png'
    if (url.includes('.gif')) return 'image/gif'
    if (url.includes('.webp')) return 'image/webp'
    if (url.includes('.mp4')) return 'video/mp4'
    if (url.includes('.webm')) return 'video/webm'
    return 'application/octet-stream'
  }

  // Generate a unique ID for this news report
  // Using headline slug + timestamp to make it unique
  const headlineSlug = headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const timestampId = new Date(timestamp).getTime();
  const reportId = `urn:journalist-news:report:${headlineSlug}:${timestampId}`;

  // Generate reporter ID from journalist info or use provided reporterId
  let authorId = reporterId || 'urn:journalist-news:reporter:anonymous';
  if (journalist?.name || journalist?.email) {
    const nameSlug = journalist.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'reporter';
    const emailHash = journalist.email ? journalist.email.split('@')[0] : '';
    authorId = `urn:journalist-news:reporter:${nameSlug}${emailHash ? '-' + emailHash : ''}`;
  }

  // Build author object with journalist details
  const author: any = {
    '@type': 'Person',
    '@id': authorId,
  };

  if (journalist?.name) {
    author['name'] = journalist.name;
  }
  if (journalist?.email) {
    author['email'] = journalist.email;
  }
  if (journalist?.organization) {
    author['affiliation'] = {
      '@type': 'Organization',
      'name': journalist.organization,
    };
  }

  // Build spatial coverage with location name if available
  const spatialCoverage: any = {
    '@type': 'Place',
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

  // Build associated media - single or array
  let associatedMedia: any
  
  if (mediaItems && mediaItems.length > 1) {
    // Multiple media items - create array
    associatedMedia = mediaItems.map((item, index) => ({
      '@type': 'MediaObject',
      '@id': `${reportId}:media:${index + 1}`,
      'contentUrl': item.url,
      'encodingFormat': getMediaFormat(item.url, item.type),
      'sha256': item.hash,
      'dateCreated': timestamp,
    }))
  } else {
    // Single media item
    associatedMedia = {
      '@type': 'MediaObject',
      '@id': mediaUrl,
      'contentUrl': mediaUrl,
      'encodingFormat': getMediaFormat(mediaUrl),
      'sha256': mediaHash,
      'dateCreated': timestamp,
    }
  }

  const knowledgeAsset: KnowledgeAsset = {
    '@context': 'https://schema.org/',
    '@id': reportId,
    '@type': 'SocialMediaPosting',
    'name': headline,
    'headline': headline,
    'description': description,
    'datePublished': timestamp,
    'url': mediaUrl,
    'contentLocation': spatialCoverage,
    'author': author,
    'associatedMedia': associatedMedia,
  }

  return knowledgeAsset
}
