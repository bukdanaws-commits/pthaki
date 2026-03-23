'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, Coffee, Utensils, Loader2, RefreshCw, Camera, CameraOff, Upload, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Participant {
  id: string
  qrCode: string
  name: string
  email: string
  company: string | null
  photoUrl: string | null
  foodClaims: number
  drinkClaims: number
  maxFoodClaims: number
  maxDrinkClaims: number
  remainingFoodClaims?: number
  remainingDrinkClaims?: number
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

interface MenuItem {
  id: string
  name: string
  description: string | null
  category: {
    id: string
    name: string
  }
  currentStock: number
}

interface Booth {
  id: string
  name: string
  boothType: string
  boothNumber: number
}

interface ClaimResult {
  success: boolean
  message: string
  participant?: Participant
  menuItem?: {
    id: string
    name: string
    category: string
  }
  remainingFoodClaims?: number
  remainingDrinkClaims?: number
  error?: string
}

export default function ClaimSection() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [selectedBooth, setSelectedBooth] = useState<string>('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('')
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null)
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [manualQrCode, setManualQrCode] = useState('')
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  
  // Email search states
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

  // Fetch booths and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [boothsRes, menuRes] = await Promise.all([
          fetch('/api/booths'),
          fetch('/api/menu'),
        ])
        
        const boothsData = await boothsRes.json()
        const menuData = await menuRes.json()
        
        if (boothsData.success) {
          setBooths(boothsData.data)
          if (boothsData.data.length > 0) {
            setSelectedBooth(boothsData.data[0].id)
          }
        }
        
        if (menuData.success) {
          setMenuItems(menuData.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast({
          title: 'Error',
          description: 'Gagal memuat data booth dan menu',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  // Check camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (!window.isSecureContext) {
          setCameraAvailable(false)
          return
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraAvailable(false)
          return
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setCameraAvailable(true)
      } catch (error) {
        setCameraAvailable(false)
      }
    }
    
    checkCamera()
  }, [])

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

  const scanParticipant = useCallback(async (qrCode: string) => {
    if (isProcessing || !qrCode.trim()) return
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/participants/${encodeURIComponent(qrCode)}`)
      const result = await response.json()

      if (result.success) {
        setScannedParticipant(result.data)
        toast({
          title: 'Peserta Ditemukan',
          description: result.data.name,
        })
      } else {
        toast({
          title: 'Tidak Ditemukan',
          description: 'Peserta tidak ditemukan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Scan error:', error)
      toast({
        title: 'Error',
        description: 'Gagal memindai peserta',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, toast])

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
      const html5QrCode = new Html5Qrcode('claim-qr-reader-hidden')
      html5QrCodeRef.current = html5QrCode

      const decodedText = await html5QrCode.scanFile(file, true)
      
      toast({
        title: 'QR Code Terdeteksi!',
        description: 'Mencari peserta...',
      })
      
      await scanParticipant(decodedText)
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
  }, [scanParticipant, toast])

  // Initialize QR scanner
  const startScanner = useCallback(async () => {
    if (cameraAvailable === false || scannerActive) return
    
    let mounted = true
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      if (!mounted) return
      
      const html5QrCode = new Html5Qrcode('claim-qr-reader')
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
            scanParticipant(decodedText)
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
  }, [cameraAvailable, scannerActive, scanParticipant])

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

  const processClaim = async () => {
    if (!scannedParticipant || !selectedBooth || !selectedMenuItem) {
      toast({
        title: 'Informasi Kurang',
        description: 'Pilih booth dan menu item',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: scannedParticipant.qrCode,
          boothId: selectedBooth,
          menuItemId: selectedMenuItem,
        }),
      })

      const result: ClaimResult = await response.json()
      setClaimResult(result)

      if (result.success) {
        toast({
          title: 'Claim Berhasil',
          description: result.message,
        })
        if (result.participant) {
          setScannedParticipant({
            ...scannedParticipant,
            ...result.participant,
          })
        }
      } else {
        toast({
          title: 'Claim Gagal',
          description: result.error || result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Claim error:', error)
      toast({
        title: 'Error',
        description: 'Gagal memproses claim',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetScanner = () => {
    setScannedParticipant(null)
    setClaimResult(null)
    setSelectedMenuItem('')
    setManualQrCode('')
    setEmailSearch('')
    setSearchResults([])
  }

  const handleManualEntry = () => {
    if (manualQrCode.trim()) {
      scanParticipant(manualQrCode.trim())
    }
  }

  const handleEmailSelect = (participant: ParticipantSearch) => {
    // Use qrCode for scanning, not id
    scanParticipant(participant.qrCode)
    setEmailSearch('')
    setSearchResults([])
  }

  const selectedBoothData = booths.find((b) => b.id === selectedBooth)
  const filteredMenuItems = menuItems.filter(
    (m) => m.category.name.toLowerCase() === selectedBoothData?.boothType
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Scanner / Participant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {scannedParticipant ? 'Peserta' : 'Scan QR Code'}
          </CardTitle>
          <CardDescription>
            {scannedParticipant
              ? 'Pilih menu item dan proses claim'
              : 'Scan QR code peserta untuk claim makanan/minuman'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scannedParticipant ? (
            <div className="space-y-4">
              {/* Participant Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={scannedParticipant.photoUrl || undefined} />
                  <AvatarFallback className="text-lg bg-[#37517e] text-white">
                    {scannedParticipant.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{scannedParticipant.name}</h3>
                  <p className="text-muted-foreground">
                    {scannedParticipant.company || 'Tidak ada perusahaan'}
                  </p>
                </div>
              </div>

              {/* Claim Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Food Claims</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {scannedParticipant.remainingFoodClaims ?? scannedParticipant.maxFoodClaims - scannedParticipant.foodClaims}/
                    {scannedParticipant.maxFoodClaims}
                  </p>
                  <p className="text-xs text-muted-foreground">sisa</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Coffee className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Drink Claims</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {scannedParticipant.remainingDrinkClaims ?? scannedParticipant.maxDrinkClaims - scannedParticipant.drinkClaims}/
                    {scannedParticipant.maxDrinkClaims}
                  </p>
                  <p className="text-xs text-muted-foreground">sisa</p>
                </div>
              </div>

              <Button variant="outline" onClick={resetScanner} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Scan Peserta Lain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hidden element for file scanning */}
              <div id="claim-qr-reader-hidden" style={{ display: 'none' }} />
              
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
                    id="claim-qr-reader"
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
                        onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                      />
                      <Button onClick={handleManualEntry} disabled={isProcessing}>
                        Cari
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
                              onClick={() => handleEmailSelect(participant)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-[#37517e] text-white">
                                    {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{participant.name}</p>
                                  <p className="text-xs text-muted-foreground">{participant.email}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Booth & Menu Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Proses Claim</CardTitle>
          <CardDescription>Pilih booth dan menu item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booth Selection */}
          <div className="space-y-3">
            <Label>Pilih Booth</Label>
            <div className="grid grid-cols-3 gap-2">
              {booths.map((booth) => (
                <div
                  key={booth.id}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBooth === booth.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBooth(booth.id)}
                >
                  {booth.boothType === 'food' ? (
                    <Utensils className="h-5 w-5 mb-1 text-orange-500" />
                  ) : (
                    <Coffee className="h-5 w-5 mb-1 text-[#47b2e4]" />
                  )}
                  <span className="text-sm font-medium text-center">{booth.name}</span>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {booth.boothType}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            <Label>Pilih Menu Item</Label>
            <ScrollArea className="h-64 rounded-lg border">
              <div className="p-2 space-y-2">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Tidak ada item tersedia untuk tipe booth ini
                  </p>
                ) : (
                  filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMenuItem === item.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      } ${item.currentStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (item.currentStock > 0) {
                          setSelectedMenuItem(item.id)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={item.currentStock > 0 ? 'secondary' : 'destructive'}>
                          Stok: {item.currentStock}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Claim Result */}
          {claimResult && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                claimResult.success
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {claimResult.success ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{claimResult.message || claimResult.error}</p>
                {claimResult.menuItem && (
                  <p className="text-sm mt-1">
                    Item: {claimResult.menuItem.name} ({claimResult.menuItem.category})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Process Claim Button */}
          <Button
            onClick={processClaim}
            disabled={!scannedParticipant || !selectedBooth || !selectedMenuItem || isProcessing}
            className="w-full bg-[#37517e] hover:bg-[#37517e]/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Proses Claim'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
