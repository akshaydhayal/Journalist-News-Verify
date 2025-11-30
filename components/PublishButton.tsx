'use client'

import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { NewsReport } from '@/types'
import { computeFileHash } from '@/lib/hash'
import { uploadMedia } from '@/lib/arweave'
import { createKnowledgeAsset } from '@/lib/dkg'

interface PublishButtonProps {
  report: NewsReport
  onSuccess: (ual: string) => void
  isPublishing: boolean
  onPublishingChange: (value: boolean) => void
}

interface PublishResponse {
  success: boolean
  ual?: string
  error?: string
}

interface UploadedMedia {
  url: string
  hash: string
  type: 'image' | 'video'
}

export function PublishButton({ report, onSuccess, isPublishing, onPublishingChange }: PublishButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const handlePublish = async () => {
    if (!report.location || !report.headline || !report.description) {
      setError('Missing required information: headline, description, and location are required')
      return
    }

    onPublishingChange(true)
    setError(null)

    try {
      // Upload media files if available (media is optional)
      const uploadedMedia: UploadedMedia[] = []
      
      if (report.media && report.media.length > 0) {
        setProgress('Processing media files...')
        
        for (let i = 0; i < report.media.length; i++) {
          const mediaFile = report.media[i]
          const isVideo = mediaFile.file.type.startsWith('video/')
          
          setProgress(`Uploading file ${i + 1} of ${report.media.length} to cloud...`)
          const uploadResult = await uploadMedia(mediaFile.file)
          
          uploadedMedia.push({
            url: uploadResult.url,
            hash: uploadResult.hash,
            type: isVideo ? 'video' : 'image'
          })
        }
      }
      
      // Use the first media for the primary fields if available, otherwise use placeholder
      const primaryMedia = uploadedMedia[0]
      
      setProgress('Creating Knowledge Asset...')
      const knowledgeAsset = createKnowledgeAsset(
        report.headline,
        report.description,
        primaryMedia?.url || 'https://example.com/no-media',
        primaryMedia?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        report.location,
        report.timestamp || new Date().toISOString(),
        report.reporterId,
        report.journalist,
        uploadedMedia.length > 0 ? uploadedMedia : undefined // Pass media items only if available
      )

      setProgress('Publishing to OriginTrail DKG...')
      
      // Use API route for publishing
      // Send mediaItems separately so they can be saved to DB but not published to DKG
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          knowledgeAsset,
          mediaItems: uploadedMedia, // Send separately for MongoDB storage
        }),
      })

      const result: PublishResponse = await response.json()
      
      if (!result.success || !result.ual) {
        throw new Error(result.error || 'Failed to publish to DKG')
      }
      
      setProgress('Success!')
      onSuccess(result.ual)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish'
      setError(errorMessage)
      console.error('Publish error:', err)
    } finally {
      onPublishingChange(false)
      setProgress('')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {progress && (
        <div className="bg-purple-900/40 border border-purple-500/30 text-purple-200 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">{progress}</p>
          </div>
        </div>
      )}

      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Publishing to DKG...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Publish to OriginTrail DKG
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Your report will be published as a verifiable Knowledge Asset on the OriginTrail Decentralized Knowledge Graph
      </p>
    </div>
  )
}
