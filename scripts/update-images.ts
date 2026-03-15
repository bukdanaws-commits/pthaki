import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating image URLs...\n')
  
  // Update food images
  const foodItems = [
    { id: 'menu-food-1', image: '/food/food_1.png' },
    { id: 'menu-food-2', image: '/food/food_2.png' },
    { id: 'menu-food-3', image: '/food/food_3.png' },
    { id: 'menu-food-4', image: '/food/food_4.png' },
    { id: 'menu-food-5', image: '/food/food_5.png' },
    { id: 'menu-food-6', image: '/food/food_6.png' },
    { id: 'menu-food-7', image: '/food/food_7.png' },
  ]
  
  for (const item of foodItems) {
    if (fs.existsSync(`public${item.image}`)) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: item.image }
      })
      console.log(`✅ Updated food image: ${item.id} -> ${item.image}`)
    } else {
      console.log(`⚠️  Image not found: ${item.image}`)
    }
  }
  
  // Update drink images
  const drinkItems = [
    { id: 'menu-drink-1', image: '/drinks/drink_1.png' },
    { id: 'menu-drink-2', image: '/drinks/drink_2.png' },
    { id: 'menu-drink-3', image: '/drinks/drink_3.png' },
  ]
  
  for (const item of drinkItems) {
    if (fs.existsSync(`public${item.image}`)) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: item.image }
      })
      console.log(`✅ Updated drink image: ${item.id} -> ${item.image}`)
    } else {
      console.log(`⚠️  Image not found: ${item.image}`)
    }
  }
  
  // Update participant images
  const participants = await prisma.participant.findMany({
    select: { id: true },
    orderBy: { createdAt: 'asc' }
  })
  
  for (let i = 0; i < participants.length; i++) {
    const imagePath = `/participants/participant_${i + 1}.png`
    if (fs.existsSync(`public${imagePath}`)) {
      await prisma.participant.update({
        where: { id: participants[i].id },
        data: { photoUrl: imagePath }
      })
      console.log(`✅ Updated participant image: ${i + 1} -> ${imagePath}`)
    }
  }
  
  console.log('\n🎉 Done updating image URLs!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
