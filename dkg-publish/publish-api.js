// Script to publish Knowledge Assets to DKG
// Called from Next.js API route via child process
// Note: dotenv is not used - environment variables are passed from the API route

import DKG from './index.js';

const OT_NODE_HOSTNAME = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
const OT_NODE_PORT = process.env.DKG_NODE_PORT || '8900';
const BLOCKCHAIN_NAME = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DKG_PRIVATE_KEY;

// Read JSON input from stdin
let inputData = '';

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    if (!PRIVATE_KEY) {
      console.log(JSON.stringify({
        success: false,
        error: 'PRIVATE_KEY or DKG_PRIVATE_KEY environment variable not set'
      }));
      process.exit(1);
    }

    const knowledgeAsset = JSON.parse(inputData);

    // Create DKG client
    const DkgClient = new DKG({
      endpoint: OT_NODE_HOSTNAME,
      port: OT_NODE_PORT,
      blockchain: {
        name: BLOCKCHAIN_NAME,
        privateKey: PRIVATE_KEY,
      },
      maxNumberOfRetries: 300,
      frequency: 2,
      contentType: 'all',
      nodeApiVersion: '/v1',
    });

    // Check node info first
    const nodeInfo = await DkgClient.node.info();
    console.error('Node info:', JSON.stringify(nodeInfo));

    // Publish to DKG
    const content = {
      public: knowledgeAsset,
    };

    const createResult = await DkgClient.asset.create(content, {
      epochsNum: 2,
      minimumNumberOfFinalizationConfirmations: 3,
      minimumNumberOfNodeReplications: 1,
    });

    // Output result as JSON to stdout
    console.log(JSON.stringify({
      success: true,
      UAL: createResult.UAL,
      datasetRoot: createResult.datasetRoot,
      operation: createResult.operation,
    }));

  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
    }));
    process.exit(1);
  }
});

