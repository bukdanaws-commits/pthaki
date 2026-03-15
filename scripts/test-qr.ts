import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Test finding a participant by QR code
  const qrCode = 'HKI-2025-0001'
  
  const participant = await prisma.participant.findUnique({
    where: { qrCode },
    include: {
      event: {
        select: { name: true }
      }
    }
  })
  
  if (participant) {
    console.log('\n✅ Found participant by QR code:', qrCode)
    console.log('   Name:', participant.name)
    console.log('   Email:', participant.email)
    console.log('   Company:', participant.company)
    console.log('   Event:', participant.event.name)
    console.log('   Checked In:', participant.isCheckedIn)
    console.log('   Max Food Claims:', participant.maxFoodClaims)
    console.log('   Max Drink Claims:', participant.maxDrinkClaims)
  } else {
    console.log('\n❌ Participant not found for QR code:', qrCode)
  }
  
  // Test all QR codes
  console.log('\n📋 All QR Codes:')
  const allParticipants = await prisma.participant.findMany({
    select: { name: true, qrCode: true }
  })
  
  allParticipants.forEach(p => {
    console.log(`   ${p.qrCode} - ${p.name}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
