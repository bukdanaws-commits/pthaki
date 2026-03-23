'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Download, Loader2, QrCode, User, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { registrationSchema, RegistrationFormData } from '@/lib/validations'
import { downloadQRCode } from '@/lib/qrcode'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface RegistrationResult {
  id: string
  name: string
  email: string
  company?: string
  qrCode: string
  qrCodeUrl: string
  aiPhotoUrl?: string
}

export default function RegistrationSection() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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
          title: 'Registration Successful!',
          description: `Welcome, ${result.data.name}! Your ticket is ready.`,
        })
        form.reset()
        setPhotoPreview(null)
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit registration',
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
      router.push(`/ticket/${registrationResult.id}`)
    }
  }

  const handleNewRegistration = () => {
    setRegistrationResult(null)
    setPhotoPreview(null)
    form.reset()
  }

  if (registrationResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="w-full max-w-2xl mx-auto overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center">
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
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mt-4"
            >
              {registrationResult.name}
            </motion.h2>
            {registrationResult.company && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-emerald-100"
              >
                {registrationResult.company}
              </motion.p>
            )}
          </div>
          
          <CardHeader className="text-center pt-4">
            <CardTitle className="text-xl text-emerald-600">Registration Complete!</CardTitle>
            <CardDescription>Your ticket and AI avatar have been generated</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <img
                  src={registrationResult.qrCodeUrl}
                  alt="QR Code"
                  className="w-52 h-52"
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Ticket
            </Button>
            
            <Button variant="outline" onClick={handleNewRegistration} className="w-full">
              New Registration
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Participant Registration
        </CardTitle>
        <CardDescription>
          Register for the event and get your unique QR code + AI avatar
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
                Click to upload photo (optional)
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
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
                    <FormLabel>Phone Number *</FormLabel>
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
                    <FormLabel>Company</FormLabel>
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
                  <FormLabel>Bio (for AI Avatar)</FormLabel>
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
                    Bio will be used to generate your AI avatar
                  </p>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Avatar & Ticket...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Register & Generate Ticket
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
