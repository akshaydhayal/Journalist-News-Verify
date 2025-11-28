export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
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
  '@context': {
    schema: string;
    prov: string;
    foaf: string;
    sioc: string;
  };
  '@type': string[];
  '@id'?: string;
  'schema:headline': string;
  'schema:description': string;
  'schema:datePublished': string;
  'schema:url'?: string;
  'prov:hadPrimarySource': {
    '@type': string;
    '@id': string;
    'schema:contentUrl': string;
    'schema:spatialCoverage': {
      type: string;
      'schema:latitude': number;
      'schema:longitude': number;
    };
    'schema:creator'?: string;
    'prov:generatedAtTime': string;
    'schema:encodingFormat': string;
    'schema:sha256': string;
  };
  'prov:wasAttributedTo'?: {
    '@id': string;
  };
}

