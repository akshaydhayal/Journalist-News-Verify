'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

interface NewsFormProps {
  onSubmit: (headline: string, description: string) => void
  initialHeadline?: string
  initialDescription?: string
}

export function NewsForm({ onSubmit, initialHeadline, initialDescription }: NewsFormProps) {
  const [headline, setHeadline] = useState(initialHeadline || '')
  const [description, setDescription] = useState(initialDescription || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (headline.trim() && description.trim()) {
      onSubmit(headline.trim(), description.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Headline *
        </label>
        <input
          type="text"
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Enter a clear, concise headline for your report"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          required
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">{headline.length}/200 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a detailed description of what you witnessed. Include relevant context, time, and any important details."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
          required
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/2000 characters</p>
      </div>

      <button
        type="submit"
        disabled={!headline.trim() || !description.trim()}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Continue to Review
      </button>
    </form>
  )
}

