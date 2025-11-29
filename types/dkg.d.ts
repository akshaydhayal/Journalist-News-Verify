// Type declarations for dkg.js package

declare module 'dkg.js' {
  interface BlockchainConfig {
    name: string;
    privateKey: string;
  }

  interface DKGConfig {
    endpoint: string;
    port: string;
    blockchain: BlockchainConfig;
    maxNumberOfRetries?: number;
    frequency?: number;
    contentType?: string;
    nodeApiVersion?: string;
  }

  interface NodeInfo {
    version: string;
    [key: string]: any;
  }

  interface CreateOptions {
    epochsNum?: number;
    minimumNumberOfFinalizationConfirmations?: number;
    minimumNumberOfNodeReplications?: number;
  }

  interface CreateResult {
    UAL: string;
    datasetRoot?: string;
    operation?: any;
    [key: string]: any;
  }

  interface AssetContent {
    public: any;
    private?: any;
  }

  class DKG {
    constructor(config: DKGConfig);
    
    node: {
      info(): Promise<NodeInfo>;
    };
    
    asset: {
      create(content: AssetContent, options?: CreateOptions): Promise<CreateResult>;
      get(ual: string): Promise<any>;
    };
  }

  export default DKG;
}
