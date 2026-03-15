import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Seed API - Create sample event data for demo
 * v2 - Updated schema
 */
export async function POST() {
  try {
    // Create event
    const event = await db.event.upsert({
      where: { id: 'main-event' },
      update: {},
      create: {
        id: 'main-event',
        name: 'Tech Summit Indonesia 2025',
        description: 'Konferensi teknologi terbesar di Indonesia dengan menghadirkan para pakar industri dari berbagai bidang. Temukan inspirasi, jaringan profesional, dan wawasan terbaru tentang dunia teknologi.',
        tagline: 'Innovate. Connect. Transform.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'Jakarta Convention Center, Hall A',
        organizer: 'Goopps Indonesia',
        website: 'https://goopps.id',
        primaryColor: '#10b981',
        secondaryColor: '#0d9488',
        instagram: 'https://instagram.com/goopps.id',
        twitter: 'https://twitter.com/goopps_id',
        linkedin: 'https://linkedin.com/company/goopps',
        isActive: true,
      }
    })

    // Create announcements
    await db.announcement.createMany({
      data: [
        {
          eventId: event.id,
          title: 'Early Bird Registration Extended!',
          content: 'Pendaftaran early bird diperpanjang hingga 31 Januari 2025. Segera daftar untuk mendapatkan harga spesial!',
          type: 'important',
          priority: 10,
          isPinned: true,
          showOnLanding: true,
        },
        {
          eventId: event.id,
          title: 'Speaker Lineup Announced',
          content: 'Kami dengan bangga mengumumkan daftar speaker yang akan hadir di Tech Summit 2025. Dari startup unicorn hingga perusahaan Fortune 500.',
          type: 'update',
          priority: 5,
          isPinned: false,
          showOnLanding: true,
        },
        {
          eventId: event.id,
          title: 'Workshop Sessions Available',
          content: 'Tersedia 10 sesi workshop dengan berbagai topik: AI/ML, Cloud Computing, Web Development, dan Mobile Apps. Kuota terbatas!',
          type: 'info',
          priority: 3,
          isPinned: false,
          showOnLanding: true,
        },
      ],
      skipDuplicates: true
    })

    // Create schedules
    const scheduleDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    await db.schedule.createMany({
      data: [
        {
          eventId: event.id,
          title: 'Registration & Welcome Coffee',
          startTime: new Date(scheduleDate.setHours(8, 0, 0, 0)),
          endTime: new Date(scheduleDate.setHours(9, 0, 0, 0)),
          location: 'Main Lobby',
          category: 'Registration',
          order: 1,
        },
        {
          eventId: event.id,
          title: 'Opening Keynote: The Future of Tech',
          description: 'Pembukaan acara dengan keynote dari CEO tech company terkemuka Indonesia.',
          startTime: new Date(scheduleDate.setHours(9, 0, 0, 0)),
          endTime: new Date(scheduleDate.setHours(10, 0, 0, 0)),
          location: 'Main Hall',
          speaker: 'Budi Santoso',
          speakerTitle: 'CEO, TechCorp Indonesia',
          category: 'Keynote',
          order: 2,
        },
        {
          eventId: event.id,
          title: 'Panel Discussion: AI in Business',
          description: 'Diskusi panel tentang implementasi AI dalam dunia bisnis dengan para praktisi.',
          startTime: new Date(scheduleDate.setHours(10, 15, 0, 0)),
          endTime: new Date(scheduleDate.setHours(11, 15, 0, 0)),
          location: 'Main Hall',
          speaker: 'Multiple Speakers',
          category: 'Panel',
          order: 3,
        },
        {
          eventId: event.id,
          title: 'Coffee Break & Networking',
          startTime: new Date(scheduleDate.setHours(11, 15, 0, 0)),
          endTime: new Date(scheduleDate.setHours(11, 45, 0, 0)),
          location: 'Networking Area',
          category: 'Break',
          order: 4,
        },
        {
          eventId: event.id,
          title: 'Workshop: Building with AI',
          description: 'Workshop hands-on membangun aplikasi dengan teknologi AI.',
          startTime: new Date(scheduleDate.setHours(11, 45, 0, 0)),
          endTime: new Date(scheduleDate.setHours(13, 0, 0, 0)),
          location: 'Workshop Room A',
          speaker: 'Dewi Lestari',
          speakerTitle: 'AI Engineer, StartUp AI',
          category: 'Workshop',
          order: 5,
        },
        {
          eventId: event.id,
          title: 'Lunch Break',
          startTime: new Date(scheduleDate.setHours(13, 0, 0, 0)),
          endTime: new Date(scheduleDate.setHours(14, 0, 0, 0)),
          location: 'Dining Hall',
          category: 'Break',
          order: 6,
        },
        {
          eventId: event.id,
          title: 'Tech Talk: Cloud Architecture',
          description: 'Best practices dalam membangun arsitektur cloud yang scalable.',
          startTime: new Date(scheduleDate.setHours(14, 0, 0, 0)),
          endTime: new Date(scheduleDate.setHours(14, 45, 0, 0)),
          location: 'Main Hall',
          speaker: 'Ahmad Rizky',
          speakerTitle: 'Cloud Architect, CloudPrime',
          category: 'Tech Talk',
          order: 7,
        },
        {
          eventId: event.id,
          title: 'Closing & Prize Draw',
          description: 'Penutupan acara dengan pengundian doorprize dan sertifikat.',
          startTime: new Date(scheduleDate.setHours(17, 0, 0, 0)),
          endTime: new Date(scheduleDate.setHours(18, 0, 0, 0)),
          location: 'Main Hall',
          category: 'Closing',
          order: 8,
        },
      ],
      skipDuplicates: true
    })

    // Create sponsors
    await db.sponsor.createMany({
      data: [
        {
          eventId: event.id,
          name: 'TechCorp Indonesia',
          website: 'https://techcorp.id',
          tier: 'platinum',
          order: 1,
        },
        {
          eventId: event.id,
          name: 'CloudPrime',
          website: 'https://cloudprime.id',
          tier: 'gold',
          order: 1,
        },
        {
          eventId: event.id,
          name: 'StartUp AI',
          website: 'https://startupai.id',
          tier: 'gold',
          order: 2,
        },
        {
          eventId: event.id,
          name: 'DevTools Pro',
          website: 'https://devtools.pro',
          tier: 'silver',
          order: 1,
        },
        {
          eventId: event.id,
          name: 'CodeCamp',
          website: 'https://codecamp.id',
          tier: 'silver',
          order: 2,
        },
        {
          eventId: event.id,
          name: 'Digital Studio',
          tier: 'partner',
          order: 1,
        },
      ],
      skipDuplicates: true
    })

    // Create menu categories
    const foodCategory = await db.menuCategory.upsert({
      where: { id: 'food-cat' },
      update: {},
      create: {
        id: 'food-cat',
        eventId: event.id,
        name: 'Food',
        description: 'Makanan utama',
        maxClaimsPerParticipant: 2,
      }
    })

    const drinkCategory = await db.menuCategory.upsert({
      where: { id: 'drink-cat' },
      update: {},
      create: {
        id: 'drink-cat',
        eventId: event.id,
        name: 'Drink',
        description: 'Minuman',
        maxClaimsPerParticipant: 1,
      }
    })

    // Create menu items
    await db.menuItem.createMany({
      data: [
        {
          eventId: event.id,
          categoryId: foodCategory.id,
          name: 'Nasi Goreng Spesial',
          description: 'Nasi goreng dengan telur dan ayam',
          initialStock: 1000,
          currentStock: 1000,
        },
        {
          eventId: event.id,
          categoryId: foodCategory.id,
          name: 'Mie Goreng',
          description: 'Mie goreng dengan sayuran',
          initialStock: 800,
          currentStock: 800,
        },
        {
          eventId: event.id,
          categoryId: foodCategory.id,
          name: 'Ayam Bakar',
          description: 'Ayam bakar dengan sambal',
          initialStock: 500,
          currentStock: 500,
        },
        {
          eventId: event.id,
          categoryId: drinkCategory.id,
          name: 'Es Teh Manis',
          description: 'Teh manis dingin',
          initialStock: 2000,
          currentStock: 2000,
        },
        {
          eventId: event.id,
          categoryId: drinkCategory.id,
          name: 'Kopi',
          description: 'Kopi hitam/susu',
          initialStock: 1500,
          currentStock: 1500,
        },
      ],
      skipDuplicates: true
    })

    // Create booths
    await db.booth.createMany({
      data: [
        {
          eventId: event.id,
          name: 'Food Booth 1',
          boothType: 'food',
          boothNumber: 1,
          allowedCategory: 'Food',
        },
        {
          eventId: event.id,
          name: 'Food Booth 2',
          boothType: 'food',
          boothNumber: 2,
          allowedCategory: 'Food',
        },
        {
          eventId: event.id,
          name: 'Food Booth 3',
          boothType: 'food',
          boothNumber: 3,
          allowedCategory: 'Food',
        },
        {
          eventId: event.id,
          name: 'Food Booth 4',
          boothType: 'food',
          boothNumber: 4,
          allowedCategory: 'Food',
        },
        {
          eventId: event.id,
          name: 'Drink Booth 1',
          boothType: 'drink',
          boothNumber: 1,
          allowedCategory: 'Drink',
        },
        {
          eventId: event.id,
          name: 'Drink Booth 2',
          boothType: 'drink',
          boothNumber: 2,
          allowedCategory: 'Drink',
        },
      ],
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      data: {
        event: event.name,
        schedules: 8,
        announcements: 3,
        sponsors: 6,
        menuItems: 5,
        booths: 6,
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
