export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
  displayName?: string;
  fullAddress?: string;
}

export interface MediaFile {
  file: File;
  preview: string;
  hash?: string;
  arweaveUrl?: string;
}

export interface NewsReport {
  headline: string;
  description: string;
  media: MediaFile[];
  location: LocationData;
  timestamp: string;
  reporterId?: string;
}

export interface KnowledgeAsset {
  '@context': string;
  '@id': string;
  '@type': string;
  'name': string;
  'headline': string;
  'description': string;
  'datePublished': string;
  'url'?: string;
  'contentLocation': {
    '@type': string;
    'schema:latitude': number;
    'schema:longitude': number;
    'schema:name'?: string;
    'schema:addressLocality'?: string;
    'schema:addressRegion'?: string;
    'schema:addressCountry'?: string;
  };
  'author': {
    '@type': string;
    '@id': string;
  };
  'associatedMedia': {
    '@type': string;
    '@id': string;
    'contentUrl': string;
    'encodingFormat': string;
    'sha256': string;
    'dateCreated': string;
  };
}

