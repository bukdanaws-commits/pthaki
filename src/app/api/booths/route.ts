import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all booths
export async function GET() {
  try {
    const booths = await db.booth.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        boothType: 'asc',
      },
    })
    
    return NextResponse.json({
      success: true,
      data: booths.map(booth => ({
        id: booth.id,
        name: booth.name,
        boothType: booth.boothType,
        boothNumber: booth.boothNumber,
        isActive: booth.isActive,
        claimsCount: booth.totalClaims || 0,
      })),
    })
  } catch (error) {
    console.error('Get booths error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get booths' },
      { status: 500 }
    )
  }
}

// Create new booth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const booth = await db.booth.create({
      data: {
        eventId: 'main-event',
        name: body.name,
        boothType: body.boothType,
        boothNumber: body.boothNumber,
        isActive: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: booth.id,
        name: booth.name,
        boothType: booth.boothType,
        boothNumber: booth.boothNumber,
        isActive: booth.isActive,
        claimsCount: 0,
      },
      message: 'Booth created successfully',
    })
  } catch (error) {
    console.error('Create booth error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booth' },
      { status: 500 }
    )
  }
}

// Update booth
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, boothType, boothNumber, isActive } = body
    
    const booth = await db.booth.update({
      where: { id },
      data: {
        name,
        boothType,
        boothNumber,
        isActive,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: booth,
      message: 'Booth updated successfully',
    })
  } catch (error) {
    console.error('Update booth error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booth' },
      { status: 500 }
    )
  }
}

// Delete booth
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booth ID is required' },
        { status: 400 }
      )
    }
    
    // Check if booth has claims
    const claimsCount = await db.claim.count({
      where: { boothId: id },
    })
    
    if (claimsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete booth with existing claims' },
        { status: 400 }
      )
    }
    
    await db.booth.delete({
      where: { id },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Booth deleted successfully',
    })
  } catch (error) {
    console.error('Delete booth error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booth' },
      { status: 500 }
    )
  }
}
