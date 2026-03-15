import { NextResponse } from 'next/server'
import { initializeStorageBuckets } from '@/lib/storage'

/**
 * Storage Initialization API
 * 
 * GET /api/storage/init - Initialize storage buckets
 */

export async function GET() {
  try {
    const results = await initializeStorageBuckets()
    
    return NextResponse.json({
      success: true,
      message: 'Storage buckets initialized',
      results,
    })
  } catch (error) {
    console.error('Storage init error:', error)
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 })
  }
}
