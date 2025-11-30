'use client'

import { useState, useEffect } from 'react'
import { Upload, MapPin, Clock, FileText, Image as ImageIcon, Video, X, Loader2, User } from 'lucide-react'
import { LocationCapture } from '@/components/LocationCapture'
import { PublishButton } from '@/components/PublishButton'
import { SuccessModal } from '@/components/SuccessModal'
import { JsonLdPreview } from '@/components/JsonLdPreview'
import { NewsReport, MediaFile, LocationData, JournalistInfo } from '@/types'

export default function PublishPage() {
  const [report, setReport] = useState<Partial<NewsReport>>({
    timestamp: new Date().toISOString(),
  })
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedUAL, setPublishedUAL] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Check if form is complete (media is optional)
  const isFormComplete = !!(
    report.headline?.trim() &&
    report.description?.trim() &&
    report.location
  )

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files).filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )

    const newMedia: MediaFile[] = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setReport(prev => ({
      ...prev,
      media: [...(prev.media || []), ...newMedia],
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeMedia = (index: number) => {
    setReport(prev => {
      const media = prev.media || []
      URL.revokeObjectURL(media[index].preview)
      return {
        ...prev,
        media: media.filter((_, i) => i !== index),
      }
    })
  }

  const handleLocationCaptured = (location: LocationData) => {
    setReport(prev => ({ ...prev, location }))
  }

  const handlePublishSuccess = (ual: string) => {
    setPublishedUAL(ual)
  }

  const handleReset = () => {
    // Cleanup media URLs
    report.media?.forEach(m => URL.revokeObjectURL(m.preview))
    setReport({ timestamp: new Date().toISOString() })
    setPublishedUAL(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-indigo-900/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2 tracking-tight">
            Publish News Report
          </h1>
          <p className="text-slate-400">
            Create and publish verifiable news reports on the OriginTrail DKG
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 p-6 md:p-8 space-y-6">
          
          {/* Section 1: Journalist Details */}
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Journalist Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="journalist-name" className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="journalist-name"
                  value={report.journalist?.name || ''}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    journalist: { ...prev.journalist, name: e.target.value }
                  }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="journalist-email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="journalist-email"
                  value={report.journalist?.email || ''}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    journalist: { ...prev.journalist, email: e.target.value }
                  }))}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="journalist-organization" className="block text-sm font-medium text-slate-300 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="journalist-organization"
                  value={report.journalist?.organization || ''}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    journalist: { ...prev.journalist, organization: e.target.value }
                  }))}
                  placeholder="News organization or freelance"
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="journalist-contact" className="block text-sm font-medium text-slate-300 mb-1">
                  Contact (Optional)
                </label>
                <input
                  type="text"
                  id="journalist-contact"
                  value={report.journalist?.contact || ''}
                  onChange={(e) => setReport(prev => ({
                    ...prev,
                    journalist: { ...prev.journalist, contact: e.target.value }
                  }))}
                  placeholder="Phone or social media handle"
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-purple-500/20" />

          {/* Section 2: Report Details (Title & Description) */}
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Report Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-slate-300 mb-1">
                  Headline *
                </label>
                <input
                  type="text"
                  id="headline"
                  value={report.headline || ''}
                  onChange={(e) => setReport(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="Enter a clear, concise headline"
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{(report.headline || '').length}/200</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={report.description || ''}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you witnessed. Include relevant details, context, and observations."
                  rows={4}
                  className="w-full px-4 py-3 border border-purple-500/30 rounded-xl bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{(report.description || '').length}/2000</p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-purple-500/20" />

          {/* Section 3: Media Upload */}
          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Evidence
            </h2>

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-purple-500/30 hover:border-purple-500/50 bg-slate-700/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                <p className="text-slate-300 mb-1">
                  Drag and drop or{' '}
                  <span className="text-purple-400 font-medium">browse</span>
                </p>
                <p className="text-xs text-slate-400">
                  Photos and videos (JPG, PNG, MP4)
                </p>
              </label>
            </div>

            {/* Media Previews */}
            {report.media && report.media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {report.media.map((media, index) => (
                  <div key={index} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-700/50 shadow-lg border border-purple-500/20">
                    {media.file.type.startsWith('image/') ? (
                      <img
                        src={media.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={media.preview}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      {media.file.type.startsWith('image/') ? (
                        <ImageIcon className="w-3 h-3" />
                      ) : (
                        <Video className="w-3 h-3" />
                      )}
                      {(media.file.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Divider */}
          <hr className="border-purple-500/20" />

          {/* Section 4: Location & Timestamp - Side by Side */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Location
                </h2>
                <LocationCapture onLocationCaptured={handleLocationCaptured} />
              </div>

              {/* Timestamp */}
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Timestamp
                </h2>
                <div className="bg-purple-900/20 rounded-xl px-4 py-3 text-slate-200 border border-purple-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">
                      {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* JSON-LD Preview (only show when form has data) */}
          {(report.headline || report.description) && report.location && (
            <>
              <hr className="border-purple-500/20" />
              <section>
                <JsonLdPreview report={report} />
              </section>
            </>
          )}

          {/* Divider */}
          <hr className="border-purple-500/20" />

          {/* Publish Section */}
          <section>
            {!isFormComplete && (
              <div className="bg-amber-900/40 border border-amber-500/30 rounded-xl px-4 py-3 mb-4 backdrop-blur-sm">
                <p className="text-sm text-amber-200">
                  <strong>Required:</strong> Please fill in all fields to publish.
                  {!report.location && ' • Allow location access'}
                  {!report.headline?.trim() && ' • Add headline'}
                  {!report.description?.trim() && ' • Add description'}
                </p>
              </div>
            )}

            <PublishButton
              report={report as NewsReport}
              onSuccess={handlePublishSuccess}
              isPublishing={isPublishing}
              onPublishingChange={setIsPublishing}
            />
          </section>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Powered by OriginTrail DKG • Decentralized Knowledge Graph
        </p>

        {/* Success Modal */}
        {publishedUAL && (
          <SuccessModal ual={publishedUAL} onClose={handleReset} />
        )}
      </div>
    </main>
  )
}

