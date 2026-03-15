import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateMenuStockSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const menuItem = await db.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
    
    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error('Get menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get menu item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const validatedData = updateMenuStockSchema.parse(body)
    
    const menuItem = await db.menuItem.update({
      where: { id },
      data: {
        currentStock: validatedData.currentStock,
      },
      include: {
        category: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error('Update menu item error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.menuItem.delete({
      where: { id },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  } catch (error) {
    console.error('Delete menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
