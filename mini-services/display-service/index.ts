import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface CheckInEvent {
  participantId: string
  name: string
  company: string | null
  photoUrl: string | null
}

interface DisplayClient {
  id: string
  type: 'display' | 'scanner'
}

const clients = new Map<string, DisplayClient>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Register client type
  socket.on('register', (data: { type: 'display' | 'scanner' }) => {
    clients.set(socket.id, { id: socket.id, type: data.type })
    console.log(`Client ${socket.id} registered as ${data.type}`)
  })

  // Handle check-in event from scanner
  socket.on('check-in', (data: CheckInEvent) => {
    console.log(`Check-in event: ${data.name} from ${data.company || 'No Company'}`)
    
    // Broadcast to all display clients
    io.emit('check-in', data)
  })

  // Handle display update acknowledgment
  socket.on('display-ack', (data: { participantId: string }) => {
    console.log(`Display acknowledged for participant: ${data.participantId}`)
  })

  // Handle test event
  socket.on('test', (data) => {
    console.log('Received test message:', data)
    socket.emit('test-response', { 
      message: 'Display service received test message', 
      data: data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('disconnect', () => {
    clients.delete(socket.id)
    console.log(`Client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Display WebSocket service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})
