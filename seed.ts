import { db } from './src/lib/db'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('🌱 Seeding database...')

  // Create Event
  const event = await db.event.upsert({
    where: { id: 'main-event' },
    update: {},
    create: {
      id: 'main-event',
      name: 'Annual Gathering 2025',
      description: 'Company Annual Gathering Event',
      date: new Date('2025-03-15'),
      location: 'Grand Ballroom, Hotel Mulia',
      isActive: true,
    },
  })
  console.log('✅ Created event:', event.name)

  // Create Menu Categories
  const foodCategory = await db.menuCategory.upsert({
    where: { id: 'cat-food' },
    update: {},
    create: {
      id: 'cat-food',
      name: 'Food',
      description: 'Food items',
    },
  })

  const drinkCategory = await db.menuCategory.upsert({
    where: { id: 'cat-drink' },
    update: {},
    create: {
      id: 'cat-drink',
      name: 'Drink',
      description: 'Beverage items',
    },
  })
  console.log('✅ Created categories')

  // Create Menu Items
  const menuItems = await Promise.all([
    db.menuItem.upsert({
      where: { id: 'menu-1' },
      update: {},
      create: {
        id: 'menu-1',
        eventId: 'main-event',
        categoryId: 'cat-food',
        name: 'Nasi Padang',
        description: 'Traditional Padang rice with various dishes',
        initialStock: 500,
        currentStock: 500,
        isActive: true,
      },
    }),
    db.menuItem.upsert({
      where: { id: 'menu-2' },
      update: {},
      create: {
        id: 'menu-2',
        eventId: 'main-event',
        categoryId: 'cat-food',
        name: 'Snack Box',
        description: 'Assorted snacks in a box',
        initialStock: 600,
        currentStock: 600,
        isActive: true,
      },
    }),
    db.menuItem.upsert({
      where: { id: 'menu-3' },
      update: {},
      create: {
        id: 'menu-3',
        eventId: 'main-event',
        categoryId: 'cat-drink',
        name: 'Coffee',
        description: 'Fresh brewed coffee',
        initialStock: 400,
        currentStock: 400,
        isActive: true,
      },
    }),
    db.menuItem.upsert({
      where: { id: 'menu-4' },
      update: {},
      create: {
        id: 'menu-4',
        eventId: 'main-event',
        categoryId: 'cat-drink',
        name: 'Tea',
        description: 'Premium tea selection',
        initialStock: 400,
        currentStock: 400,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Created', menuItems.length, 'menu items')

  // Create Booths
  const booths = await Promise.all([
    // Food Booths
    db.booth.upsert({
      where: { id: 'booth-food-1' },
      update: {},
      create: {
        id: 'booth-food-1',
        eventId: 'main-event',
        name: 'Food Booth 1',
        boothType: 'food',
        boothNumber: 1,
        isActive: true,
      },
    }),
    db.booth.upsert({
      where: { id: 'booth-food-2' },
      update: {},
      create: {
        id: 'booth-food-2',
        eventId: 'main-event',
        name: 'Food Booth 2',
        boothType: 'food',
        boothNumber: 2,
        isActive: true,
      },
    }),
    db.booth.upsert({
      where: { id: 'booth-food-3' },
      update: {},
      create: {
        id: 'booth-food-3',
        eventId: 'main-event',
        name: 'Food Booth 3',
        boothType: 'food',
        boothNumber: 3,
        isActive: true,
      },
    }),
    db.booth.upsert({
      where: { id: 'booth-food-4' },
      update: {},
      create: {
        id: 'booth-food-4',
        eventId: 'main-event',
        name: 'Food Booth 4',
        boothType: 'food',
        boothNumber: 4,
        isActive: true,
      },
    }),
    // Drink Booths
    db.booth.upsert({
      where: { id: 'booth-drink-1' },
      update: {},
      create: {
        id: 'booth-drink-1',
        eventId: 'main-event',
        name: 'Drink Booth 1',
        boothType: 'drink',
        boothNumber: 1,
        isActive: true,
      },
    }),
    db.booth.upsert({
      where: { id: 'booth-drink-2' },
      update: {},
      create: {
        id: 'booth-drink-2',
        eventId: 'main-event',
        name: 'Drink Booth 2',
        boothType: 'drink',
        boothNumber: 2,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Created', booths.length, 'booths')

  // Create sample participants (optional - for testing)
  const sampleParticipants = [
    { name: 'John Doe', email: 'john@example.com', phone: '+62 812 0001 0001', company: 'PT ABC' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+62 812 0001 0002', company: 'PT XYZ' },
    { name: 'Ahmad Rizki', email: 'ahmad@example.com', phone: '+62 812 0001 0003', company: 'CV Maju Jaya' },
    { name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '+62 812 0001 0004', company: 'PT Sukses Mandiri' },
    { name: 'Budi Santoso', email: 'budi@example.com', phone: '+62 812 0001 0005', company: 'PT Digital Indo' },
  ]

  for (const p of sampleParticipants) {
    const existingParticipant = await db.participant.findFirst({
      where: { email: p.email, eventId: 'main-event' }
    })
    
    if (!existingParticipant) {
      const qrCode = `EVT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
      await db.participant.create({
        data: {
          eventId: 'main-event',
          name: p.name,
          email: p.email,
          phone: p.phone,
          company: p.company,
          qrCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCode}`,
        },
      })
    }
  }
  console.log('✅ Created sample participants')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
