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
    // Show preview if we have minimum required fields (headline, description, location)
    // Media and journalist info are optional but will be included if present
    if (report.headline && report.description && report.location) {
      // Build preview media items for all uploaded files (if any)
      const previewMediaItems = report.media && report.media.length > 0
        ? report.media.map((mediaFile, index) => {
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
        : undefined

      // Generate preview Knowledge Asset with placeholder values
      // In the actual publish, these will be replaced with real hash and URL
      const previewAsset = createKnowledgeAsset(
        report.headline,
        report.description,
        previewMediaItems?.[0]?.url || 'https://example.com/no-media', // Primary URL or placeholder
        previewMediaItems?.[0]?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000', // Placeholder hash
        report.location || { latitude: 0, longitude: 0 }, // Fallback if location not set
        report.timestamp || new Date().toISOString(),
        report.reporterId,
        report.journalist, // Include journalist info in preview
        previewMediaItems // Include all media items in preview (or undefined if no media)
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

  if (!report.headline || !report.description || !report.location) {
    return null
  }

  return (
    <div className="border-2 border-purple-500/30 rounded-xl overflow-hidden bg-slate-800/40 backdrop-blur-sm shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-purple-900/30 hover:bg-purple-900/40 transition-colors flex items-center justify-between border-b border-purple-500/20"
      >
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-slate-100">JSON-LD Knowledge Asset Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard()
              }}
              className="p-1.5 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded transition-colors"
              title="Copy JSON"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-purple-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          <div className="px-4 py-2 bg-amber-900/40 border-l-4 border-amber-500/50">
            <p className="text-xs text-amber-200">
              <strong>Note:</strong> The <code className="bg-amber-900/50 px-1 rounded">url</code>, <code className="bg-amber-900/50 px-1 rounded">contentUrl</code>, and <code className="bg-amber-900/50 px-1 rounded">sha256</code> values shown as placeholders will be replaced with actual Cloudinary URLs and computed hashes during publishing.
            </p>
          </div>
          <div className="p-4 bg-slate-900/80 text-slate-100 overflow-x-auto max-h-96 overflow-y-auto border-t border-purple-500/20">
            <pre className="text-xs font-mono leading-relaxed">
              <code>{previewJson}</code>
            </pre>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="px-4 py-2 bg-slate-800/30 border-t border-purple-500/20">
          <p className="text-xs text-slate-400">
            Click to expand and preview the JSON-LD structure that will be published to the DKG
          </p>
        </div>
      )}
    </div>
  )
}

