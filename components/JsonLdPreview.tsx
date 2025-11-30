'use client'

import { useState, useEffect } from 'react'
import { Code, ChevronDown, ChevronUp, Copy, CheckCircle2 } from 'lucide-react'
import { NewsReport } from '@/types'
import { createKnowledgeAsset } from '@/lib/dkg'

interface JsonLdPreviewProps {
  report: Partial<NewsReport>
}

export function JsonLdPreview({ report }: JsonLdPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewJson, setPreviewJson] = useState<string>('')

  useEffect(() => {
    // Show preview if we have minimum required fields (headline, description, location, media)
    // Journalist info is optional but will be included if present
    if (report.headline && report.description && report.location && report.media && report.media.length > 0) {
      // Build preview media items for all uploaded files
      const previewMediaItems = report.media.map((mediaFile, index) => {
        const isVideo = mediaFile.file.type.startsWith('video/')
        const isImage = mediaFile.file.type.startsWith('image/')
        const fileExtension = isImage 
          ? (mediaFile.file.type.includes('png') ? '.png' : '.jpg')
          : isVideo 
          ? '.mp4' 
          : ''
        
        return {
          url: `cloudinary://placeholder/media_${index + 1}${fileExtension}`,
          hash: '0x...',
          type: (isVideo ? 'video' : 'image') as 'image' | 'video'
        }
      })

      // Generate preview Knowledge Asset with placeholder values
      // In the actual publish, these will be replaced with real hash and URL
      const previewAsset = createKnowledgeAsset(
        report.headline,
        report.description,
        previewMediaItems[0].url, // Primary URL - will be replaced with Cloudinary URL
        previewMediaItems[0].hash, // Placeholder hash - will be computed during publish
        report.location || { latitude: 0, longitude: 0 }, // Fallback if location not set
        report.timestamp || new Date().toISOString(),
        report.reporterId,
        report.journalist, // Include journalist info in preview
        previewMediaItems // Include all media items in preview
      )

      // Format JSON with proper indentation
      const formattedJson = JSON.stringify(previewAsset, null, 2)
      
      // Add a comment-like note at the top (as a string since JSON doesn't support comments)
      // We'll add it as a property that users can see
      setPreviewJson(formattedJson)
    }
  }, [report])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!report.headline || !report.description || !report.location || !report.media || report.media.length === 0) {
    return null
  }

  return (
    <div className="border-2 border-primary-200 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gradient-to-r from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">JSON-LD Knowledge Asset Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard()
              }}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-300 rounded transition-colors"
              title="Copy JSON"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          <div className="px-4 py-2 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> The <code className="bg-yellow-100 px-1 rounded">url</code>, <code className="bg-yellow-100 px-1 rounded">contentUrl</code>, and <code className="bg-yellow-100 px-1 rounded">sha256</code> values shown as placeholders will be replaced with actual Cloudinary URLs and computed hashes during publishing.
            </p>
          </div>
          <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono leading-relaxed">
              <code>{previewJson}</code>
            </pre>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Click to expand and preview the JSON-LD structure that will be published to the DKG
          </p>
        </div>
      )}
    </div>
  )
}

