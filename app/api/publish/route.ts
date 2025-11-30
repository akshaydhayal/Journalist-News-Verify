// API route for publishing News Reports to DKG
// Uses dkg.js npm package with dynamic import for Vercel compatibility

import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeAsset } from '@/types';
import connectDB from '@/lib/mongodb';
import NewsReport from '@/models/NewsReport';

// Type for the publish result
interface DKGPublishResult {
  success: boolean;
  ual?: string;
  datasetRoot?: string;
  error?: string;
  operation?: any;
}

interface MediaItem {
  url: string;
  hash: string;
  type: 'image' | 'video';
}

interface PublishRequestBody {
  knowledgeAsset?: KnowledgeAsset;
  mediaItems?: MediaItem[];
  // Support old format where knowledgeAsset is sent directly
  '@context'?: string;
  '@type'?: string;
  '@id'?: string;
  headline?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequestBody = await request.json();
    
    // Support both new format (with knowledgeAsset wrapper) and old format (direct KA)
    const knowledgeAsset: KnowledgeAsset = body.knowledgeAsset || body as unknown as KnowledgeAsset;
    const mediaItems: MediaItem[] = body.mediaItems || [];
    
    console.log('📥 Received request:');
    console.log('  - body.mediaItems:', body.mediaItems ? body.mediaItems.length : 'undefined');
    console.log('  - mediaItems array length:', mediaItems.length);
    if (mediaItems.length > 0) {
      console.log('  - First mediaItem:', JSON.stringify(mediaItems[0], null, 2));
    }
    console.log('  - Knowledge Asset associatedMedia:', Array.isArray(knowledgeAsset['associatedMedia']) ? knowledgeAsset['associatedMedia'].length : 'not array');
    if (Array.isArray(knowledgeAsset['associatedMedia'])) {
      console.log('  - First associatedMedia:', JSON.stringify(knowledgeAsset['associatedMedia'][0], null, 2));
    }
    
    // Validate knowledge asset structure
    if (!knowledgeAsset['@context'] || !knowledgeAsset['@type'] || !knowledgeAsset['@id'] || !knowledgeAsset['headline']) {
      return NextResponse.json(
        { success: false, error: 'Invalid Knowledge Asset structure - missing @context, @type, @id, or headline' },
        { status: 400 }
      );
    }
    
    // Check if DKG is configured
    const privateKey = process.env.DKG_PRIVATE_KEY || process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'DKG private key not configured. Please set DKG_PRIVATE_KEY or PRIVATE_KEY in environment variables.',
        jsonld: knowledgeAsset,
      }, { status: 500 });
    }
    
    // Get DKG configuration
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    
    let result: DKGPublishResult;
    
    try {
      // Use the dkg.js npm package directly
      // Dynamic import to avoid bundling issues on Vercel
      const DKGModule = await import('dkg.js');
      const DKG = DKGModule.default || DKGModule;
      
      console.log('Creating DKG client with endpoint:', nodeEndpoint);
      
      // Create DKG client
      const dkgClient = new DKG({
        endpoint: nodeEndpoint,
        port: nodePort,
        blockchain: {
          name: blockchainName,
          privateKey: privateKey,
        },
        maxNumberOfRetries: 300,
        frequency: 2,
        contentType: 'all',
        nodeApiVersion: '/v1',
      });
      
      // Transform to DKG format
      const dkgContent = {
        public: knowledgeAsset,
      };
      
      // Publish to DKG
      console.log('Publishing to DKG...');
      const createResult = await dkgClient.asset.create(dkgContent, {
        epochsNum: 2,
        minimumNumberOfFinalizationConfirmations: 3,
        minimumNumberOfNodeReplications: 1,
      });
      
      console.log('DKG publish completed');
      console.log('Create result:', JSON.stringify(createResult, null, 2));
      
      // Extract UAL and datasetRoot
      const ual = createResult.UAL || createResult.ual;
      const datasetRoot = createResult.publicAssertionId || createResult.datasetRoot || null;
      
      result = {
        success: true,
        ual: ual,
        datasetRoot: datasetRoot || undefined,
        operation: createResult.operation || undefined,
      };
    } catch (dkgError) {
      console.error('DKG publish error:', dkgError);
      return NextResponse.json({
        success: false,
        error: dkgError instanceof Error ? dkgError.message : 'DKG publish failed',
        jsonld: knowledgeAsset,
      }, { status: 500 });
    }
    
    if (!result.success || !result.ual) {
      return NextResponse.json({
        success: false,
        error: result.error || 'DKG publish failed - no UAL returned',
        jsonld: knowledgeAsset,
      }, { status: 500 });
    }

    // Save to MongoDB on successful publish
    try {
      await connectDB();
      
      const headline = knowledgeAsset['headline'] || knowledgeAsset['name'] || 'Untitled Report';
      const description = knowledgeAsset['description'] || '';
      
      // Extract media items - prioritize mediaItems from request body, fallback to associatedMedia
      const associatedMedia = knowledgeAsset['associatedMedia'];
      let mediaUrl = knowledgeAsset['url'] || '';
      let mediaHash = '';
      let dbMediaItems: Array<{ url: string; hash: string; type: 'image' | 'video' }> = [];
      
      // Always extract from associatedMedia array in JSON-LD (this is the source of truth)
      if (Array.isArray(associatedMedia) && associatedMedia.length > 0) {
        console.log('📦 Extracting from associatedMedia array:', associatedMedia.length);
        dbMediaItems = associatedMedia.map((media: any) => {
          const encodingFormat = media['encodingFormat'] || '';
          const isVideo = encodingFormat.startsWith('video/');
          return {
            url: media['contentUrl'] || '',
            hash: media['sha256'] || '',
            type: (isVideo ? 'video' : 'image') as 'image' | 'video',
          };
        }).filter(item => item.url); // Filter out items without URLs
        mediaUrl = dbMediaItems[0]?.url || '';
        mediaHash = dbMediaItems[0]?.hash || '';
      }
      // Fallback: Use mediaItems from request body if associatedMedia is not available
      else if (mediaItems && mediaItems.length > 0) {
        console.log('✅ Using mediaItems from request body:', mediaItems.length);
        dbMediaItems = [...mediaItems]; // Create a copy
        mediaUrl = dbMediaItems[0]?.url || '';
        mediaHash = dbMediaItems[0]?.hash || '';
      } 
      // Third priority: Single media object
      else if (associatedMedia && !Array.isArray(associatedMedia)) {
        console.log('📄 Extracting from single associatedMedia object');
        const encodingFormat = associatedMedia['encodingFormat'] || '';
        const isVideo = encodingFormat.startsWith('video/');
        mediaUrl = associatedMedia['contentUrl'] || mediaUrl;
        mediaHash = associatedMedia['sha256'] || '';
        dbMediaItems = [{
          url: mediaUrl,
          hash: mediaHash,
          type: isVideo ? 'video' : 'image',
        }];
      }
      
      console.log('💾 Final mediaItems to save to DB:', dbMediaItems.length);
      if (dbMediaItems.length > 0) {
        console.log('📸 Sample media item:', JSON.stringify(dbMediaItems[0], null, 2));
        console.log('📸 All media items:', JSON.stringify(dbMediaItems, null, 2));
      } else {
        console.warn('⚠️ WARNING: No media items found to save!');
      }
      
      const contentLocation = knowledgeAsset['contentLocation'] || {};
      const location = {
        latitude: contentLocation['schema:latitude'] || 0,
        longitude: contentLocation['schema:longitude'] || 0,
        displayName: contentLocation['schema:name'],
        city: contentLocation['schema:addressLocality'],
        state: contentLocation['schema:addressRegion'],
        country: contentLocation['schema:addressCountry'],
      };
      const reporterId = knowledgeAsset['author']?.['@id'];
      const author = knowledgeAsset['author'] || {};
      const journalist = {
        name: author['name'],
        email: author['email'],
        organization: author['affiliation']?.['name'],
        contact: undefined, // Contact not stored in JSON-LD
      };
      
      // Build the news report data object
      const newsReportData: any = {
        headline,
        ual: result.ual!,
        datasetRoot: result.datasetRoot || undefined,
        publishedAt: new Date(knowledgeAsset['datePublished'] || new Date()),
        reporterId: reporterId || undefined,
        description,
        mediaUrl,
        mediaHash,
        location,
        journalist: Object.values(journalist).some(v => v) ? journalist : undefined,
        jsonld: knowledgeAsset,
      };
      
      // ALWAYS add mediaItems array (even if empty, but should have items)
      newsReportData.mediaItems = dbMediaItems;
      
      console.log('📝 Creating NewsReport with:');
      console.log('  - headline:', headline);
      console.log('  - ual:', result.ual);
      console.log('  - mediaItems count:', dbMediaItems.length);
      console.log('  - mediaItems data:', JSON.stringify(dbMediaItems, null, 2));
      
      const savedReport = await NewsReport.create(newsReportData);
      
      console.log('✅ News Report saved to MongoDB:', result.ual);
      console.log('✅ Saved report mediaItems count:', savedReport.mediaItems?.length || 0);
      if (savedReport.mediaItems && savedReport.mediaItems.length > 0) {
        console.log('✅ First saved media item:', JSON.stringify(savedReport.mediaItems[0], null, 2));
      }
    } catch (dbError) {
      // Log error but don't fail the request if DB save fails
      console.error('Failed to save to MongoDB (non-critical):', dbError);
    }

    return NextResponse.json({
      success: true,
      ual: result.ual,
      datasetRoot: result.datasetRoot || null,
      jsonld: knowledgeAsset,
      operation: result.operation || null,
    });
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
