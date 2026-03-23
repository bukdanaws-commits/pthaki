// Mockup data for simulation - will be replaced with real database queries later

export interface MockParticipant {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  photoUrl: string | null
  qrCode: string
  isCheckedIn: boolean
  checkInTime: Date | null
  foodClaims: number
  drinkClaims: number
  createdAt: Date
}

export interface MockCheckIn {
  id: string
  participantId: string
  participantName: string
  participantCompany: string | null
  deskNumber: number
  checkedInAt: Date
}

export interface MockClaim {
  id: string
  participantId: string
  participantName: string
  menuItemId: string
  menuItemName: string
  menuCategory: string
  boothId: string
  boothName: string
  claimedAt: Date
}

export interface MockMenuItem {
  id: string
  name: string
  description: string | null
  category: 'Food' | 'Drink'
  stockTotal: number
  stockRemaining: number
}

export interface MockBooth {
  id: string
  name: string
  type: 'food' | 'drink'
  boothNumber: number
  claimsCount: number
}

// Generate random timestamp within today
function randomTimeToday(hourStart: number, hourEnd: number): Date {
  const now = new Date()
  const hour = hourStart + Math.random() * (hourEnd - hourStart)
  const minute = Math.floor(Math.random() * 60)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute)
}

// Generate QR code
function generateQR(): string {
  return `EVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36)}`
}

// Company names for mock data
const companies = [
  'PT Harapan Kita Indonesia',
  'PT Maju Bersama',
  'CV Teknologi Nusantara',
  'PT Digital Solusi',
  'PT Sinergi Group',
  'CV Kreatif Mandiri',
  'PT Inovasi Teknologi',
  'PT Sukses Mandiri',
  'CV Prima Abadi',
  'PT Global Tech',
  'PT Data Prima',
  'CV Mitra Usaha',
  'PT Solusi Digital',
  'PT Aplikasi Indonesia',
  'CV Tech Vision'
]

// First names
const firstNames = [
  'Budi', 'Andi', 'Rina', 'Siti', 'Dewi', 'Ahmad', 'Rizki', 'Putri', 'Dian', 'Agus',
  'Wati', 'Eko', 'Ratna', 'Hendra', 'Lina', 'Yusuf', 'Maya', 'Deni', 'Rani', 'Fajar',
  'Nina', 'Rudi', 'Ayu', 'Bayu', 'Indah', 'Eka', 'Tuti', 'Hadi', 'Sri', 'Wawan',
  'Yuni', 'Dedi', 'Lisa', 'Agung', 'Wulan', 'Bambang', 'Nadia', 'Riko', 'Fitri', 'Yanto'
]

// Last names
const lastNames = [
  'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Hidayat', 'Nugroho', 'Setiawan',
  'Putra', 'Wibowo', 'Suryadi', 'Kurniawan', 'Hartono', 'Susanto', 'Budiman', 'Rahayu',
  'Dewantara', 'Permana', 'Kuswanto', 'Handoko', 'Sutrisno', 'Wahyudi', 'Siregar', 'Nasution'
]

// Generate 2000 participants
export const mockParticipants: MockParticipant[] = Array.from({ length: 2000 }, (_, i) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const name = `${firstName} ${lastName}`
  const company = companies[Math.floor(Math.random() * companies.length)]
  const isCheckedIn = Math.random() > 0.23 // 77% check-in rate (1540/2000)
  const checkInTime = isCheckedIn ? randomTimeToday(8, 12) : null
  const foodClaims = isCheckedIn ? Math.floor(Math.random() * 3) : 0 // 0-2 food claims
  const drinkClaims = isCheckedIn ? Math.floor(Math.random() * 2) : 0 // 0-1 drink claims

  return {
    id: `participant-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.co.id`,
    phone: `+62 8${Math.floor(Math.random() * 900000000 + 100000000)}`,
    company,
    photoUrl: null,
    qrCode: generateQR(),
    isCheckedIn,
    checkInTime,
    foodClaims,
    drinkClaims,
    createdAt: randomTimeToday(0, 8)
  }
})

// Menu items with stock
export const mockMenuItems: MockMenuItem[] = [
  { id: 'menu-1', name: 'Nasi Padang', description: 'Nasi dengan aneka lauk padang', category: 'Food', stockTotal: 800, stockRemaining: 260 },
  { id: 'menu-2', name: 'Snack Box', description: 'Kotak snack berbagai rasa', category: 'Food', stockTotal: 700, stockRemaining: 280 },
  { id: 'menu-3', name: 'Bento Box', description: 'Bento Jepang lengkap', category: 'Food', stockTotal: 500, stockRemaining: 240 },
  { id: 'menu-4', name: 'Coffee', description: 'Kopi arabica premium', category: 'Drink', stockTotal: 500, stockRemaining: 180 },
  { id: 'menu-5', name: 'Tea', description: 'Teh pilihan herbal', category: 'Drink', stockTotal: 500, stockRemaining: 220 },
  { id: 'menu-6', name: 'Juice', description: 'Jus buah segar', category: 'Drink', stockTotal: 400, stockRemaining: 280 },
]

// Booths
export const mockBooths: MockBooth[] = [
  { id: 'booth-1', name: 'Food Booth 1', type: 'food', boothNumber: 1, claimsCount: 420 },
  { id: 'booth-2', name: 'Food Booth 2', type: 'food', boothNumber: 2, claimsCount: 380 },
  { id: 'booth-3', name: 'Food Booth 3', type: 'food', boothNumber: 3, claimsCount: 400 },
  { id: 'booth-4', name: 'Food Booth 4', type: 'food', boothNumber: 4, claimsCount: 350 },
  { id: 'booth-5', name: 'Drink Booth 1', type: 'drink', boothNumber: 1, claimsCount: 480 },
  { id: 'booth-6', name: 'Drink Booth 2', type: 'drink', boothNumber: 2, claimsCount: 500 },
]

// Generate claims for checked-in participants
export const mockClaims: MockClaim[] = []
const checkedInParticipants = mockParticipants.filter(p => p.isCheckedIn)

checkedInParticipants.forEach(participant => {
  // Add food claims
  for (let i = 0; i < participant.foodClaims; i++) {
    const foodItems = mockMenuItems.filter(m => m.category === 'Food')
    const item = foodItems[Math.floor(Math.random() * foodItems.length)]
    const foodBooths = mockBooths.filter(b => b.type === 'food')
    const booth = foodBooths[Math.floor(Math.random() * foodBooths.length)]
    
    mockClaims.push({
      id: `claim-${mockClaims.length + 1}`,
      participantId: participant.id,
      participantName: participant.name,
      menuItemId: item.id,
      menuItemName: item.name,
      menuCategory: 'Food',
      boothId: booth.id,
      boothName: booth.name,
      claimedAt: randomTimeToday(11, 14)
    })
  }
  
  // Add drink claims
  for (let i = 0; i < participant.drinkClaims; i++) {
    const drinkItems = mockMenuItems.filter(m => m.category === 'Drink')
    const item = drinkItems[Math.floor(Math.random() * drinkItems.length)]
    const drinkBooths = mockBooths.filter(b => b.type === 'drink')
    const booth = drinkBooths[Math.floor(Math.random() * drinkBooths.length)]
    
    mockClaims.push({
      id: `claim-${mockClaims.length + 1}`,
      participantId: participant.id,
      participantName: participant.name,
      menuItemId: item.id,
      menuItemName: item.name,
      menuCategory: 'Drink',
      boothId: booth.id,
      boothName: booth.name,
      claimedAt: randomTimeToday(11, 14)
    })
  }
})

// Sort claims by time
mockClaims.sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime())

// Generate check-ins for checked-in participants
export const mockCheckIns: MockCheckIn[] = checkedInParticipants.map(p => ({
  id: `checkin-${p.id}`,
  participantId: p.id,
  participantName: p.name,
  participantCompany: p.company,
  deskNumber: Math.floor(Math.random() * 4) + 1,
  checkedInAt: p.checkInTime!
}))

// Sort check-ins by time
mockCheckIns.sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())

// Check-in activity by time slot (for line chart)
export const checkInActivityData = [
  { time: '08:00', count: 45 },
  { time: '08:30', count: 120 },
  { time: '09:00', count: 280 },
  { time: '09:30', count: 420 },
  { time: '10:00', count: 380 },
  { time: '10:30', count: 180 },
  { time: '11:00', count: 75 },
  { time: '11:30', count: 40 },
]

// Food claim distribution
export const foodClaimDistribution = mockMenuItems
  .filter(m => m.category === 'Food')
  .map(m => ({
    name: m.name,
    claims: m.stockTotal - m.stockRemaining
  }))

// Drink claim distribution
export const drinkClaimDistribution = mockMenuItems
  .filter(m => m.category === 'Drink')
  .map(m => ({
    name: m.name,
    claims: m.stockTotal - m.stockRemaining
  }))

// Booth activity
export const boothActivity = mockBooths.map(b => ({
  name: b.name,
  type: b.type,
  claims: b.claimsCount
}))

// Statistics summary
export const statsSummary = {
  totalParticipants: mockParticipants.length,
  checkedIn: mockParticipants.filter(p => p.isCheckedIn).length,
  notCheckedIn: mockParticipants.filter(p => !p.isCheckedIn).length,
  totalFoodClaims: mockClaims.filter(c => c.menuCategory === 'Food').length,
  totalDrinkClaims: mockClaims.filter(c => c.menuCategory === 'Drink').length,
  totalClaims: mockClaims.length,
}

// Recent claims (last 20)
export const recentClaims = mockClaims.slice(0, 20)

// Recent check-ins (last 20)
export const recentCheckIns = mockCheckIns.slice(0, 20)
