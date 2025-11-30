// MongoDB model for News Reports

import mongoose, { Schema, Document } from 'mongoose';

export interface MediaItem {
  url: string;
  hash: string;
  type: 'image' | 'video';
}

export interface INewsReport extends Document {
  headline: string;
  ual: string;
  datasetRoot?: string;
  publishedAt: Date;
  reporterId?: string;
  description: string;
  mediaUrl: string; // Primary media URL (first one) - for backwards compatibility
  mediaHash: string; // Primary media hash (first one) - for backwards compatibility
  mediaItems: MediaItem[]; // All media items
  location: {
    latitude: number;
    longitude: number;
    displayName?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  journalist?: {
    name?: string;
    email?: string;
    organization?: string;
    contact?: string;
  };
  jsonld: any;
  createdAt: Date;
  updatedAt: Date;
}

const NewsReportSchema = new Schema<INewsReport>(
  {
    headline: {
      type: String,
      required: true,
      index: true,
    },
    ual: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    datasetRoot: {
      type: String,
    },
    publishedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reporterId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: false,
      default: '',
    },
    mediaHash: {
      type: String,
      required: false,
      default: '',
    },
    mediaItems: [{
      url: { type: String, required: true },
      hash: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], default: 'image' },
    }],
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      displayName: String,
      city: String,
      state: String,
      country: String,
    },
    journalist: {
      name: String,
      email: String,
      organization: String,
      contact: String,
    },
    jsonld: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
NewsReportSchema.index({ headline: 'text', description: 'text' }); // Text search
NewsReportSchema.index({ publishedAt: -1 }); // Most recent first
NewsReportSchema.index({ 'location.latitude': 1, 'location.longitude': 1 }); // Location queries

const NewsReport =
  mongoose.models.NewsReport ||
  mongoose.model<INewsReport>('NewsReport', NewsReportSchema);

export default NewsReport;


