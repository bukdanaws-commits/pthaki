import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Display Queue API - Realtime welcome screen data
 * 
 * GET /api/display/queue - Get pending queue items
 * POST /api/display/queue - Add to queue (triggered by check-in)
 * DELETE /api/display/queue - Cleanup expired items
 */

// GET - Get display queue
export async function GET(request: NextRequest) {
  try {
    const eventId = 'main-event'
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get pending items not yet displayed and not expired
    const queue = await db.displayQueue.findMany({
      where: {
        eventId,
        isDisplayed: false,
        expiresAt: { gte: new Date().toISOString() },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    
    return NextResponse.json({
      success: true,
      data: queue,
    })
  } catch (error) {
    console.error('Get display queue error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get display queue' },
      { status: 500 }
    )
  }
}

// POST - Mark as displayed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queueId } = body
    
    if (!queueId) {
      return NextResponse.json(
        { success: false, error: 'Queue ID is required' },
        { status: 400 }
      )
    }
    
    // Mark as displayed
    await db.displayQueue.update({
      where: { id: queueId },
      data: {
        isDisplayed: true,
        displayedAt: new Date(),
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Marked as displayed',
    })
  } catch (error) {
    console.error('Update display queue error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update display queue' },
      { status: 500 }
    )
  }
}

// DELETE - Cleanup expired items
export async function DELETE(request: NextRequest) {
  try {
    const eventId = 'main-event'
    
    // Delete expired or displayed items
    const result = await db.displayQueue.deleteMany({
      where: {
        eventId,
        OR: [
          { expiresAt: { lt: new Date().toISOString() } },
          { isDisplayed: true },
        ],
      },
    })
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} items`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Cleanup display queue error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup display queue' },
      { status: 500 }
    )
  }
}
