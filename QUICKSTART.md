# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment (Optional)

Create `.env.local` file:

```env
NEXT_PUBLIC_DKG_NODE_URL=http://localhost:8900
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
```

**Note:** If you don't have a DKG node, the app will work with mock responses for testing.

### 3. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📝 How to Use

1. **Upload Media**: Drag and drop or click to upload photos/videos
2. **Allow Location**: Grant location permissions when prompted
3. **Fill Details**: Enter headline and description
4. **Review**: Check all information
5. **Publish**: Click "Publish to OriginTrail DKG"
6. **Copy UAL**: Save the Uniform Asset Locator for verification

## 🎯 Features

- ✅ Step-by-step workflow
- ✅ Automatic GPS capture
- ✅ Automatic timestamp
- ✅ Media preview
- ✅ Progress indicators
- ✅ Error handling
- ✅ Success modal with UAL

## 🔧 Troubleshooting

### Location not working?
- Make sure you've granted location permissions
- Try refreshing the page
- Check browser console for errors

### DKG publish failing?
- Check if DKG node is running (if using local node)
- Check `.env.local` configuration
- App will use mock responses if DKG is unavailable

### Media upload issues?
- Check file size (large files may take time)
- Supported formats: JPG, PNG, MP4, etc.
- Try refreshing if upload stalls

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check the code structure in `/components` and `/lib`
- Customize the Knowledge Asset schema in `/lib/dkg.ts`

