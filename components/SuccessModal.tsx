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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-500/30 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            Published Successfully!
          </h2>
          <p className="text-slate-300">
            Your news report has been published to the OriginTrail DKG
          </p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-purple-500/20">
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Knowledge Asset UAL (Uniform Asset Locator)
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-slate-900/50 px-3 py-2 rounded-lg border border-purple-500/20 break-all text-slate-200">
              {ual}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(ual)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View on DKG Explorer
          </a>
          <button
            onClick={onClose}
            className="w-full bg-slate-700/50 text-slate-200 py-3 px-6 rounded-xl font-medium hover:bg-slate-600/50 transition-colors border border-purple-500/20"
          >
            Publish Another Report
          </button>
          <p className="text-xs text-slate-400 text-center">
            Share this UAL to allow others to verify your report on the DKG
          </p>
        </div>
      </div>
    </div>
  )
}

