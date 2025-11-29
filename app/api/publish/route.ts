// API route for publishing News Reports to DKG

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
  jsonld?: KnowledgeAsset;
  operation?: any;
}

export async function POST(request: NextRequest) {
  try {
    const knowledgeAsset: KnowledgeAsset = await request.json();
    
    // Validate knowledge asset structure
    if (!knowledgeAsset['@context'] || !knowledgeAsset['@type'] || !knowledgeAsset['schema:headline']) {
      return NextResponse.json(
        { success: false, error: 'Invalid Knowledge Asset structure' },
        { status: 400 }
      );
    }
    
    // Check if DKG is configured
    const privateKey = process.env.DKG_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'DKG private key not configured. Please set DKG_PRIVATE_KEY in environment variables.',
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
      // Dynamic import to avoid bundling issues
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
      
      if (!ual) {
        throw new Error('DKG publish succeeded but no UAL returned');
      }
      
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
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'DKG publish failed',
        jsonld: knowledgeAsset,
      }, { status: 500 });
    }

    // Save to MongoDB on successful publish (optional - MongoDB is not required)
    try {
      const db = await connectDB();
      
      if (db) {
        const headline = knowledgeAsset['schema:headline'] || 'Untitled Report';
        const description = knowledgeAsset['schema:description'] || '';
        const mediaUrl = knowledgeAsset['schema:url'] || '';
        const mediaHash = knowledgeAsset['prov:hadPrimarySource']?.['schema:sha256'] || '';
        const spatialCoverage = knowledgeAsset['prov:hadPrimarySource']?.['schema:spatialCoverage'] || {};
        const location = {
          latitude: spatialCoverage['schema:latitude'] || 0,
          longitude: spatialCoverage['schema:longitude'] || 0,
          displayName: spatialCoverage['schema:name'],
          city: spatialCoverage['schema:addressLocality'],
          state: spatialCoverage['schema:addressRegion'],
          country: spatialCoverage['schema:addressCountry'],
        };
        const reporterId = knowledgeAsset['prov:wasAttributedTo']?.['@id'];
        
        await NewsReport.create({
          headline,
          ual: result.ual!,
          datasetRoot: result.datasetRoot || undefined,
          publishedAt: new Date(knowledgeAsset['schema:datePublished'] || new Date()),
          reporterId: reporterId || undefined,
          description,
          mediaUrl,
          mediaHash,
          location,
          jsonld: knowledgeAsset,
        });
        
        console.log('News Report saved to MongoDB:', result.ual);
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


