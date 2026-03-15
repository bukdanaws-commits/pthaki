import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Claim Settings API
 * 
 * GET /api/settings/claims - Get claim settings
 * PUT /api/settings/claims - Update claim settings
 */

// GET - Get claim settings
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
        maxFoodClaims: parseInt(settingsMap['maxFoodClaims'] || '2'),
        maxDrinkClaims: parseInt(settingsMap['maxDrinkClaims'] || '1'),
      },
    })
  } catch (error) {
    console.error('Get claim settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get claim settings' },
      { status: 500 }
    )
  }
}

// PUT - Update claim settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { maxFoodClaims, maxDrinkClaims } = body
    
    // Upsert settings
    if (maxFoodClaims !== undefined) {
      await db.setting.upsert({
        where: { key: 'maxFoodClaims' },
        create: { 
          key: 'maxFoodClaims', 
          value: String(maxFoodClaims),
          description: 'Maximum food claims per participant'
        },
        update: { value: String(maxFoodClaims) },
      })
    }
    
    if (maxDrinkClaims !== undefined) {
      await db.setting.upsert({
        where: { key: 'maxDrinkClaims' },
        create: { 
          key: 'maxDrinkClaims', 
          value: String(maxDrinkClaims),
          description: 'Maximum drink claims per participant'
        },
        update: { value: String(maxDrinkClaims) },
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Claim settings updated successfully',
      data: {
        maxFoodClaims: maxFoodClaims || 2,
        maxDrinkClaims: maxDrinkClaims || 1,
      },
    })
  } catch (error) {
    console.error('Update claim settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update claim settings' },
      { status: 500 }
    )
  }
}
