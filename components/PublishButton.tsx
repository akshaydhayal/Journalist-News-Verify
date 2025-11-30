'use client'

import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { NewsReport } from '@/types'
import { computeFileHash } from '@/lib/hash'
import { uploadToArweave } from '@/lib/arweave'
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
    if (!report.media || report.media.length === 0 || !report.location || !report.headline || !report.description) {
      setError('Missing required information')
      return
    }

    onPublishingChange(true)
    setError(null)
    setProgress('Processing media files...')

    try {
      // Upload all media files
      const uploadedMedia: UploadedMedia[] = []
      
      for (let i = 0; i < report.media.length; i++) {
        const mediaFile = report.media[i]
        const isVideo = mediaFile.file.type.startsWith('video/')
        
        setProgress(`Computing hash for file ${i + 1} of ${report.media.length}...`)
        const hash = await computeFileHash(mediaFile.file)
        
        setProgress(`Uploading file ${i + 1} of ${report.media.length} to cloud...`)
        const url = await uploadToArweave(mediaFile.file)
        
        uploadedMedia.push({
          url,
          hash,
          type: isVideo ? 'video' : 'image'
        })
      }
      
      // Use the first media for the primary fields (backwards compatibility)
      const primaryMedia = uploadedMedia[0]
      
      setProgress('Creating Knowledge Asset...')
      const knowledgeAsset = createKnowledgeAsset(
        report.headline,
        report.description,
        primaryMedia.url,
        primaryMedia.hash,
        report.location,
        report.timestamp || new Date().toISOString(),
        report.reporterId,
        report.journalist,
        uploadedMedia // Pass all media items for associatedMedia array
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {progress && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">{progress}</p>
          </div>
        </div>
      )}

      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <p className="text-xs text-gray-500 text-center">
        Your report will be published as a verifiable Knowledge Asset on the OriginTrail Decentralized Knowledge Graph
      </p>
    </div>
  )
}
