import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Indonesian names for realistic mock data
const indonesianNames = [
  { name: 'Ahmad Wijaya', company: 'PT Harapan Kita Indonesia', position: 'Manager' },
  { name: 'Siti Rahayu', company: 'PT Maju Bersama', position: 'Supervisor' },
  { name: 'Budi Santoso', company: 'CV Teknologi Nusantara', position: 'Developer' },
  { name: 'Dewi Kusuma', company: 'PT Harapan Kita Indonesia', position: 'Designer' },
  { name: 'Rizki Pratama', company: 'PT Maju Bersama', position: 'Analyst' },
  { name: 'Putri Handayani', company: 'CV Teknologi Nusantara', position: 'HR Manager' },
  { name: 'Agus Setiawan', company: 'PT Harapan Kita Indonesia', position: 'Director' },
  { name: 'Rina Marlina', company: 'PT Maju Bersama', position: 'Marketing' },
  { name: 'Dian Purnama', company: 'CV Teknologi Nusantara', position: 'Engineer' },
  { name: 'Hendra Gunawan', company: 'PT Harapan Kita Indonesia', position: 'Finance' },
  { name: 'Lestari Wulandari', company: 'PT Maju Bersama', position: 'Accountant' },
  { name: 'Eko Prasetyo', company: 'CV Teknologi Nusantara', position: 'Consultant' },
  { name: 'Maya Sari', company: 'PT Harapan Kita Indonesia', position: 'Secretary' },
  { name: 'Fajar Nugroho', company: 'PT Maju Bersama', position: 'Technician' },
  { name: 'Anisa Putri', company: 'CV Teknologi Nusantara', position: 'QA Lead' },
  { name: 'Rudi Hermawan', company: 'PT Harapan Kita Indonesia', position: 'Sales' },
  { name: 'Indah Permata', company: 'PT Maju Bersama', position: 'Admin' },
  { name: 'Yoga Pratama', company: 'CV Teknologi Nusantara', position: 'PM' },
  { name: 'Silvia Anggraini', company: 'PT Harapan Kita Indonesia', position: 'UX Designer' },
  { name: 'Bayu Aditya', company: 'PT Maju Bersama', position: 'DevOps' },
]

// Food items (6+ types)
const foodItems = [
  { name: 'Nasi Padang Special', description: 'Nasi dengan rendang, ayam pop, dan sayur nangka', stock: 300 },
  { name: 'Nasi Goreng Seafood', description: 'Nasi goreng dengan udang, cumi, dan kerupuk', stock: 250 },
  { name: 'Bento Box Premium', description: 'Bento Jepang dengan chicken katsu, tamago, dan sayuran', stock: 200 },
  { name: 'Snack Box Mix', description: 'Kotak snack berbagai rasa: pisang goreng, risoles, lemper', stock: 400 },
  { name: 'Sate Ayam Madura', description: '10 tusuk sate ayam dengan bumbu kacang dan lontong', stock: 350 },
  { name: 'Mie Ayam Bakso Special', description: 'Mie ayam dengan bakso, pangsit, dan jamur', stock: 250 },
  { name: 'Salad Buah Yogurt', description: 'Salad buah segar dengan yogurt dan granola', stock: 150 },
]

// Drink items (3 types)
const drinkItems = [
  { name: 'Kopi Arabica Premium', description: 'Kopi arabica gayo segar, tersedia panas/dingin', stock: 400 },
  { name: 'Teh Herbal Pilihan', description: 'Teh herbal: chamomile, peppermint, atau rooibos', stock: 350 },
  { name: 'Jus Buah Segar', description: 'Pilihan: jeruk, alpukat, mangga, atau semangka', stock: 300 },
]

// Get placeholder image based on gender from name
function getPlaceholderImage(name: string, index: number): string {
  const isFemale = name.includes('Siti') || name.includes('Dewi') || name.includes('Putri') || 
                   name.includes('Rina') || name.includes('Dian') || name.includes('Lestari') || 
                   name.includes('Maya') || name.includes('Anisa') || name.includes('Indah') || 
                   name.includes('Silvia')
  
  const gender = isFemale ? 'woman' : 'man'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
}

async function main() {
  console.log('🌱 Seeding database...')
  console.log('=====================================\n')

  // 1. Create Event
  const event = await prisma.event.upsert({
    where: { id: 'main-event' },
    update: {},
    create: {
      id: 'main-event',
      name: 'Gathering PT HKI 2025',
      description: 'Annual company gathering event untuk seluruh karyawan PT Harapan Kita Indonesia dan partner bisnis',
      date: new Date('2025-09-20T08:00:00'),
      endDate: new Date('2025-09-20T17:00:00'),
      location: 'Grand Ballroom, Hotel Mulia Jakarta',
      isActive: true,
      tagline: 'Bersama Menuju Kesuksesan',
      organizer: 'PT Harapan Kita Indonesia',
      primaryColor: '#37517e',
      secondaryColor: '#47b2e4',
    },
  })
  console.log('✅ Event created:', event.name)

  // 2. Create Event Stats
  await prisma.eventStats.upsert({
    where: { eventId: event.id },
    update: {},
    create: {
      eventId: event.id,
    },
  })
  console.log('✅ Event stats initialized')

  // 3. Create Menu Categories
  let foodCategory = await prisma.menuCategory.findFirst({
    where: { eventId: event.id, name: 'Food' }
  })
  
  if (!foodCategory) {
    foodCategory = await prisma.menuCategory.create({
      data: {
        eventId: event.id,
        name: 'Food',
        description: 'Makanan untuk peserta event',
        maxClaimsPerParticipant: 2,
      },
    })
  }

  let drinkCategory = await prisma.menuCategory.findFirst({
    where: { eventId: event.id, name: 'Drink' }
  })
  
  if (!drinkCategory) {
    drinkCategory = await prisma.menuCategory.create({
      data: {
        eventId: event.id,
        name: 'Drink',
        description: 'Minuman untuk peserta event',
        maxClaimsPerParticipant: 1,
      },
    })
  }
  console.log('✅ Categories created: Food, Drink')

  // 4. Create Menu Items
  console.log('\n📦 Creating food items...')
  for (let i = 0; i < foodItems.length; i++) {
    const item = foodItems[i]
    
    await prisma.menuItem.upsert({
      where: { id: `menu-food-${i + 1}` },
      update: {
        description: item.description,
        initialStock: item.stock,
        currentStock: item.stock,
      },
      create: {
        id: `menu-food-${i + 1}`,
        eventId: event.id,
        categoryId: foodCategory.id,
        name: item.name,
        description: item.description,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=f0f0f0`,
        initialStock: item.stock,
        currentStock: item.stock,
        isActive: true,
      },
    })
    console.log(`  ✅ Food: ${item.name} (${item.stock} portions)`)
  }

  console.log('\n📦 Creating drink items...')
  for (let i = 0; i < drinkItems.length; i++) {
    const item = drinkItems[i]
    
    await prisma.menuItem.upsert({
      where: { id: `menu-drink-${i + 1}` },
      update: {
        description: item.description,
        initialStock: item.stock,
        currentStock: item.stock,
      },
      create: {
        id: `menu-drink-${i + 1}`,
        eventId: event.id,
        categoryId: drinkCategory.id,
        name: item.name,
        description: item.description,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=e0f7fa`,
        initialStock: item.stock,
        currentStock: item.stock,
        isActive: true,
      },
    })
    console.log(`  ✅ Drink: ${item.name} (${item.stock} servings)`)
  }

  // 5. Create Booths (4 Food + 2 Drink)
  console.log('\n🏪 Creating booths...')
  const booths = await Promise.all([
    prisma.booth.upsert({
      where: { id: 'booth-food-1' },
      update: {},
      create: {
        id: 'booth-food-1',
        eventId: event.id,
        name: 'Food Booth 1',
        boothType: 'food',
        boothNumber: 1,
        allowedCategory: 'Food',
        isActive: true,
      },
    }),
    prisma.booth.upsert({
      where: { id: 'booth-food-2' },
      update: {},
      create: {
        id: 'booth-food-2',
        eventId: event.id,
        name: 'Food Booth 2',
        boothType: 'food',
        boothNumber: 2,
        allowedCategory: 'Food',
        isActive: true,
      },
    }),
    prisma.booth.upsert({
      where: { id: 'booth-food-3' },
      update: {},
      create: {
        id: 'booth-food-3',
        eventId: event.id,
        name: 'Food Booth 3',
        boothType: 'food',
        boothNumber: 3,
        allowedCategory: 'Food',
        isActive: true,
      },
    }),
    prisma.booth.upsert({
      where: { id: 'booth-food-4' },
      update: {},
      create: {
        id: 'booth-food-4',
        eventId: event.id,
        name: 'Food Booth 4',
        boothType: 'food',
        boothNumber: 4,
        allowedCategory: 'Food',
        isActive: true,
      },
    }),
    prisma.booth.upsert({
      where: { id: 'booth-drink-1' },
      update: {},
      create: {
        id: 'booth-drink-1',
        eventId: event.id,
        name: 'Drink Booth 1',
        boothType: 'drink',
        boothNumber: 1,
        allowedCategory: 'Drink',
        isActive: true,
      },
    }),
    prisma.booth.upsert({
      where: { id: 'booth-drink-2' },
      update: {},
      create: {
        id: 'booth-drink-2',
        eventId: event.id,
        name: 'Drink Booth 2',
        boothType: 'drink',
        boothNumber: 2,
        allowedCategory: 'Drink',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Booths created: ${booths.length} (4 Food + 2 Drink)`)

  // 6. Create Admin Users
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@event.com' },
    update: {},
    create: {
      email: 'admin@event.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'panitia@event.com' },
    update: {},
    create: {
      email: 'panitia@event.com',
      name: 'Panitia Event',
      password: hashedPassword,
      role: 'panitia',
      eventId: event.id,
      isActive: true,
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'scanner@event.com' },
    update: {},
    create: {
      email: 'scanner@event.com',
      name: 'Scanner Operator',
      password: hashedPassword,
      role: 'panitia',
      eventId: event.id,
      assignedType: 'checkin',
      isActive: true,
    },
  })
  console.log('\n✅ Admin users created:')
  console.log('   - admin@event.com (admin) - password: admin123')
  console.log('   - panitia@event.com (panitia) - password: admin123')
  console.log('   - scanner@event.com (panitia) - password: admin123')

  // 7. Create Participants
  console.log('\n👥 Creating participants...')
  
  for (let i = 0; i < indonesianNames.length; i++) {
    const person = indonesianNames[i]
    const qrCode = `HKI-2025-${String(i + 1).padStart(4, '0')}`
    const email = `${person.name.toLowerCase().replace(/ /g, '.')}@gmail.com`
    const phone = `+62 8${Math.floor(Math.random() * 900000000 + 100000000)}`
    
    // Use placeholder image
    const photoUrl = getPlaceholderImage(person.name, i)
    
    await prisma.participant.create({
      data: {
        eventId: event.id,
        name: person.name,
        email: email,
        phone: phone,
        company: person.company,
        bio: `${person.position} at ${person.company}`,
        photoUrl: photoUrl,
        qrCode: qrCode,
        maxFoodClaims: 2,
        maxDrinkClaims: 1,
        isCheckedIn: false,
        foodClaims: 0,
        drinkClaims: 0,
      },
    })
    
    console.log(`  ✅ ${person.name} (${person.company}) - QR: ${qrCode}`)
  }

  // 8. Update event stats
  const participantCount = await prisma.participant.count({
    where: { eventId: event.id }
  })
  
  await prisma.eventStats.update({
    where: { eventId: event.id },
    data: {
      totalParticipants: participantCount,
      totalNotCheckedIn: participantCount,
    }
  })

  console.log('\n=====================================')
  console.log('🎉 Seeding completed!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Event: ${event.name}`)
  console.log(`   - Participants: ${participantCount}`)
  console.log(`   - Food Items: ${foodItems.length}`)
  console.log(`   - Drink Items: ${drinkItems.length}`)
  console.log(`   - Booths: ${booths.length}`)
  console.log(`\n🔐 Login Credentials:`)
  console.log(`   - Admin: admin@event.com / admin123`)
  console.log(`   - Panitia: panitia@event.com / admin123`)
  console.log(`\n📱 Test QR Codes (first 5 participants):`)
  
  const testParticipants = await prisma.participant.findMany({
    take: 5,
    orderBy: { createdAt: 'asc' },
    select: { name: true, qrCode: true }
  })
  
  testParticipants.forEach(p => {
    console.log(`   - ${p.name}: ${p.qrCode}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
