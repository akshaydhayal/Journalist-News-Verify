# Journalist News Verify

A decentralized news verification platform built for the OriginTrail hackathon. This application allows citizen journalists to publish verifiable news reports with media, GPS location, and timestamps as Knowledge Assets on the OriginTrail Decentralized Knowledge Graph (DKG).

## Features

- 📸 Media upload (photos/videos) with drag & drop support
- 📍 Automatic GPS location capture
- ⏰ Automatic timestamp recording
- 🔗 JSON-LD Knowledge Asset generation with proper schema.org and PROV-O vocabularies
- 🌐 Publishing to OriginTrail DKG
- 💾 Media storage on Arweave (simulated for hackathon)
- 🎨 Modern, beautiful UI with step-by-step workflow
- ✅ Verifiable provenance and content hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OriginTrail DKG Edge Node access (or use public node)

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# OriginTrail DKG Configuration (Required for publishing)
# Note: PRIVATE_KEY or DKG_PRIVATE_KEY can be used (PRIVATE_KEY is used by dkg-publish demo)
PRIVATE_KEY=your_private_key_here
# OR
DKG_PRIVATE_KEY=your_private_key_here

DKG_NODE_ENDPOINT=https://v6-pegasus-node-03.origin-trail.network
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN_NAME=otp:20430

# MongoDB (Optional - for storing published reports)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/JournalistNewsVerify

# Arweave Gateway URL
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
```

**Important Notes:**
- `DKG_PRIVATE_KEY`: Your wallet's private key (without 0x prefix) - **Required for publishing**
- `DKG_NODE_ENDPOINT`: Public DKG node endpoint (default provided)
- `MONGODB_URI`: Optional - only needed if you want to store published reports in MongoDB
- `MONGODB_URI` should end with the database name (e.g., `/JournalistNewsVerify`)

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
journalistNewsVerify/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main publishing page
├── components/
│   ├── LocationCapture.tsx  # GPS location capture component
│   ├── MediaUploader.tsx    # Media upload with preview
│   ├── NewsForm.tsx         # Headline and description form
│   ├── PublishButton.tsx    # DKG publishing logic
│   └── SuccessModal.tsx     # Success modal with UAL
├── lib/
│   ├── arweave.ts           # Arweave upload (simulated)
│   ├── dkg.ts               # DKG publishing and KA creation
│   ├── hash.ts              # File hashing (SHA-256)
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript type definitions
```

## How It Works

1. **Upload Media**: Journalist uploads photos/videos as evidence
2. **Capture Location**: App automatically captures GPS coordinates
3. **Add Details**: Journalist provides headline and description
4. **Generate Knowledge Asset**: App creates JSON-LD structured data with:
   - Schema.org vocabularies for content
   - PROV-O for provenance
   - Content hash for verification
   - Spatial and temporal metadata
5. **Publish to DKG**: Knowledge Asset is published to OriginTrail DKG
6. **Get UAL**: Receive Uniform Asset Locator for verification

## Knowledge Asset Schema

The generated Knowledge Assets follow this structure:

- `@type`: `schema:SocialMediaPosting` and `prov:Entity`
- `schema:headline`: News headline
- `schema:description`: Detailed description
- `schema:datePublished`: ISO timestamp
- `prov:hadPrimarySource`: Media file with:
  - Content URL (Arweave)
  - SHA-256 hash
  - GPS coordinates
  - Encoding format
  - Creation timestamp
- `prov:wasAttributedTo`: Reporter identifier (DID)

## Tech Stack

- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OriginTrail DKG** - Decentralized Knowledge Graph (via dkg.js)
- **MongoDB** (Optional) - Database for storing published reports
- **Web Crypto API** - SHA-256 hashing
- **Lucide React** - Icons
- **OpenStreetMap Nominatim** - Reverse geocoding for location names

## DKG Publishing

The app publishes Knowledge Assets to the OriginTrail DKG using the `dkg.js` SDK. Publishing happens through the `/api/publish` API route which:

1. Validates the Knowledge Asset structure
2. Connects to the DKG node using your private key
3. Publishes the asset to the blockchain
4. Returns the UAL (Uniform Asset Locator)
5. Optionally saves to MongoDB for indexing

### Getting a Private Key

You need a wallet with TRAC tokens on the OriginTrail testnet to publish. You can:
- Use an existing wallet
- Create a new wallet and fund it with testnet TRAC
- The private key should be the hex string without the `0x` prefix

### Publishing Flow

1. User uploads media and fills in report details
2. App generates JSON-LD Knowledge Asset
3. Frontend calls `/api/publish` with the Knowledge Asset
4. API route uses `dkg.js` to publish to DKG
5. Returns UAL which is displayed to the user

## Next Steps (Future Enhancements)

- [x] DKG publishing with public node
- [ ] Verification system with token staking
- [ ] Multi-file media support
- [ ] Real Arweave integration
- [ ] Wallet connection for DID
- [ ] Feed of published reports
- [ ] Search and filter functionality
- [ ] MCP integration for AI agents
- [ ] x402 payment protocol

## Hackathon Notes

This project is built for the **OriginTrail Hackathon - Scaling Trust in the Age of AI** (Challenge 2: Wild Card).

### Requirements Met

✅ Uses DKG Edge Node for publishing Knowledge Assets  
✅ Implements Trust Layer (provenance, hashing, timestamps)  
✅ Implements Knowledge Layer (JSON-LD structured data)  
✅ Agent Layer ready (MCP integration can be added)  
✅ Demonstrates verifiable news reporting

## License

MIT

