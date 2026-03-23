'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bell,
  ExternalLink,
  Instagram,
  Twitter,
  Linkedin,
  Sparkles,
  Ticket,
  ArrowRight,
  AlertCircle,
  Info,
  Megaphone,
  CalendarDays,
  Building2,
  Camera,
  Download,
  Loader2,
  QrCode,
  User,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { registrationSchema, RegistrationFormData } from '@/lib/validations'
import { downloadQRCode } from '@/lib/qrcode'

interface EventData {
  id: string
  name: string
  description: string | null
  tagline: string | null
  logoUrl: string | null
  bannerUrl: string | null
  primaryColor: string
  secondaryColor: string
  date: string
  endDate: string | null
  location: string | null
  organizer: string | null
  website: string | null
  registrationStart: string | null
  registrationEnd: string | null
  instagram: string | null
  twitter: string | null
  linkedin: string | null
}

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isPinned: boolean
  publishAt: string
}

interface ScheduleItem {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string | null
  location: string | null
  speaker: string | null
  speakerTitle: string | null
  category: string | null
}

interface Sponsor {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  tier: string
}

interface RegistrationResult {
  id: string
  name: string
  email: string
  company?: string
  qrCode: string
  qrCodeUrl: string
  aiPhotoUrl?: string
}

export default function ParticipantLandingPage() {
  const [event, setEvent] = useState<EventData | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalParticipants: 0, checkedIn: 0 })
  
  // Registration state
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const registrationRef = useRef<HTMLDivElement>(null)

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      bio: '',
    },
  })

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [eventRes, announcementsRes, schedulesRes, sponsorsRes, statsRes] = await Promise.all([
          fetch('/api/landing/event'),
          fetch('/api/landing/announcements'),
          fetch('/api/landing/schedules'),
          fetch('/api/landing/sponsors'),
          fetch('/api/stats')
        ])

        if (eventRes.ok) {
          const data = await eventRes.json()
          if (data.success) setEvent(data.data)
        }

        if (announcementsRes.ok) {
          const data = await announcementsRes.json()
          if (data.success) setAnnouncements(data.data)
        }

        if (schedulesRes.ok) {
          const data = await schedulesRes.json()
          if (data.success) setSchedules(data.data)
        }

        if (sponsorsRes.ok) {
          const data = await sponsorsRes.json()
          if (data.success) setSponsors(data.data)
        }

        if (statsRes.ok) {
          const data = await statsRes.json()
          if (data.success) {
            setStats({
              totalParticipants: data.data.totalParticipants,
              checkedIn: data.data.checkedInParticipants
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch landing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLandingData()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          photo: photoPreview,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRegistrationResult(result.data)
        toast({
          title: 'Pendaftaran Berhasil!',
          description: `Selamat datang, ${result.data.name}! Tiket Anda sudah siap.`,
        })
        form.reset()
        setPhotoPreview(null)
        // Scroll to result
        setTimeout(() => {
          registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      } else {
        toast({
          title: 'Pendaftaran Gagal',
          description: result.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengirim pendaftaran',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (registrationResult?.qrCodeUrl) {
      downloadQRCode(registrationResult.qrCodeUrl, `qr-${registrationResult.name}`)
    }
  }

  const handleDownloadAvatar = () => {
    if (registrationResult?.aiPhotoUrl) {
      const link = document.createElement('a')
      link.href = registrationResult.aiPhotoUrl
      link.download = `avatar-${registrationResult.name.replace(/\s+/g, '-')}.png`
      link.click()
    }
  }

  const handleViewTicket = () => {
    if (registrationResult?.id) {
      window.open(`/ticket/${registrationResult.id}`, '_blank')
    }
  }

  const handleNewRegistration = () => {
    setRegistrationResult(null)
    setPhotoPreview(null)
    form.reset()
    setShowRegistration(false)
  }

  const scrollToRegistration = () => {
    setShowRegistration(true)
    setTimeout(() => {
      registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'important': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'update': return <Info className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5 text-[#47b2e4]" />
    }
  }

  const getAnnouncementBadge = (type: string) => {
    switch (type) {
      case 'important': return <Badge variant="destructive" className="text-xs">Penting</Badge>
      case 'warning': return <Badge className="bg-amber-500 text-xs">Perhatian</Badge>
      case 'update': return <Badge className="bg-blue-500 text-xs">Update</Badge>
      default: return <Badge variant="secondary" className="text-xs">Info</Badge>
    }
  }

  const getSponsorsByTier = (tier: string) => sponsors.filter(s => s.tier === tier)
  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'partner']
  const tierLabels: Record<string, string> = {
    platinum: 'Platinum Sponsor',
    gold: 'Gold Sponsor',
    silver: 'Silver Sponsor', 
    bronze: 'Bronze Sponsor',
    partner: 'Partner'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#47b2e4] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Memuat informasi event...</p>
        </div>
      </div>
    )
  }

  const eventData = event || {
    id: 'default',
    name: 'Tech Conference 2025',
    description: 'Acara teknologi terbesar di Indonesia dengan berbagai sesi menarik dari para ahli industri.',
    tagline: 'Innovate. Inspire. Impact.',
    primaryColor: '#10b981',
    secondaryColor: '#0d9488',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Jakarta Convention Center',
    organizer: 'Goopps Indonesia'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Event Logo */}
            {eventData.logoUrl ? (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <img 
                  src={eventData.logoUrl} 
                  alt={eventData.name} 
                  className="h-20 md:h-24 mx-auto object-contain"
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#37517e] to-[#47b2e4] mb-6 shadow-lg"
              >
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </motion.div>
            )}

            {/* Event Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4"
            >
              {eventData.name}
            </motion.h1>

            {/* Tagline */}
            {eventData.tagline && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-[#47b2e4] font-medium mb-6"
              >
                {eventData.tagline}
              </motion.p>
            )}

            {/* Event Info Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#37517e]/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#37517e]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Tanggal</p>
                    <p className="font-semibold text-slate-900 text-sm">{formatDate(eventData.date)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#47b2e4]/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#47b2e4]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Lokasi</p>
                    <p className="font-semibold text-slate-900 text-sm">{eventData.location || 'Jakarta'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Peserta</p>
                    <p className="font-semibold text-slate-900 text-sm">{stats.totalParticipants}+ Terdaftar</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Organizer</p>
                    <p className="font-semibold text-slate-900 text-sm">{eventData.organizer || 'Goopps ID'}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                size="lg" 
                onClick={scrollToRegistration}
                className="bg-gradient-to-r from-[#37517e] to-[#47b2e4] hover:from-[#37517e]/90 hover:to-[#47b2e4]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <Ticket className="mr-2 h-5 w-5" />
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-3 text-sm text-slate-500">
                Gratis! Segera daftar sebelum kuota penuh
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-12 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Pengumuman</h2>
              </div>

              <ScrollArea className="max-h-80">
                <div className="space-y-4 pr-4">
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-l-4 ${
                        announcement.type === 'important' ? 'border-l-red-500 bg-red-50/50' :
                        announcement.type === 'warning' ? 'border-l-amber-500 bg-amber-50/50' :
                        announcement.type === 'update' ? 'border-l-blue-500 bg-blue-50/50' :
                        'border-l-sky-500 bg-sky-50/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getAnnouncementIcon(announcement.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                                {getAnnouncementBadge(announcement.type)}
                                {announcement.isPinned && (
                                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                                    Pinned
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{announcement.content}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {formatDate(announcement.publishAt)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      {schedules.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#37517e]/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-[#37517e]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Agenda Acara</h2>
              </div>

              <div className="relative">
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-[#47b2e4]/30" />

                <div className="space-y-4">
                  {schedules.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-10 md:pl-14"
                    >
                      <div className="absolute left-2.5 md:left-4.5 top-4 w-3 h-3 rounded-full bg-[#47b2e4] border-2 border-white" />

                      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                            <div className="md:w-28 shrink-0">
                              <p className="font-mono text-sm text-[#47b2e4] font-semibold">
                                {formatTime(item.startTime)}
                              </p>
                              {item.endTime && (
                                <p className="font-mono text-xs text-slate-400">
                                  - {formatTime(item.endTime)}
                                </p>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                {item.speaker && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {item.speaker}
                                    {item.speakerTitle && <span className="text-slate-400">({item.speakerTitle})</span>}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      <section className="py-12 bg-gradient-to-r from-[#37517e] to-[#3d4d6a]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Tentang Event</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              {eventData.description || 'Bergabunglah dengan ribuan peserta dalam acara yang penuh inspirasi dan pengetahuan. Dapatkan kesempatan untuk belajar dari para ahli industri, memperluas jaringan profesional, dan mengambil bagian dalam diskusi yang menarik.'}
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section ref={registrationRef} className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-10 h-10 rounded-lg bg-[#37517e]/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-[#37517e]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Form Pendaftaran</h2>
            </div>

            <AnimatePresence mode="wait">
              {registrationResult ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="overflow-hidden shadow-lg">
                    {/* Success Header */}
                    <div className="bg-gradient-to-br from-[#37517e] to-[#47b2e4] p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="relative inline-block"
                      >
                        <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                          <AvatarImage src={registrationResult.aiPhotoUrl || undefined} />
                          <AvatarFallback className="text-3xl bg-white/20 text-white">
                            {registrationResult.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow">
                          <Check className="h-5 w-5 text-[#47b2e4]" />
                        </div>
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-white mt-4"
                      >
                        {registrationResult.name}
                      </motion.h3>
                      {registrationResult.company && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-[#47b2e4]/80"
                        >
                          {registrationResult.company}
                        </motion.p>
                      )}
                    </div>
                    
                    <CardHeader className="text-center pt-4">
                      <CardTitle className="text-xl text-[#37517e]">Pendaftaran Berhasil!</CardTitle>
                      <CardDescription>Tiket dan avatar AI Anda sudah siap</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* QR Code */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border">
                          <img
                            src={registrationResult.qrCodeUrl}
                            alt="QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">{registrationResult.email}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {registrationResult.qrCode}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={handleDownloadQR} variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download QR
                        </Button>
                        <Button onClick={handleDownloadAvatar} variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Avatar
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handleViewTicket} 
                        className="w-full bg-[#37517e] hover:bg-[#37517e]/90 gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Lihat Tiket Lengkap
                      </Button>
                      
                      <Button variant="outline" onClick={handleNewRegistration} className="w-full">
                        Daftar Peserta Lain
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Pendaftaran Peserta
                      </CardTitle>
                      <CardDescription>
                        Isi form di bawah untuk mendaftar dan mendapatkan QR code + avatar AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          {/* Photo Upload */}
                          <div className="flex flex-col items-center gap-4">
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="cursor-pointer group"
                            >
                              <Avatar className="h-32 w-32 border-2 border-dashed border-muted-foreground/25 group-hover:border-primary transition-colors">
                                <AvatarImage src={photoPreview || undefined} />
                                <AvatarFallback className="bg-muted">
                                  <Camera className="h-10 w-10 text-muted-foreground" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                            <p className="text-sm text-muted-foreground">
                              Klik untuk upload foto (opsional)
                            </p>
                          </div>

                          {/* Form Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nama Lengkap *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>No. Telepon *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+62 812 3456 7890" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Perusahaan/Instansi</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Acme Inc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio (untuk Avatar AI)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="AI engineer yang membangun startup teknologi..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground">
                                  Bio akan digunakan untuk generate avatar AI Anda
                                </p>
                              </FormItem>
                            )}
                          />

                          <Button type="submit" disabled={isLoading} className="w-full gap-2 bg-[#37517e] hover:bg-[#37517e]/90">
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <QrCode className="h-4 w-4" />
                                Daftar & Generate Tiket
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <section className="py-12 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Didukung Oleh</h2>

              {tierOrder.map(tier => {
                const tierSponsors = getSponsorsByTier(tier)
                if (tierSponsors.length === 0) return null

                return (
                  <div key={tier} className="mb-8">
                    <p className="text-sm text-slate-500 mb-4">{tierLabels[tier]}</p>
                    <div className="flex flex-wrap justify-center items-center gap-6">
                      {tierSponsors.map(sponsor => (
                        <a
                          key={sponsor.id}
                          href={sponsor.website || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          {sponsor.logoUrl ? (
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 object-contain" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                              {sponsor.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-slate-700">{sponsor.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-6">
              {eventData.instagram && (
                <a 
                  href={eventData.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#47b2e4] transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {eventData.twitter && (
                <a 
                  href={eventData.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#47b2e4] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {eventData.linkedin && (
                <a 
                  href={eventData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#47b2e4] transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>

            <Separator className="bg-slate-800 mb-6" />

            {/* Powered By */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">
                Powered by
              </p>
              <a 
                href="https://goopps.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo-goopps.jpg" 
                  alt="Goopps" 
                  className="h-12 w-12 rounded-full object-cover"
                />
              </a>
              <p className="text-xs text-slate-500 mt-4">
                © {new Date().getFullYear()} {eventData.organizer || 'Event Organizer'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
