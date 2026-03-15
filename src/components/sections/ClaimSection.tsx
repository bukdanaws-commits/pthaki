'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, Coffee, Utensils, Loader2, Camera, CameraOff, Upload, Mail, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
        setClaimResult(null)
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Utensils className="h-5 w-5 text-orange-500" />
          Claim Makanan & Minuman
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Hidden element for file scanning */}
          <div id="claim-qr-reader-hidden" style={{ display: 'none' }} />
          
          {/* Scanner Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scanner / Camera */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scan QR Code Peserta</Label>
              <div className="relative rounded-lg overflow-hidden border bg-slate-50 dark:bg-slate-900" style={{ minHeight: '200px' }}>
                {cameraAvailable === null ? (
                  <div className="w-full h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : cameraAvailable === false ? (
                  <div className="w-full h-[200px] flex flex-col items-center justify-center p-4 text-center">
                    <CameraOff className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Kamera tidak tersedia</p>
                    <p className="text-xs text-muted-foreground mt-1">Gunakan metode lain di bawah</p>
                  </div>
                ) : scannerActive ? (
                  <div id="claim-qr-reader" className={`w-full ${isProcessing ? 'opacity-50' : ''}`} />
                ) : (
                  <div 
                    className="w-full h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={startScanner}
                  >
                    <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk mulai scanner</p>
                  </div>
                )}
                
                {isProcessing && scannerActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              {/* Scanner Controls */}
              {cameraAvailable && (
                <div className="flex gap-2">
                  {scannerActive ? (
                    <Button variant="outline" size="sm" onClick={stopScanner} className="flex-1">
                      Stop Scanner
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startScanner} className="flex-1">
                      Start Scanner
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Alternative Methods */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Metode Alternatif</Label>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="manual" className="text-xs py-1">
                    <Camera className="h-3 w-3 mr-1" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs py-1">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs py-1">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="QR Code: EVT-XXXX-XXXX"
                      value={manualQrCode}
                      onChange={(e) => setManualQrCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                      className="h-9"
                    />
                    <Button size="sm" onClick={handleManualEntry} disabled={isProcessing}>
                      Cari
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full h-9"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Gambar QR
                  </Button>
                </TabsContent>

                <TabsContent value="email" className="mt-2">
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari email peserta..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {searchResults.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleEmailSelect(participant)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-[#37517e] text-white">
                                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{participant.name}</p>
                                <p className="text-xs text-muted-foreground">{participant.email}</p>
                              </div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Booth & Menu Selection - Only show when participant is scanned */}
        {scannedParticipant && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            {/* Participant Info Row */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={scannedParticipant.photoUrl || undefined} />
                <AvatarFallback className="bg-[#37517e] text-white">
                  {scannedParticipant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{scannedParticipant.name}</h3>
                <p className="text-sm text-muted-foreground">{scannedParticipant.company || scannedParticipant.email}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="text-center">
                  <p className="font-bold text-orange-600">{scannedParticipant.maxFoodClaims - scannedParticipant.foodClaims}</p>
                  <p className="text-xs text-muted-foreground">Food</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-blue-600">{scannedParticipant.maxDrinkClaims - scannedParticipant.drinkClaims}</p>
                  <p className="text-xs text-muted-foreground">Drink</p>
                </div>
              </div>
            </div>

            {/* Booth Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pilih Booth</Label>
              <div className="flex flex-wrap gap-2">
                {booths.map((booth) => (
                  <Button
                    key={booth.id}
                    variant={selectedBooth === booth.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedBooth(booth.id)
                      setSelectedMenuItem('')
                    }}
                    className={selectedBooth === booth.id ? 'bg-[#37517e]' : ''}
                  >
                    {booth.boothType === 'food' ? (
                      <Utensils className="h-4 w-4 mr-1" />
                    ) : (
                      <Coffee className="h-4 w-4 mr-1" />
                    )}
                    {booth.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pilih Menu</Label>
              <div className="flex flex-wrap gap-2">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tidak ada menu untuk booth ini</p>
                ) : (
                  filteredMenuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={selectedMenuItem === item.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMenuItem(item.id)}
                      disabled={item.currentStock === 0}
                      className={selectedMenuItem === item.id ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      {item.name}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.currentStock}
                      </Badge>
                    </Button>
                  ))
                )}
              </div>
            </div>

            {/* Claim Button */}
            <Button
              onClick={processClaim}
              disabled={!selectedMenuItem || isProcessing}
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
          </div>
        )}

        {/* Result Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead className="w-[50px]">Foto</TableHead>
                <TableHead>Nama Peserta</TableHead>
                <TableHead>Menu Item</TableHead>
                <TableHead>Booth</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claimResult && scannedParticipant ? (
                <TableRow className={claimResult.success ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={scannedParticipant.photoUrl || undefined} />
                      <AvatarFallback className="bg-[#37517e] text-white text-xs">
                        {scannedParticipant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{scannedParticipant.name}</TableCell>
                  <TableCell>
                    {claimResult.menuItem ? (
                      <span>{claimResult.menuItem.name} <Badge variant="outline" className="ml-1 text-xs">{claimResult.menuItem.category}</Badge></span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{selectedBoothData?.name || '-'}</TableCell>
                  <TableCell>
                    {claimResult.success ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sukses
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Gagal
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ) : scannedParticipant ? (
                <TableRow>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={scannedParticipant.photoUrl || undefined} />
                      <AvatarFallback className="bg-[#37517e] text-white text-xs">
                        {scannedParticipant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{scannedParticipant.name}</TableCell>
                  <TableCell className="text-muted-foreground">Pilih menu...</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell>
                    <Badge variant="outline">Pending</Badge>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Utensils className="h-10 w-10 mb-2 opacity-50" />
                      <p className="text-sm">Scan QR code untuk memulai claim</p>
                      <p className="text-xs mt-1">atau cari peserta berdasarkan email</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Message */}
        {claimResult && (
          <div className={`p-3 rounded-lg text-sm ${
            claimResult.success
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <p className="font-medium">{claimResult.message || claimResult.error}</p>
          </div>
        )}

        {/* Action Button */}
        {(scannedParticipant || claimResult) && (
          <Button
            variant="outline"
            onClick={resetScanner}
            className="w-full gap-2"
          >
            <Loader2 className="h-4 w-4" />
            Scan Peserta Lain
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
