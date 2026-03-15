'use client'

import { useState, useEffect, useCallback } from 'react'
import { Monitor, Users, CheckCircle, Clock, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface DisplayQueueItem {
  id: string
  participantId: string
  name: string
  company: string | null
  photoUrl: string | null
  isDisplayed: boolean
  expiresAt: string
  createdAt: string
}

interface Stats {
  totalParticipants: number
  checkedInParticipants: number
  totalClaims: number
  recentCheckIns: any[]
}

export default function DisplayMonitorSection() {
  const [queue, setQueue] = useState<DisplayQueueItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        fetch('/api/display/queue'),
        fetch('/api/stats'),
      ])
      
      const queueData = await queueRes.json()
      const statsData = await statsRes.json()
      
      if (queueData.success) {
        setQueue(queueData.data)
      }
      
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Poll every 3 seconds for live updates
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const markAsDisplayed = async (queueId: string) => {
    try {
      await fetch('/api/display/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to mark as displayed:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-[#47b2e4]" />
      </div>
    )
  }

  // Fullscreen Display Mode
  if (isFullscreen && queue.length > 0) {
    const currentItem = queue[0]
    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-[#37517e] via-[#2a3d5e] to-[#1a2840] flex items-center justify-center z-50 cursor-pointer"
        onClick={toggleFullscreen}
      >
        <div className="text-center text-white max-w-2xl mx-auto px-8">
          {/* AI Avatar */}
          <div className="mb-8">
            {currentItem.photoUrl ? (
              <img 
                src={currentItem.photoUrl} 
                alt={currentItem.name}
                className="w-48 h-48 rounded-full mx-auto border-8 border-white/20 shadow-2xl object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-full mx-auto bg-gradient-to-br from-[#47b2e4] to-[#37517e] flex items-center justify-center text-6xl font-bold border-8 border-white/20 shadow-2xl">
                {currentItem.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
          </div>
          
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-2xl text-[#47b2e4] font-medium">Selamat Datang!</p>
            <h1 className="text-6xl font-bold">{currentItem.name}</h1>
            {currentItem.company && (
              <p className="text-3xl text-slate-300">{currentItem.company}</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Badge className="bg-[#47b2e4] text-white text-lg px-6 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                Check-in Berhasil
              </Badge>
            </div>
          </motion.div>
        </div>
        
        {/* Click to exit hint */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/50 text-sm">Klik di mana saja untuk keluar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Peserta</p>
                <p className="text-4xl font-bold">{stats?.totalParticipants || 0}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Sudah Check-in</p>
                <p className="text-4xl font-bold">{stats?.checkedInParticipants || 0}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Dalam Antrian</p>
                <p className="text-4xl font-bold">{queue.length}</p>
              </div>
              <Monitor className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Display Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#47b2e4]" />
              Display Queue
            </CardTitle>
            <CardDescription>Peserta yang baru check-in dan menunggu ditampilkan</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {queue.length > 0 && (
              <Button onClick={toggleFullscreen} className="bg-[#47b2e4] hover:bg-[#47b2e4]/90">
                <Monitor className="h-4 w-4 mr-2" />
                Fullscreen Display
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Monitor className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Antrian Kosong</p>
              <p className="text-sm">Belum ada peserta yang baru check-in</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {queue.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      index === 0 
                        ? "bg-gradient-to-r from-[#47b2e4]/10 to-[#37517e]/10 border-[#47b2e4]" 
                        : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                      index === 0 ? "bg-[#47b2e4]" : "bg-slate-300"
                    )}>
                      {index + 1}
                    </div>
                    
                    <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                      <AvatarImage src={item.photoUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#47b2e4] to-[#37517e] text-white text-lg">
                        {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{item.name}</p>
                      <p className="text-muted-foreground">{item.company || 'Tidak ada perusahaan'}</p>
                    </div>
                    
                    <div className="text-right">
                      {index === 0 ? (
                        <Badge className="bg-[#47b2e4] text-white mb-2">
                          Sedang Ditampilkan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mb-2">
                          Menunggu
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(item.createdAt).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                    
                    {index === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsDisplayed(item.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Check-in Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {!stats?.recentCheckIns || stats.recentCheckIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <User className="h-10 w-10 mb-2 opacity-50" />
                <p>Belum ada check-in</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentCheckIns.map((checkin: any) => (
                  <div 
                    key={checkin.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{checkin.participantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkin.participantCompany || 'No Company'} • Desk {checkin.deskNumber}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(checkin.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
