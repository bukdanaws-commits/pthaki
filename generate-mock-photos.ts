import { db } from './src/lib/db'

// Mock avatar URLs (SVG placeholders with different colors)
const MOCK_AVATARS = [
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM2MzY2ZjEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNlYzQ4OTkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM4YjVjZjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
]

async function main() {
  console.log('🎨 Generating mock photos for participants...')
  
  // Get all participants without AI photo
  const participantsWithoutPhoto = await db.participant.findMany({
    where: {
      eventId: 'main-event',
      aiPhotoUrl: null,
    },
  })
  
  console.log(`Found ${participantsWithoutPhoto.length} participants without AI photo`)
  
  // Update each with a mock avatar
  for (const participant of participantsWithoutPhoto) {
    const avatarIndex = Math.floor(Math.random() * MOCK_AVATARS.length)
    const avatarUrl = MOCK_AVATARS[avatarIndex]
    
    await db.participant.update({
      where: { id: participant.id },
      data: { aiPhotoUrl: avatarUrl },
    })
    
    console.log(`✓ Updated ${participant.name}`)
  }
  
  // Also update QR code URLs for those who don't have one
  const participantsWithoutQR = await db.participant.findMany({
    where: {
      eventId: 'main-event',
      qrCodeUrl: null,
    },
  })
  
  console.log(`\nFound ${participantsWithoutQR.length} participants without QR URL`)
  
  // Generate QR codes
  const QRCode = (await import('qrcode')).default
  
  for (const participant of participantsWithoutQR) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(participant.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      
      await db.participant.update({
        where: { id: participant.id },
        data: { qrCodeUrl },
      })
      
      console.log(`✓ Generated QR for ${participant.name}`)
    } catch (error) {
      console.error(`✗ Failed to generate QR for ${participant.name}:`, error)
    }
  }
  
  console.log('\n✅ Mock photo generation complete!')
  
  // Print summary
  const total = await db.participant.count({ where: { eventId: 'main-event' } })
  const withPhoto = await db.participant.count({ 
    where: { eventId: 'main-event', aiPhotoUrl: { not: null } 
  }})
  const withQR = await db.participant.count({ 
    where: { eventId: 'main-event', qrCodeUrl: { not: null } 
  }})
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total participants: ${total}`)
  console.log(`   With AI photo: ${withPhoto}`)
  console.log(`   With QR code: ${withQR}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
