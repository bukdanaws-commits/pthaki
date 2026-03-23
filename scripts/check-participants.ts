import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Count all
  const count = await prisma.participant.count()
  console.log(`Total participants: ${count}`)
  
  // Get all
  const participants = await prisma.participant.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      qrCode: true,
      company: true,
      isCheckedIn: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  })
  
  console.log('\n📋 All Participants:\n')
  
  participants.forEach((p, i) => {
    console.log(`${i+1}. ${p.name} - ${p.qrCode} - ${p.company}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
