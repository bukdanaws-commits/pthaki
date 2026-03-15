import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { claimSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = claimSchema.parse(body)
    
    // Find participant by QR code
    const participant = await db.participant.findFirst({
      where: {
        qrCode: validatedData.qrCode,
        eventId: 'main-event',
      },
    })
    
    if (!participant) {
      // Log failed scan
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          scanType: 'claim',
          scanResult: 'invalid_qr',
          message: 'Invalid QR code',
          boothId: validatedData.boothId,
        },
      })
      
      return NextResponse.json(
        { success: false, error: 'Invalid QR code. Participant not found.' },
        { status: 404 }
      )
    }
    
    // Check if participant is checked in
    if (!participant.isCheckedIn) {
      return NextResponse.json(
        { success: false, error: 'Participant has not checked in yet.' },
        { status: 400 }
      )
    }
    
    // Find menu item
    const menuItem = await db.menuItem.findUnique({
      where: { id: validatedData.menuItemId },
      include: { category: true },
    })
    
    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found.' },
        { status: 404 }
      )
    }
    
    // Check stock
    if (menuItem.currentStock <= 0) {
      return NextResponse.json(
        { success: false, error: `${menuItem.name} is out of stock.` },
        { status: 400 }
      )
    }
    
    // Find booth
    const booth = await db.booth.findUnique({
      where: { id: validatedData.boothId },
    })
    
    if (!booth) {
      return NextResponse.json(
        { success: false, error: 'Booth not found.' },
        { status: 404 }
      )
    }
    
    // Check booth type matches menu item category
    const isFoodItem = menuItem.category.name.toLowerCase() === 'food'
    const isDrinkItem = menuItem.category.name.toLowerCase() === 'drink'
    
    if (isFoodItem && booth.boothType !== 'food') {
      return NextResponse.json(
        { success: false, error: 'This booth only serves drinks.' },
        { status: 400 }
      )
    }
    
    if (isDrinkItem && booth.boothType !== 'drink') {
      return NextResponse.json(
        { success: false, error: 'This booth only serves food.' },
        { status: 400 }
      )
    }
    
    // Check claim limits
    if (isFoodItem && participant.foodClaims >= participant.maxFoodClaims) {
      // Log limit reached
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          participantId: participant.id,
          scanType: 'claim',
          scanResult: 'limit_reached',
          message: `Food claim limit reached (${participant.foodClaims}/${participant.maxFoodClaims})`,
          boothId: booth.id,
        },
      })
      
      return NextResponse.json({
        success: false,
        error: `Food claim limit reached. You have already claimed ${participant.maxFoodClaims} food items.`,
        remainingFoodClaims: 0,
        remainingDrinkClaims: participant.maxDrinkClaims - participant.drinkClaims,
      })
    }
    
    if (isDrinkItem && participant.drinkClaims >= participant.maxDrinkClaims) {
      // Log limit reached
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          participantId: participant.id,
          scanType: 'claim',
          scanResult: 'limit_reached',
          message: `Drink claim limit reached (${participant.drinkClaims}/${participant.maxDrinkClaims})`,
          boothId: booth.id,
        },
      })
      
      return NextResponse.json({
        success: false,
        error: `Drink claim limit reached. You have already claimed ${participant.maxDrinkClaims} drink items.`,
        remainingFoodClaims: participant.maxFoodClaims - participant.foodClaims,
        remainingDrinkClaims: 0,
      })
    }
    
    // Process claim using transaction
    const result = await db.$transaction(async (tx) => {
      // Update participant claim count
      const updatedParticipant = await tx.participant.update({
        where: { id: participant.id },
        data: {
          foodClaims: isFoodItem ? { increment: 1 } : undefined,
          drinkClaims: isDrinkItem ? { increment: 1 } : undefined,
        },
      })
      
      // Update menu item stock
      await tx.menuItem.update({
        where: { id: menuItem.id },
        data: {
          currentStock: { decrement: 1 },
        },
      })
      
      // Create claim record
      const claim = await tx.claim.create({
        data: {
          eventId: 'main-event',
          participantId: participant.id,
          menuItemId: menuItem.id,
          boothId: booth.id,
        },
      })
      
      // Log successful scan
      await tx.scanLog.create({
        data: {
          eventId: 'main-event',
          participantId: participant.id,
          scanType: 'claim',
          scanResult: 'success',
          message: `Claimed ${menuItem.name} at ${booth.name}`,
          boothId: booth.id,
          claimId: claim.id,
        },
      })
      
      return updatedParticipant
    })
    
    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${menuItem.name}!`,
      participant: {
        id: result.id,
        name: result.name,
        foodClaims: result.foodClaims,
        drinkClaims: result.drinkClaims,
        remainingFoodClaims: result.maxFoodClaims - result.foodClaims,
        remainingDrinkClaims: result.maxDrinkClaims - result.drinkClaims,
      },
      menuItem: {
        id: menuItem.id,
        name: menuItem.name,
        category: menuItem.category.name,
      },
    })
  } catch (error) {
    console.error('Claim error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to process claim' },
      { status: 500 }
    )
  }
}
