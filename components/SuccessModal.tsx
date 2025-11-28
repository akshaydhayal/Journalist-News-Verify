'use client'

import { CheckCircle2, Copy, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'

interface SuccessModalProps {
  ual: string
  onClose: () => void
}

export function SuccessModal({ ual, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ual)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Published Successfully!
          </h2>
          <p className="text-gray-600">
            Your news report has been published to the OriginTrail DKG
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Knowledge Asset UAL (Uniform Asset Locator)
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white px-3 py-2 rounded border border-gray-200 break-all">
              {ual}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Publish Another Report
          </button>
          <p className="text-xs text-gray-500 text-center">
            Share this UAL to allow others to verify your report on the DKG
          </p>
        </div>
      </div>
    </div>
  )
}

