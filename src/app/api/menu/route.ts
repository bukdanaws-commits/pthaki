import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all menu items
export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        categoryId: 'asc',
      },
    })
    
    // Get categories separately
    const categoryIds = [...new Set(menuItems.map(m => m.categoryId).filter(Boolean))]
    const categories = await Promise.all(
      categoryIds.map(id => db.menuCategory.findFirst({ where: { id } }))
    )
    const categoryMap = new Map(categories.filter(Boolean).map(c => [c!.id, c!]))
    
    // Combine data
    const enrichedItems = menuItems.map(item => ({
      ...item,
      category: categoryMap.get(item.categoryId!) || null,
    }))
    
    return NextResponse.json({
      success: true,
      data: enrichedItems,
    })
  } catch (error) {
    console.error('Get menu items error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get menu items' },
      { status: 500 }
    )
  }
}

// Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Find or create category
    let category = await db.menuCategory.findFirst({
      where: {
        name: body.category,
      },
    })
    
    if (!category) {
      category = await db.menuCategory.create({
        data: {
          name: body.category,
          description: body.category === 'Food' ? 'Food items' : 'Drink items',
        },
      })
    }
    
    const menuItem = await db.menuItem.create({
      data: {
        eventId: 'main-event',
        categoryId: category.id,
        name: body.name,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        initialStock: body.initialStock,
        currentStock: body.initialStock,
        isActive: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...menuItem,
        category: category,
      },
      message: 'Menu item created successfully',
    })
  } catch (error) {
    console.error('Create menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
