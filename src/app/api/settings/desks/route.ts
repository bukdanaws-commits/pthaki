import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Desk Settings API
 * 
 * GET /api/settings/desks - Get desk settings
 * PUT /api/settings/desks - Update desk settings
 */

// GET - Get desk settings
export async function GET() {
  try {
    const settings = await db.setting.findMany()
    
    // Parse settings into object
    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })
    
    return NextResponse.json({
      success: true,
      data: {
        totalDesks: parseInt(settingsMap['totalDesks'] || '4'),
      },
    })
  } catch (error) {
    console.error('Get desk settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get desk settings' },
      { status: 500 }
    )
  }
}

// PUT - Update desk settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { totalDesks } = body
    
    // Validate
    const desks = Math.min(20, Math.max(1, parseInt(totalDesks) || 4))
    
    // Upsert setting
    await db.setting.upsert({
      where: { key: 'totalDesks' },
      create: { 
        key: 'totalDesks', 
        value: String(desks),
        description: 'Total number of check-in desks'
      },
      update: { value: String(desks) },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Desk settings updated successfully',
      data: {
        totalDesks: desks,
      },
    })
  } catch (error) {
    console.error('Update desk settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update desk settings' },
      { status: 500 }
    )
  }
}
