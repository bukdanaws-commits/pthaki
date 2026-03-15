'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Maximize, Minimize, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'

interface DisplayParticipant {
  id: string
  name: string
  company: string | null
  photoUrl: string | null
}

interface QueueItem {
  id: string
  participantId: string
  participant: DisplayParticipant
  displayedAt: string
}

export default function DisplaySection() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [displayState, setDisplayState] = useState<{
    currentParticipant: DisplayParticipant | null
    queueLength: number
    isProcessing: boolean
  }>({
    currentParticipant: null,
    queueLength: 0,
    isProcessing: false
  })
  
  const queueRef = useRef<QueueItem[]>([])
  const socketRef = useRef<Socket | null>(null)
  const processingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Process next item in queue - defined as a standalone function
  function processNextItem() {
    if (queueRef.current.length === 0 || processingRef.current) return

    const nextItem = queueRef.current[0]
    processingRef.current = true
    
    setDisplayState(prev => ({
      ...prev,
      currentParticipant: nextItem.participant,
      isProcessing: true
    }))

    // Mark as displayed after animation
    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/display/queue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queueId: nextItem.id }),
        })
      } catch (error) {
        console.error('Failed to mark as displayed:', error)
      }
    }, 4000)

    // Show for 5 seconds then move to next
    setTimeout(() => {
      queueRef.current.shift()
      processingRef.current = false
      
      setDisplayState(prev => ({
        ...prev,
        currentParticipant: null,
        queueLength: queueRef.current.length,
        isProcessing: false
      }))
      
      // Process next item after a short delay
      if (queueRef.current.length > 0) {
        setTimeout(processNextItem, 200)
      }
    }, 5000)
  }

  // Add item to queue
  function addToQueue(item: QueueItem) {
    queueRef.current.push(item)
    setDisplayState(prev => ({
      ...prev,
      queueLength: queueRef.current.length
    }))
    
    // Start processing if not already
    if (!processingRef.current) {
      setTimeout(processNextItem, 100)
    }
  }

  // Fetch display queue
  async function fetchQueue() {
    try {
      const response = await fetch('/api/display/queue')
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        const existingIds = new Set(queueRef.current.map(item => item.id))
        
        result.data.forEach((item: QueueItem) => {
          if (!existingIds.has(item.id)) {
            queueRef.current.push(item)
          }
        })
        
        setDisplayState(prev => ({
          ...prev,
          queueLength: queueRef.current.length
        }))
        
        // Start processing if not already
        if (!processingRef.current && queueRef.current.length > 0) {
          setTimeout(processNextItem, 100)
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    }
  }

  // WebSocket connection for real-time updates
  useEffect(() => {
    socketRef.current = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Display connected to WebSocket')
    })

    socket.on('check-in', (data: { participantId: string; name: string; company: string | null; photoUrl: string | null }) => {
      const newItem: QueueItem = {
        id: `new-${Date.now()}`,
        participantId: data.participantId,
        participant: {
          id: data.participantId,
          name: data.name,
          company: data.company,
          photoUrl: data.photoUrl,
        },
        displayedAt: new Date().toISOString(),
      }
      addToQueue(newItem)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Poll for queue updates
  useEffect(() => {
    const timeoutId = setTimeout(fetchQueue, 500)
    const interval = setInterval(fetchQueue, 3000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [])

  // Toggle fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const { currentParticipant, queueLength } = displayState

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700' : ''} p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`font-bold ${isFullscreen ? 'text-white text-4xl' : 'text-2xl'}`}>
          Welcome Display
        </h1>
        <Button
          variant={isFullscreen ? 'outline' : 'default'}
          onClick={toggleFullscreen}
          className="gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4" />
              Fullscreen
            </>
          )}
        </Button>
      </div>

      {/* Main Display */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[500px]'} flex items-center justify-center`}>
        <AnimatePresence mode="wait">
          {currentParticipant ? (
            <motion.div
              key={currentParticipant.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <Card className={`${isFullscreen ? 'bg-white/10 backdrop-blur-lg border-white/20' : ''} max-w-2xl mx-auto`}>
                <CardContent className={`pt-8 pb-8 ${isFullscreen ? 'px-16' : 'px-8'}`}>
                  {/* Welcome Text */}
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`font-bold mb-6 ${isFullscreen ? 'text-5xl text-white' : 'text-3xl text-emerald-600'}`}
                  >
                    SELAMAT DATANG
                  </motion.h2>

                  {/* Photo */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-6"
                  >
                    <Avatar className={`${isFullscreen ? 'h-48 w-48' : 'h-32 w-32'} border-4 border-white shadow-2xl`}>
                      <AvatarImage src={currentParticipant.photoUrl || undefined} />
                      <AvatarFallback className={`${isFullscreen ? 'text-5xl' : 'text-3xl'} bg-gradient-to-br from-emerald-400 to-teal-500 text-white`}>
                        {currentParticipant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  {/* Name */}
                  <motion.h3
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`font-bold ${isFullscreen ? 'text-6xl text-white' : 'text-4xl text-gray-900'}`}
                  >
                    {currentParticipant.name}
                  </motion.h3>

                  {/* Company */}
                  {currentParticipant.company && (
                    <motion.p
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className={`mt-2 ${isFullscreen ? 'text-2xl text-white/80' : 'text-xl text-muted-foreground'}`}
                    >
                      {currentParticipant.company}
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className={`${isFullscreen ? 'text-white/50' : 'text-muted-foreground'}`}>
                <Users className={`mx-auto mb-4 ${isFullscreen ? 'h-24 w-24' : 'h-16 w-16'}`} />
                <p className={isFullscreen ? 'text-2xl' : 'text-lg'}>
                  Waiting for check-ins...
                </p>
                <p className={`mt-2 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                  {queueLength} participant(s) in queue
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Queue indicator */}
      {queueLength > 0 && !isFullscreen && (
        <div className="mt-4 text-center text-muted-foreground">
          <p className="text-sm">{queueLength} participant(s) waiting in queue</p>
        </div>
      )}
    </div>
  )
}
