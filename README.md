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
# OriginTrail DKG Edge Node URL
# Use a public node or your own instance
NEXT_PUBLIC_DKG_NODE_URL=http://localhost:8900

# Arweave Gateway URL
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
```

**Note:** For the hackathon, if you don't have a DKG node running, the app will return mock responses so you can test the full workflow.

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
- **OriginTrail DKG** - Decentralized Knowledge Graph
- **Web Crypto API** - SHA-256 hashing
- **Lucide React** - Icons

## Next Steps (Future Enhancements)

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

