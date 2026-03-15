import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const participants = [
  { name: 'Ahmad Wijaya', gender: 'man' },
  { name: 'Siti Rahayu', gender: 'woman' },
  { name: 'Budi Santoso', gender: 'man' },
  { name: 'Dewi Kusuma', gender: 'woman' },
  { name: 'Rizki Pratama', gender: 'man' },
  { name: 'Putri Handayani', gender: 'woman' },
  { name: 'Agus Setiawan', gender: 'man' },
  { name: 'Rina Marlina', gender: 'woman' },
  { name: 'Dian Purnama', gender: 'man' },
  { name: 'Hendra Gunawan', gender: 'man' },
  { name: 'Lestari Wulandari', gender: 'woman' },
  { name: 'Eko Prasetyo', gender: 'man' },
  { name: 'Maya Sari', gender: 'woman' },
  { name: 'Fajar Nugroho', gender: 'man' },
  { name: 'Anisa Putri', gender: 'woman' },
  { name: 'Rudi Hermawan', gender: 'man' },
  { name: 'Indah Permata', gender: 'woman' },
  { name: 'Yoga Pratama', gender: 'man' },
  { name: 'Silvia Anggraini', gender: 'woman' },
  { name: 'Bayu Aditya', gender: 'man' },
]

const foodItems = [
  'Nasi Padang Special with rendang and ayam pop',
  'Nasi Goreng Seafood with prawns and squid',
  'Japanese Bento Box with chicken katsu',
  'Indonesian Snack Box with various snacks',
  'Sate Ayam Madura with peanut sauce',
  'Mie Ayam Bakso with meatballs',
  'Fresh Fruit Salad with yogurt',
]

const drinkItems = [
  'Premium Arabic Coffee in a cup',
  'Herbal Tea in a glass',
  'Fresh Fruit Juice with ice',
]

async function generateImage(prompt: string, outputPath: string): Promise<boolean> {
  if (fs.existsSync(outputPath)) {
    console.log(`  ⏭️  Already exists: ${path.basename(outputPath)}`)
    return true
  }

  try {
    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    })

    const imageBase64 = response.data[0].base64
    const buffer = Buffer.from(imageBase64, 'base64')
    
    fs.writeFileSync(outputPath, buffer)
    return true
  } catch (error) {
    console.error(`  ❌ Failed: ${error}`)
    return false
  }
}

async function main() {
  console.log('🎨 Generating AI Images...\n')
  
  const outputDir = path.join(process.cwd(), 'public')
  const participantsDir = path.join(outputDir, 'participants')
  const foodDir = path.join(outputDir, 'food')
  const drinksDir = path.join(outputDir, 'drinks')
  
  // Create directories
  ;[participantsDir, foodDir, drinksDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  // Generate participant images
  console.log('📷 Generating participant photos...')
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i]
    const outputPath = path.join(participantsDir, `participant_${i + 1}.png`)
    
    console.log(`  Generating ${i + 1}/${participants.length}: ${p.name}...`)
    
    const success = await generateImage(
      `Professional headshot photo of an Indonesian ${p.gender} business professional, friendly smile, office background, formal attire, high quality, realistic, soft lighting, portrait photography`,
      outputPath
    )
    
    if (success) {
      console.log(`  ✅ Generated: ${p.name}`)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Generate food images
  console.log('\n🍔 Generating food images...')
  for (let i = 0; i < foodItems.length; i++) {
    const item = foodItems[i]
    const outputPath = path.join(foodDir, `food_${i + 1}.png`)
    
    console.log(`  Generating ${i + 1}/${foodItems.length}: ${item}...`)
    
    const success = await generateImage(
      `Professional food photography of ${item}, Indonesian cuisine, appetizing, top view, restaurant quality, high resolution`,
      outputPath
    )
    
    if (success) {
      console.log(`  ✅ Generated: ${item}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Generate drink images
  console.log('\n🥤 Generating drink images...')
  for (let i = 0; i < drinkItems.length; i++) {
    const item = drinkItems[i]
    const outputPath = path.join(drinksDir, `drink_${i + 1}.png`)
    
    console.log(`  Generating ${i + 1}/${drinkItems.length}: ${item}...`)
    
    const success = await generateImage(
      `Professional beverage photography of ${item}, refreshing, cafe style, high resolution, clean background`,
      outputPath
    )
    
    if (success) {
      console.log(`  ✅ Generated: ${item}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n🎉 Image generation completed!')
}

main().catch(console.error)
