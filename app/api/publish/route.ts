// API route for publishing News Reports to DKG
// Uses the local dkg-publish module

import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeAsset } from '@/types';
import connectDB from '@/lib/mongodb';
import NewsReport from '@/models/NewsReport';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

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
      // Import DKG client directly (works in both localhost and Vercel)
      // Use dynamic import with proper path resolution for ES modules
      const dkgPublishPath = path.resolve(process.cwd(), 'dkg-publish', 'index.js');
      
      console.log('Publishing to DKG...');
      console.log('Node endpoint:', nodeEndpoint);
      console.log('DKG path:', dkgPublishPath);
      console.log('Current working directory:', process.cwd());
      
      // Use child process to run dkg-publish script
      // This works reliably with ES modules in both localhost and Vercel
      
      // Detect environment
      const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
      console.log('Environment:', isVercel ? 'Vercel/Lambda' : 'Local');
      
      // Find the script path
      const possiblePaths = isVercel
        ? ['/var/task/dkg-publish/publish-api.js', path.join(process.cwd(), 'dkg-publish', 'publish-api.js')]
        : [path.resolve(process.cwd(), 'dkg-publish', 'publish-api.js')];
      
      let scriptPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          scriptPath = p;
          break;
        }
      }
      
      if (!scriptPath) {
        const cwdContents = fs.existsSync(process.cwd()) 
          ? fs.readdirSync(process.cwd()).slice(0, 20).join(', ')
          : 'CWD not accessible';
        throw new Error(
          `DKG publish script not found. Tried: ${possiblePaths.join(', ')}. ` +
          `CWD: ${process.cwd()}. Contents: ${cwdContents}`
        );
      }
      
      console.log('Using script path:', scriptPath);
      
      // Run the publish script as a child process
      const publishResult = await new Promise<any>((resolve, reject) => {
        const child = spawn('node', [scriptPath!], {
          cwd: path.dirname(scriptPath!),
          env: {
            ...process.env,
            DKG_NODE_ENDPOINT: nodeEndpoint,
            DKG_NODE_PORT: nodePort,
            DKG_BLOCKCHAIN_NAME: blockchainName,
            PRIVATE_KEY: privateKey,
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
          console.log('DKG stderr:', data.toString());
        });
        
        child.on('close', (code) => {
          console.log('Child process exited with code:', code);
          console.log('stdout:', stdout);
          if (stderr) console.log('stderr:', stderr);
          
          try {
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse output. stdout: ${stdout}. stderr: ${stderr}`));
          }
        });
        
        child.on('error', (err) => {
          reject(new Error(`Failed to spawn child process: ${err.message}`));
        });
        
        // Send the knowledge asset as JSON to stdin
        child.stdin.write(JSON.stringify(knowledgeAsset));
        child.stdin.end();
      });
      
      console.log('DKG publish completed');
      console.log('Result:', JSON.stringify(publishResult, null, 2));
      
      if (!publishResult.success) {
        throw new Error(publishResult.error || 'DKG publish failed');
      }
      
      const ual = publishResult.UAL;
      const datasetRoot = publishResult.datasetRoot || null;
      
      if (!ual) {
        throw new Error('DKG publish succeeded but no UAL returned');
      }
      
      result = {
        success: true,
        ual: ual,
        datasetRoot: datasetRoot || undefined,
        operation: publishResult.operation || undefined,
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


