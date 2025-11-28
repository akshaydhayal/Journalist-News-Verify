'use client'

import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaUploaderProps {
  onMediaSelected: (files: File[]) => void
}

export function MediaUploader({ onMediaSelected }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previews, setPreviews] = useState<Array<{ file: File; preview: string }>>([])

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )

    const newPreviews = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setPreviews(prev => [...prev, ...newPreviews])
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removePreview = (index: number) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleContinue = () => {
    if (previews.length > 0) {
      onMediaSelected(previews.map(p => p.file))
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">
          Drag and drop your media files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supports images and videos (JPG, PNG, MP4, etc.)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                {preview.file.type.startsWith('image/') ? (
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={preview.preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <button
                  onClick={() => removePreview(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {preview.file.type.startsWith('image/') ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                  {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleContinue}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue with {previews.length} file{previews.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}

