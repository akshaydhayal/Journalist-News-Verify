'use client'

import { useState } from 'react'
import { Upload, MapPin, Clock, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { MediaUploader } from '@/components/MediaUploader'
import { LocationCapture } from '@/components/LocationCapture'
import { NewsForm } from '@/components/NewsForm'
import { PublishButton } from '@/components/PublishButton'
import { SuccessModal } from '@/components/SuccessModal'
import { JsonLdPreview } from '@/components/JsonLdPreview'
import { NewsReport } from '@/types'

export default function Home() {
  const [step, setStep] = useState<'media' | 'details' | 'publish'>('media')
  const [report, setReport] = useState<Partial<NewsReport>>({})
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedUAL, setPublishedUAL] = useState<string | null>(null)

  const handleMediaSelected = (media: File[]) => {
    const mediaFiles = media.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setReport(prev => ({ ...prev, media: mediaFiles }))
    setStep('details')
  }

  const handleLocationCaptured = (location: { latitude: number; longitude: number; displayName?: string; city?: string; state?: string; country?: string }) => {
    setReport(prev => ({ ...prev, location }))
  }

  const handleFormSubmit = (headline: string, description: string) => {
    setReport(prev => ({ ...prev, headline, description, timestamp: new Date().toISOString() }))
    setStep('publish')
  }

  const handlePublish = async () => {
    if (!report.headline || !report.description || !report.media || !report.location) {
      return
    }

    setIsPublishing(true)
    try {
      // This will be handled by the PublishButton component
      // We'll pass the report data and handle success here
    } catch (error) {
      console.error('Publish error:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePublishSuccess = (ual: string) => {
    setPublishedUAL(ual)
  }

  const handleReset = () => {
    setStep('media')
    setReport({})
    setPublishedUAL(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Journalist News Verify
          </h1>
          <p className="text-gray-600">
            Publish verifiable news reports on the OriginTrail DKG
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'media' ? 'text-primary-600' : step === 'details' || step === 'publish' ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'media' ? 'bg-primary-600 text-white' : step === 'details' || step === 'publish' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'}`}>
                <Upload className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Upload Media</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded">
              <div className={`h-full rounded ${step === 'details' || step === 'publish' ? 'bg-primary-500' : 'bg-gray-200'}`} style={{ width: step === 'details' || step === 'publish' ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center ${step === 'details' ? 'text-primary-600' : step === 'publish' ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-primary-600 text-white' : step === 'publish' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded">
              <div className={`h-full rounded ${step === 'publish' ? 'bg-primary-500' : 'bg-gray-200'}`} style={{ width: step === 'publish' ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center ${step === 'publish' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'publish' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Publish</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'media' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Evidence</h2>
              <p className="text-gray-600 mb-6">
                Upload photos or videos that serve as evidence for your news report
              </p>
              <MediaUploader onMediaSelected={handleMediaSelected} />
            </div>
          )}

          {step === 'details' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Report Details</h2>
              <LocationCapture onLocationCaptured={handleLocationCaptured} />
              <div className="mt-6">
                <NewsForm 
                  onSubmit={handleFormSubmit}
                  initialHeadline={report.headline}
                  initialDescription={report.description}
                />
              </div>
            </div>
          )}

          {step === 'publish' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Review & Publish</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Headline</h3>
                  <p className="text-gray-900">{report.headline}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900">{report.description}</p>
                </div>
                {report.location && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location
                    </h3>
                    {report.location.displayName && (
                      <p className="text-gray-900 font-medium mb-2">{report.location.displayName}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                    </p>
                    {report.location.accuracy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Accuracy: ±{Math.round(report.location.accuracy)}m
                      </p>
                    )}
                  </div>
                )}
                {report.timestamp && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Timestamp
                    </h3>
                    <p className="text-gray-900">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
                {report.media && report.media.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Media ({report.media.length})</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {report.media.map((media, idx) => (
                        <div key={idx} className="relative aspect-video rounded overflow-hidden">
                          {media.file.type.startsWith('image/') ? (
                            <img src={media.preview} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <video src={media.preview} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* JSON-LD Preview */}
              <div className="mb-6">
                <JsonLdPreview report={report} />
              </div>

              <PublishButton 
                report={report as NewsReport}
                onSuccess={handlePublishSuccess}
                isPublishing={isPublishing}
                onPublishingChange={setIsPublishing}
              />
            </div>
          )}
        </div>

        {/* Success Modal */}
        {publishedUAL && (
          <SuccessModal ual={publishedUAL} onClose={handleReset} />
        )}
      </div>
    </main>
  )
}

