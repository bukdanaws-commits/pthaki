'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Download, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Building2,
  CheckCircle,
  Coffee,
  Utensils,
  Loader2,
  Share2,
  User,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

interface TicketData {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  bio: string | null
  photoUrl: string | null
  aiPhotoUrl: string | null
  qrCode: string
  qrCodeUrl: string | null
  isCheckedIn: boolean
  checkInTime: string | null
  checkInDesk: number | null
  foodClaims: number
  drinkClaims: number
  maxFoodClaims: number
  maxDrinkClaims: number
  foodClaimsRemaining: number
  drinkClaimsRemaining: number
  event: {
    name: string
    date: string
    location: string
  }
  claims: Array<{
    claimedAt: string
    category: string
    menuItem: { name: string }
    booth: { name: string }
  }>
}

export default function TicketPage() {
  const params = useParams()
  const participantId = params.id as string
  
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ticket/${participantId}`)
        const result = await response.json()
        
        if (result.success) {
          setTicket(result.data)
        } else {
          setError(result.error || 'Failed to load ticket')
        }
      } catch (err) {
        setError('Failed to load ticket')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (participantId) {
      fetchTicket()
    }
  }, [participantId])

  const downloadQR = () => {
    if (ticket?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = ticket.qrCodeUrl
      link.download = `qr-${ticket.name.replace(/\s+/g, '-')}.png`
      link.click()
    }
  }

  const downloadAvatar = () => {
    if (ticket?.aiPhotoUrl) {
      const link = document.createElement('a')
      link.href = ticket.aiPhotoUrl
      link.download = `avatar-${ticket.name.replace(/\s+/g, '-')}.png`
      link.click()
    }
  }

  const shareTicket = async () => {
    if (navigator.share && ticket) {
      try {
        await navigator.share({
          title: `Ticket - ${ticket.event.name}`,
          text: `My ticket for ${ticket.event.name}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#47b2e4] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground">{error || 'The ticket you are looking for does not exist.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {ticket.event.name}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(ticket.event.date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{ticket.event.location}</span>
          </div>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-xl border-0">
            {/* Avatar Section */}
            <div className="bg-gradient-to-br from-[#37517e] to-[#47b2e4] p-6 text-center">
              <div className="relative inline-block">
                {ticket.aiPhotoUrl ? (
                  <img
                    src={ticket.aiPhotoUrl}
                    alt={ticket.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
                {ticket.isCheckedIn && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow">
                    <CheckCircle className="h-6 w-6 text-[#47b2e4]" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{ticket.name}</h2>
              {ticket.company && (
                <div className="flex items-center justify-center gap-1 text-[#47b2e4]/80 mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{ticket.company}</span>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-inner inline-block">
                  {ticket.qrCodeUrl ? (
                    <img
                      src={ticket.qrCodeUrl}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center">
                      <span className="text-muted-foreground">QR Code</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  {ticket.qrCode}
                </p>
              </div>

              <Separator className="my-4" />

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{ticket.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{ticket.phone}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Claims Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Utensils className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Food Claims</p>
                  <p className="text-lg font-bold">
                    {ticket.foodClaims}/{ticket.maxFoodClaims}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {ticket.foodClaimsRemaining} remaining
                  </Badge>
                </div>
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Coffee className="h-5 w-5 mx-auto text-cyan-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Drink Claims</p>
                  <p className="text-lg font-bold">
                    {ticket.drinkClaims}/{ticket.maxDrinkClaims}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {ticket.drinkClaimsRemaining} remaining
                  </Badge>
                </div>
              </div>

              {/* Check-in Status */}
              {ticket.isCheckedIn && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-[#47b2e4]/10 dark:bg-[#47b2e4]/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-[#37517e] dark:text-[#47b2e4]">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Checked In</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(ticket.checkInTime!).toLocaleString('id-ID')} 
                      {ticket.checkInDesk && ` • Desk ${ticket.checkInDesk}`}
                    </p>
                  </div>
                </>
              )}

              {/* Recent Claims */}
              {ticket.claims.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-medium mb-2">Recent Claims</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {ticket.claims.slice(0, 5).map((claim, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {claim.category === 'Food' ? (
                              <Utensils className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Coffee className="h-4 w-4 text-cyan-600" />
                            )}
                            <span>{claim.menuItem.name}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {new Date(claim.claimedAt).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={downloadQR} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download QR
            </Button>
            <Button onClick={downloadAvatar} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Avatar
            </Button>
          </div>
          
          {navigator.share && (
            <Button onClick={shareTicket} variant="outline" className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Share Ticket
            </Button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Show this QR code at the registration desk to check in.
          <br />
          Present it at food/drink booths to claim your items.
        </motion.p>

        {/* Powered By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 pt-4 border-t border-slate-200"
        >
          <p className="text-sm text-slate-500 mb-1">Powered by</p>
          <a 
            href="https://goopps.id/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#47b2e4] hover:text-[#37517e] transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            https://goopps.id/
          </a>
        </motion.div>
      </div>
    </div>
  )
}
