'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, User, Loader2, RefreshCw, Camera, CameraOff, Upload, Mail, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CheckInResult {
  success: boolean
  message: string
  error?: string
  alreadyCheckedIn?: boolean
  participant?: {
    id: string
    name: string
    email: string
    company: string | null
    photoUrl: string | null
    qrCode: string
  }
}

interface ParticipantSearch {
  id: string
  name: string
  email: string
  company: string | null
  isCheckedIn: boolean
  qrCode: string
  photoUrl?: string | null
}

const CHECKIN_DESKS = [
  { id: 1, name: 'Desk 1', description: 'Main Entrance' },
  { id: 2, name: 'Desk 2', description: 'Side Entrance' },
  { id: 3, name: 'Desk 3', description: 'VIP Entrance' },
  { id: 4, name: 'Desk 4', description: 'Express Entrance' },
]

export default function CheckinSection() {
  const [selectedDesk, setSelectedDesk] = useState<number>(1)
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualQrCode, setManualQrCode] = useState('')
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  
  // New states for email search
  const [emailSearch, setEmailSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ParticipantSearch[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const html5QrCodeRef = useRef<{
    stop: () => Promise<void>
    start: (camera: string, config: object, callback: (result: string) => void) => Promise<void>
    scanFile: (file: File, originalWidth?: number, originalHeight?: number) => Promise<string>
  } | null>(null)
  const { toast } = useToast()

  const processCheckIn = useCallback(async (qrCode: string) => {
    if (isProcessing || !qrCode.trim()) return
    setIsProcessing(true)

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          deskNumber: selectedDesk,
        }),
      })

      const result: CheckInResult = await response.json()
      setScanResult(result)

      if (result.success) {
        toast({
          title: 'Check-in Berhasil!',
          description: result.message,
        })
      } else {
        toast({
          title: result.alreadyCheckedIn ? 'Sudah Check-in' : 'Check-in Gagal',
          description: result.message || result.error,
          variant: result.alreadyCheckedIn ? 'default' : 'destructive',
        })
      }
    } catch (error) {
      console.error('Check-in error:', error)
      toast({
        title: 'Error',
        description: 'Gagal memproses check-in',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, selectedDesk, toast])

  // Search participant by email
  const searchByEmail = useCallback(async (email: string) => {
    if (!email.trim() || email.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/participants/search?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      
      if (result.success) {
        setSearchResults(result.data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced email search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchByEmail(emailSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [emailSearch, searchByEmail])

  // Handle QR image upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    toast({
      title: 'Memproses QR Code...',
      description: 'Membaca gambar QR code',
    })

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('qr-reader-hidden')
      html5QrCodeRef.current = html5QrCode

      const decodedText = await html5QrCode.scanFile(file, true)
      
      toast({
        title: 'QR Code Terdeteksi!',
        description: 'Memproses check-in...',
      })
      
      await processCheckIn(decodedText)
    } catch (error) {
      console.error('QR scan error:', error)
      toast({
        title: 'QR Code Tidak Terbaca',
        description: 'Pastikan gambar mengandung QR code yang jelas',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [processCheckIn, toast])

  // Check camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (!window.isSecureContext) {
          console.log('Not a secure context, camera may not work')
          setCameraAvailable(false)
          return
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log('MediaDevices API not available')
          setCameraAvailable(false)
          return
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setCameraAvailable(true)
      } catch (error) {
        console.log('Camera not available:', error)
        setCameraAvailable(false)
      }
    }
    
    checkCamera()
  }, [])

  // Initialize QR scanner
  const startScanner = useCallback(async () => {
    if (cameraAvailable === false || scannerActive) return
    
    let mounted = true
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      if (!mounted) return
      
      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (mounted) {
            processCheckIn(decodedText)
          }
        },
        () => {}
      )
      
      if (mounted) {
        setScannerActive(true)
      }
    } catch (error) {
      console.error('Scanner init error:', error)
      if (mounted) {
        setCameraAvailable(false)
      }
    }
  }, [cameraAvailable, scannerActive, processCheckIn])

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop()
        setScannerActive(false)
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }, [scannerActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const handleManualCheckIn = () => {
    if (manualQrCode.trim()) {
      processCheckIn(manualQrCode.trim())
    }
  }

  const handleEmailCheckIn = (participant: ParticipantSearch) => {
    // Use qrCode for check-in, not id
    processCheckIn(participant.qrCode)
    setEmailSearch('')
    setSearchResults([])
  }

  const clearResult = () => {
    setScanResult(null)
    setManualQrCode('')
    setEmailSearch('')
    setSearchResults([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Scanner
          </CardTitle>
          <CardDescription>
            Scan QR code atau gunakan metode alternatif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desk Selection */}
          <div className="space-y-3">
            <Label>Pilih Loket Check-in</Label>
            <div className="grid grid-cols-2 gap-2">
              {CHECKIN_DESKS.map((desk) => (
                <div
                  key={desk.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDesk === desk.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDesk(desk.id)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedDesk === desk.id ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {selectedDesk === desk.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{desk.name}</p>
                    <p className="text-xs text-muted-foreground">{desk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden element for file scanning */}
          <div id="qr-reader-hidden" style={{ display: 'none' }} />

          {/* Scanner Area */}
          <div className="relative">
            {cameraAvailable === null ? (
              <div className="w-full h-[280px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cameraAvailable === false ? (
              <div className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border p-4 text-center">
                <CameraOff className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Kamera Tidak Tersedia</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gunakan metode alternatif di bawah
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">Upload QR</Badge>
                  <Badge variant="outline">Cari Email</Badge>
                </div>
              </div>
            ) : scannerActive ? (
              <div
                id="qr-reader"
                className={`w-full overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800 ${isProcessing ? 'opacity-50' : ''}`}
                style={{ minHeight: '280px' }}
              />
            ) : (
              <div 
                className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={startScanner}
              >
                <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Klik untuk Mulai Scanner</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Akses kamera diperlukan
                </p>
              </div>
            )}
            
            {isProcessing && scannerActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          {cameraAvailable && (
            <div className="flex gap-2">
              {scannerActive ? (
                <Button variant="outline" onClick={stopScanner} className="flex-1">
                  Stop Scanner
                </Button>
              ) : (
                <Button variant="outline" onClick={startScanner} className="flex-1">
                  Start Scanner
                </Button>
              )}
            </div>
          )}

          {/* Alternative Methods Tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Upload QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">
                <Camera className="h-3 w-3 mr-1" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Upload QR Image */}
            <TabsContent value="upload" className="mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Upload Gambar QR Code</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full h-20 border-dashed"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">
                      {isProcessing ? 'Memproses...' : 'Klik untuk upload gambar QR'}
                    </span>
                  </div>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Format: JPG, PNG, WEBP
                </p>
              </div>
            </TabsContent>

            {/* Manual QR Entry */}
            <TabsContent value="manual" className="mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Masukkan Kode QR Manual</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Contoh: HKI-2025-0001"
                    value={manualQrCode}
                    onChange={(e) => setManualQrCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()}
                  />
                  <Button onClick={handleManualCheckIn} disabled={isProcessing}>
                    Check In
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: HKI-2025-XXXX (contoh: HKI-2025-0001)
                </p>
              </div>
            </TabsContent>

            {/* Email Search */}
            <TabsContent value="email" className="mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Cari Peserta berdasarkan Email</Label>
                <div className="relative">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Masukkan email peserta..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="pl-10"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleEmailCheckIn(participant)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">{participant.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.isCheckedIn && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Sudah Check-in
                              </Badge>
                            )}
                            <Button size="sm" variant="ghost">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No results */}
                  {emailSearch.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Tidak ada peserta dengan email "{emailSearch}"
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Scan Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {scanResult ? (
              scanResult.success || scanResult.alreadyCheckedIn ? (
                <>
                  {scanResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <User className="h-5 w-5 text-yellow-500" />
                  )}
                  Hasil Check-in
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Error
                </>
              )
            ) : (
              <>
                <User className="h-5 w-5" />
                Hasil Check-in
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <div className="space-y-4">
              {scanResult.participant && (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={scanResult.participant.photoUrl || undefined} />
                    <AvatarFallback className="text-lg bg-[#37517e] text-white">
                      {scanResult.participant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {scanResult.participant.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {scanResult.participant.company || 'Tidak ada perusahaan'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scanResult.participant.email}
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-lg ${
                  scanResult.success
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : scanResult.alreadyCheckedIn
                    ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                <p className="font-medium">{scanResult.message || scanResult.error}</p>
              </div>

              <Button
                variant="outline"
                onClick={clearResult}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Scan Peserta Lain
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Scan QR code untuk melihat info peserta</p>
              <p className="text-sm mt-2">atau gunakan Email untuk mencari</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
