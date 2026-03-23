import bcrypt from 'bcryptjs'
import { createServiceClient } from '../src/lib/supabase/server'

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

// Food items (7 types)
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
function getPlaceholderImage(name: string): string {
  const isFemale = name.includes('Siti') || name.includes('Dewi') || name.includes('Putri') || 
                   name.includes('Rina') || name.includes('Dian') || name.includes('Lestari') || 
                   name.includes('Maya') || name.includes('Anisa') || name.includes('Indah') || 
                   name.includes('Silvia')
  
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
}

async function main() {
  console.log('🌱 Seeding Supabase database...')
  console.log('=====================================\n')
  
  const supabase = createServiceClient()

  // 1. Create Event
  const { data: event, error: eventError } = await supabase
    .from('Event')
    .upsert({
      id: 'main-event',
      name: 'Gathering PT HKI 2025',
      description: 'Annual company gathering event untuk seluruh karyawan PT Harapan Kita Indonesia dan partner bisnis',
      date: '2025-09-20T08:00:00+07:00',
      endDate: '2025-09-20T17:00:00+07:00',
      location: 'Grand Ballroom, Hotel Mulia Jakarta',
      isActive: true,
      tagline: 'Bersama Menuju Kesuksesan',
      organizer: 'PT Harapan Kita Indonesia',
      primaryColor: '#37517e',
      secondaryColor: '#47b2e4',
    }, { onConflict: 'id' })
    .select()
    .single()

  if (eventError) {
    console.error('Error creating event:', eventError)
    return
  }
  console.log('✅ Event created:', event.name)

  // 2. Create Event Stats
  await supabase
    .from('EventStats')
    .upsert({
      eventId: event.id,
    }, { onConflict: 'eventId' })
  
  console.log('✅ Event stats initialized')

  // 3. Create Menu Categories
  const { data: foodCategory } = await supabase
    .from('MenuCategory')
    .upsert({
      eventId: event.id,
      name: 'Food',
      description: 'Makanan untuk peserta event',
      maxClaimsPerParticipant: 2,
    }, { onConflict: 'eventId,name' })
    .select()
    .single()

  const { data: drinkCategory } = await supabase
    .from('MenuCategory')
    .upsert({
      eventId: event.id,
      name: 'Drink',
      description: 'Minuman untuk peserta event',
      maxClaimsPerParticipant: 1,
    }, { onConflict: 'eventId,name' })
    .select()
    .single()

  console.log('✅ Categories created: Food, Drink')

  // 4. Create Menu Items
  console.log('\n📦 Creating food items...')
  for (let i = 0; i < foodItems.length; i++) {
    const item = foodItems[i]
    
    await supabase
      .from('MenuItem')
      .upsert({
        id: `menu-food-${i + 1}`,
        eventId: event.id,
        categoryId: foodCategory!.id,
        name: item.name,
        description: item.description,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=f0f0f0`,
        initialStock: item.stock,
        currentStock: item.stock,
        isActive: true,
      }, { onConflict: 'id' })
    
    console.log(`  ✅ Food: ${item.name} (${item.stock} portions)`)
  }

  console.log('\n📦 Creating drink items...')
  for (let i = 0; i < drinkItems.length; i++) {
    const item = drinkItems[i]
    
    await supabase
      .from('MenuItem')
      .upsert({
        id: `menu-drink-${i + 1}`,
        eventId: event.id,
        categoryId: drinkCategory!.id,
        name: item.name,
        description: item.description,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=e0f7fa`,
        initialStock: item.stock,
        currentStock: item.stock,
        isActive: true,
      }, { onConflict: 'id' })
    
    console.log(`  ✅ Drink: ${item.name} (${item.stock} servings)`)
  }

  // 5. Create Booths (4 Food + 2 Drink)
  console.log('\n🏪 Creating booths...')
  const booths = [
    { id: 'booth-food-1', name: 'Food Booth 1', boothType: 'food', boothNumber: 1, allowedCategory: 'Food' },
    { id: 'booth-food-2', name: 'Food Booth 2', boothType: 'food', boothNumber: 2, allowedCategory: 'Food' },
    { id: 'booth-food-3', name: 'Food Booth 3', boothType: 'food', boothNumber: 3, allowedCategory: 'Food' },
    { id: 'booth-food-4', name: 'Food Booth 4', boothType: 'food', boothNumber: 4, allowedCategory: 'Food' },
    { id: 'booth-drink-1', name: 'Drink Booth 1', boothType: 'drink', boothNumber: 1, allowedCategory: 'Drink' },
    { id: 'booth-drink-2', name: 'Drink Booth 2', boothType: 'drink', boothNumber: 2, allowedCategory: 'Drink' },
  ]

  for (const booth of booths) {
    await supabase
      .from('Booth')
      .upsert({
        id: booth.id,
        eventId: event.id,
        name: booth.name,
        boothType: booth.boothType,
        boothNumber: booth.boothNumber,
        allowedCategory: booth.allowedCategory,
        isActive: true,
      }, { onConflict: 'id' })
  }
  console.log(`✅ Booths created: ${booths.length} (4 Food + 2 Drink)`)

  // 6. Create Admin Users
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUsers = [
    { email: 'admin@event.com', name: 'Super Admin', role: 'admin' },
    { email: 'panitia@event.com', name: 'Panitia Event', role: 'panitia' },
    { email: 'scanner@event.com', name: 'Scanner Operator', role: 'panitia' },
  ]

  for (const user of adminUsers) {
    await supabase
      .from('AdminUser')
      .upsert({
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
        isActive: true,
      }, { onConflict: 'email' })
  }
  
  console.log('\n✅ Admin users created:')
  console.log('   - admin@event.com (admin) - password: admin123')
  console.log('   - panitia@event.com (panitia) - password: admin123')
  console.log('   - scanner@event.com (panitia) - password: admin123')

  // 7. Create Participants
  console.log('\n👥 Creating participants...')
  
  // First, delete existing participants for this event
  await supabase
    .from('Participant')
    .delete()
    .eq('eventId', event.id)
  
  for (let i = 0; i < indonesianNames.length; i++) {
    const person = indonesianNames[i]
    const qrCode = `HKI-2025-${String(i + 1).padStart(4, '0')}`
    const email = `${person.name.toLowerCase().replace(/ /g, '.')}@gmail.com`
    const phone = `+62 8${Math.floor(Math.random() * 900000000 + 100000000)}`
    
    // Use placeholder image
    const photoUrl = getPlaceholderImage(person.name)
    
    await supabase
      .from('Participant')
      .insert({
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
      })
    
    console.log(`  ✅ ${person.name} (${person.company}) - QR: ${qrCode}`)
  }

  // 8. Update event stats
  const { count: participantCount } = await supabase
    .from('Participant')
    .select('id', { count: 'exact', head: true })
    .eq('eventId', event.id)
  
  await supabase
    .from('EventStats')
    .update({
      totalParticipants: participantCount || 0,
      totalNotCheckedIn: participantCount || 0,
    })
    .eq('eventId', event.id)

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
  console.log(`   - Ahmad Wijaya: HKI-2025-0001`)
  console.log(`   - Siti Rahayu: HKI-2025-0002`)
  console.log(`   - Budi Santoso: HKI-2025-0003`)
  console.log(`   - Dewi Kusuma: HKI-2025-0004`)
  console.log(`   - Rizki Pratama: HKI-2025-0005`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
