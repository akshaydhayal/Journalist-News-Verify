// API route for fetching published news reports

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsReport from '@/models/NewsReport';

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection unavailable',
        news: [],
      }, { status: 503 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search') || '';
    
    // Build query
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    
    // Fetch news reports
    const news = await NewsReport.find(query)
      .sort({ publishedAt: -1 }) // Most recent first
      .limit(limit)
      .skip(skip)
      .lean();
    
    // Get total count for pagination
    const total = await NewsReport.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      news,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error',
        news: [],
      },
      { status: 500 }
    );
  }
}

