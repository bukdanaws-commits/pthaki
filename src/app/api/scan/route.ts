import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Unified Scanner API - Single optimized endpoint for all QR scanning operations
 * 
 * POST /api/scan
 * Body: { qrCode: string, action: 'checkin' | 'food_claim' | 'drink_claim', targetId: string }
 * 
 * Response time target: < 100ms
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let participant: any = null
  let scanLogData: any = {
    scanType: '',
    scanResult: '',
    message: '',
  }

  try {
    const body = await request.json()
    const { qrCode, action, targetId, deviceName, operatorId } = body

    // Validate input
    if (!qrCode || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: qrCode, action',
        responseTime: Date.now() - startTime,
      }, { status: 400 })
    }

    const validActions = ['checkin', 'food_claim', 'drink_claim']
    if (!validActions.includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be: checkin, food_claim, or drink_claim',
        responseTime: Date.now() - startTime,
      }, { status: 400 })
    }

    // ========================================
    // STEP 1: Find participant by QR code
    // ========================================
    participant = await db.participant.findUnique({
      where: { qrCode },
      include: {
        event: true,
      },
    })

    if (!participant) {
      // Log failed scan
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          scanType: action,
          scanResult: 'invalid_qr',
          message: 'Participant not found',
          deviceName,
          operatorId,
        },
      })

      return NextResponse.json({
        success: false,
        error: 'Peserta tidak ditemukan',
        errorCode: 'INVALID_QR',
        responseTime: Date.now() - startTime,
      }, { status: 404 })
    }

    scanLogData.participantId = participant.id
    scanLogData.eventId = participant.eventId
    scanLogData.scanType = action
    scanLogData.deviceName = deviceName
    scanLogData.operatorId = operatorId

    // ========================================
    // STEP 2: Process based on action type
    // ========================================
    
    if (action === 'checkin') {
      return await processCheckIn(participant, targetId, scanLogData, startTime)
    } else {
      return await processClaim(participant, action, targetId, scanLogData, startTime)
    }

  } catch (error) {
    console.error('Scan error:', error)
    
    // Log error
    if (scanLogData.eventId) {
      await db.scanLog.create({
        data: {
          ...scanLogData,
          scanResult: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(console.error)
    }

    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan sistem',
      errorCode: 'SYSTEM_ERROR',
      responseTime: Date.now() - startTime,
    }, { status: 500 })
  }
}

// ========================================
// CHECK-IN PROCESSOR
// ========================================
async function processCheckIn(
  participant: any,
  deskNumber: string | undefined,
  scanLogData: any,
  startTime: number
) {
  const desk = parseInt(deskNumber || '1')
  
  // Check if already checked in
  if (participant.isCheckedIn) {
    // Get existing check-in info
    const existingCheckIn = await db.checkIn.findUnique({
      where: { participantId: participant.id },
    })

    await db.scanLog.create({
      data: {
        ...scanLogData,
        scanResult: 'duplicate',
        message: 'Already checked in',
        deskNumber: desk,
      },
    })

    return NextResponse.json({
      success: false,
      error: 'Peserta sudah check-in',
      errorCode: 'ALREADY_CHECKED_IN',
      participant: {
        id: participant.id,
        name: participant.name,
        company: participant.company,
        email: participant.email,
        photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
        checkedInAt: existingCheckIn?.checkedInAt,
        deskNumber: existingCheckIn?.deskNumber,
      },
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Atomic transaction: Check-in + Display Queue + Stats Update
  const result = await db.$transaction(async (tx) => {
    // 1. Create check-in record
    const checkIn = await tx.checkIn.create({
      data: {
        eventId: participant.eventId,
        participantId: participant.id,
        deskNumber: desk,
        deviceName: scanLogData.deviceName,
        operatorId: scanLogData.operatorId,
      },
    })

    // 2. Update participant status
    await tx.participant.update({
      where: { id: participant.id },
      data: {
        isCheckedIn: true,
        checkInTime: new Date(),
        checkInDesk: desk,
      },
    })

    // 3. Add to display queue (for welcome screen)
    const expiresAt = new Date(Date.now() + 30000) // 30 seconds
    await tx.displayQueue.create({
      data: {
        eventId: participant.eventId,
        participantId: participant.id,
        name: participant.name,
        company: participant.company,
        photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
        expiresAt,
      },
    })

    // 4. Update event stats - get current and increment
    const currentStats = await db.eventStats.findUnique({ 
      where: { eventId: participant.eventId } 
    })
    
    const statsUpdate: any = {
      totalCheckIns: (currentStats?.totalCheckIns || 0) + 1,
      totalNotCheckedIn: Math.max(0, (currentStats?.totalNotCheckedIn || 0) - 1),
      desk1CheckIns: (currentStats?.desk1CheckIns || 0) + (desk === 1 ? 1 : 0),
      desk2CheckIns: (currentStats?.desk2CheckIns || 0) + (desk === 2 ? 1 : 0),
      desk3CheckIns: (currentStats?.desk3CheckIns || 0) + (desk === 3 ? 1 : 0),
      desk4CheckIns: (currentStats?.desk4CheckIns || 0) + (desk === 4 ? 1 : 0),
    }

    await db.eventStats.upsert({
      where: { eventId: participant.eventId },
      update: statsUpdate,
      create: {
        eventId: participant.eventId,
        totalCheckIns: 1,
        totalNotCheckedIn: 0,
        ...statsUpdate,
      },
    })

    return checkIn
  })

  // 5. Create scan log (after transaction)
  await db.scanLog.create({
    data: {
      ...scanLogData,
      scanResult: 'success',
      message: 'Check-in successful',
      deskNumber: desk,
      checkInId: result.id,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Check-in berhasil!',
    participant: {
      id: participant.id,
      name: participant.name,
      company: participant.company,
      email: participant.email,
      phone: participant.phone,
      photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
      qrCode: participant.qrCode,
    },
    checkIn: {
      deskNumber: desk,
      checkedInAt: result.checkedInAt,
    },
    responseTime: Date.now() - startTime,
  })
}

// ========================================
// CLAIM PROCESSOR
// ========================================
async function processClaim(
  participant: any,
  action: 'food_claim' | 'drink_claim',
  targetId: string | undefined, // boothId
  scanLogData: any,
  startTime: number
) {
  const category = action === 'food_claim' ? 'Food' : 'Drink'
  
  // Check if participant has checked in
  if (!participant.isCheckedIn) {
    await db.scanLog.create({
      data: {
        ...scanLogData,
        scanResult: 'not_checked_in',
        message: 'Participant has not checked in',
      },
    })

    return NextResponse.json({
      success: false,
      error: 'Peserta belum check-in',
      errorCode: 'NOT_CHECKED_IN',
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Check claim limits
  const currentClaims = action === 'food_claim' ? participant.foodClaims : participant.drinkClaims
  const maxClaims = action === 'food_claim' ? participant.maxFoodClaims : participant.maxDrinkClaims
  
  if (currentClaims >= maxClaims) {
    await db.scanLog.create({
      data: {
        ...scanLogData,
        scanResult: 'limit_reached',
        message: `${category} claim limit reached (${currentClaims}/${maxClaims})`,
      },
    })

    return NextResponse.json({
      success: false,
      error: `Kuota klaim ${category === 'Food' ? 'makanan' : 'minuman'} sudah habis (${currentClaims}/${maxClaims})`,
      errorCode: 'LIMIT_REACHED',
      participant: {
        id: participant.id,
        name: participant.name,
        foodClaims: participant.foodClaims,
        drinkClaims: participant.drinkClaims,
        maxFoodClaims: participant.maxFoodClaims,
        maxDrinkClaims: participant.maxDrinkClaims,
        remainingFoodClaims: participant.maxFoodClaims - participant.foodClaims,
        remainingDrinkClaims: participant.maxDrinkClaims - participant.drinkClaims,
      },
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Validate booth
  if (!targetId) {
    return NextResponse.json({
      success: false,
      error: 'Missing targetId (boothId)',
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Find booth
  const booth = await db.booth.findUnique({
    where: { id: targetId },
  })

  if (!booth || booth.boothType.toLowerCase() !== category.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: `Booth tidak valid untuk kategori ${category}`,
      errorCode: 'INVALID_BOOTH',
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Find available menu item for this category
  const categoryRecord = await db.menuCategory.findFirst({
    where: {
      eventId: participant.eventId,
      name: category,
    },
  })

  if (!categoryRecord) {
    return NextResponse.json({
      success: false,
      error: `Kategori ${category} tidak ditemukan`,
      errorCode: 'CATEGORY_NOT_FOUND',
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  const menuItems = await db.menuItem.findMany({
    where: {
      eventId: participant.eventId,
      categoryId: categoryRecord.id,
      isActive: true,
      currentStock: { gt: 0 },
    },
  })

  if (menuItems.length === 0) {
    await db.scanLog.create({
      data: {
        ...scanLogData,
        scanResult: 'failed',
        message: `No ${category} items available`,
        boothId: booth.id,
      },
    })

    return NextResponse.json({
      success: false,
      error: 'Stok makanan/minuman habis',
      errorCode: 'OUT_OF_STOCK',
      responseTime: Date.now() - startTime,
    }, { status: 400 })
  }

  // Select first available menu item
  const menuItem = menuItems[0]

  // Atomic transaction: Claim + Update counters + Stats
  const result = await db.$transaction(async (tx) => {
    // 1. Create claim record
    const claim = await tx.claim.create({
      data: {
        eventId: participant.eventId,
        participantId: participant.id,
        menuItemId: menuItem.id,
        boothId: booth.id,
        category: category,
        deviceName: scanLogData.deviceName,
        operatorId: scanLogData.operatorId,
      },
    })

    // 2. Update participant counters (calculate new values)
    const participantUpdate: any = { lastClaimAt: new Date() }
    if (action === 'food_claim') {
      participantUpdate.foodClaims = (participant.foodClaims || 0) + 1
    }
    if (action === 'drink_claim') {
      participantUpdate.drinkClaims = (participant.drinkClaims || 0) + 1
    }
    
    await db.participant.update({
      where: { id: participant.id },
      data: participantUpdate,
    })

    // 3. Update menu item stock (calculate new values)
    await db.menuItem.update({
      where: { id: menuItem.id },
      data: {
        currentStock: Math.max(0, (menuItem.currentStock || 0) - 1),
        totalClaims: (menuItem.totalClaims || 0) + 1,
      },
    })

    // 4. Update booth stats
    await db.booth.update({
      where: { id: booth.id },
      data: {
        totalClaims: (booth.totalClaims || 0) + 1,
      },
    })

    // 5. Update event stats
    const currentStats = await db.eventStats.findUnique({ 
      where: { eventId: participant.eventId } 
    })
    
    const statsUpdate: any = {
      totalClaims: (currentStats?.totalClaims || 0) + 1,
      totalFoodClaims: (currentStats?.totalFoodClaims || 0) + (action === 'food_claim' ? 1 : 0),
      totalDrinkClaims: (currentStats?.totalDrinkClaims || 0) + (action === 'drink_claim' ? 1 : 0),
    }

    await db.eventStats.upsert({
      where: { eventId: participant.eventId },
      update: statsUpdate,
      create: {
        eventId: participant.eventId,
        totalClaims: 1,
        totalFoodClaims: action === 'food_claim' ? 1 : 0,
        totalDrinkClaims: action === 'drink_claim' ? 1 : 0,
      },
    })

    return claim
  })

  // 6. Create scan log
  await db.scanLog.create({
    data: {
      ...scanLogData,
      scanResult: 'success',
      message: `${category} claim successful: ${menuItem.name}`,
      boothId: booth.id,
      claimId: result.id,
    },
  })

  // Get updated participant
  const updatedParticipant = await db.participant.findUnique({
    where: { id: participant.id },
  })

  return NextResponse.json({
    success: true,
    message: `Klaim ${category === 'Food' ? 'makanan' : 'minuman'} berhasil!`,
    participant: {
      id: participant.id,
      name: participant.name,
      company: participant.company,
      foodClaims: updatedParticipant?.foodClaims || 0,
      drinkClaims: updatedParticipant?.drinkClaims || 0,
      maxFoodClaims: participant.maxFoodClaims,
      maxDrinkClaims: participant.maxDrinkClaims,
      remainingFoodClaims: participant.maxFoodClaims - (updatedParticipant?.foodClaims || 0),
      remainingDrinkClaims: participant.maxDrinkClaims - (updatedParticipant?.drinkClaims || 0),
    },
    claim: {
      menuItemName: menuItem.name,
      category: category,
      boothName: booth.name,
      claimedAt: result.claimedAt,
    },
    responseTime: Date.now() - startTime,
  })
}
