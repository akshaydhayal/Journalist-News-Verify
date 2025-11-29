// API route for publishing News Reports to DKG
// Uses the dkg.js npm package directly

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    if (!knowledgeAsset['@context'] || !knowledgeAsset['@type'] || !knowledgeAsset['@id'] || !knowledgeAsset['headline']) {
      return NextResponse.json(
        { success: false, error: 'Invalid Knowledge Asset structure - missing @context, @type, @id, or headline' },
        { status: 400 }
      );
    }
    
    // Check if DKG is configured
    const privateKey = process.env.PRIVATE_KEY || process.env.DKG_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'DKG private key not configured. Please set PRIVATE_KEY or DKG_PRIVATE_KEY in environment variables.',
        jsonld: knowledgeAsset,
      }, { status: 500 });
    }
    
    // Get DKG configuration
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    
    let result: DKGPublishResult;
    
    try {
      console.log('Publishing to DKG...');
      console.log('Node endpoint:', nodeEndpoint);
      console.log('Blockchain:', blockchainName);
      
      // Dynamic import of dkg.js npm package
      const DKG = (await import('dkg.js')).default;
      
      // Create DKG client
      const DkgClient = new DKG({
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
      
      // Check node info first
      console.log('Checking node info...');
      const nodeInfo = await DkgClient.node.info();
      console.log('Node info:', JSON.stringify(nodeInfo));
      
      // Publish to DKG
      console.log('Creating asset on DKG...');
      const content = {
        public: knowledgeAsset,
      };
      
      const createResult = await DkgClient.asset.create(content, {
        epochsNum: 2,
        minimumNumberOfFinalizationConfirmations: 3,
        minimumNumberOfNodeReplications: 1,
      });
      
      console.log('DKG publish completed');
      console.log('Result:', JSON.stringify(createResult, null, 2));
      
      const ual = createResult.UAL;
      const datasetRoot = createResult.datasetRoot || null;
      
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
        const headline = knowledgeAsset['headline'] || knowledgeAsset['name'] || 'Untitled Report';
        const description = knowledgeAsset['description'] || '';
        const mediaUrl = knowledgeAsset['url'] || knowledgeAsset['associatedMedia']?.['contentUrl'] || '';
        const mediaHash = knowledgeAsset['associatedMedia']?.['sha256'] || '';
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
        
        await NewsReport.create({
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
