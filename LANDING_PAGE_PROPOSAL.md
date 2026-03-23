# 🎪 Event Microsite - Landing Page Proposal

## Halaman yang Dibuat

### 1. Landing Page Utama (/)
- Hero section dengan branding event
- Countdown timer
- Quick stats
- CTA "Register Now"

### 2. Microsite (/event)
- Full event information
- Schedule/agenda
- Announcements
- Sponsors
- Venue map
- Contact info

### 3. Registration (/register)
- Registration form
- Photo upload
- Bio untuk AI avatar

### 4. Ticket (/ticket/[id])
- Personal ticket page
- QR code
- AI Avatar
- Claim status

---

## Proposed Sections untuk Landing Page

```
┌────────────────────────────────────────────────────────────────┐
│                     HEADER / NAVBAR                            │
│  [Logo]    Home | Event Info | Register | Already Registered?  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    HERO SECTION                                │
│                                                                │
│            🎉 GATHERING PT HKI 2026 🎉                         │
│                                                                │
│           "Gathering Bersama Menuju Masa Depan"                │
│                                                                │
│              [📅 20 September 2026]                            │
│              [📍 Grand Ballroom, Hotel Mulia]                  │
│                                                                │
│           ┌─────────────────────────┐                          │
│           │  ⏰ COUNTDOWN TIMER     │                          │
│           │   180 : 15 : 42 : 30    │                          │
│           │  Days  Hrs  Min   Sec   │                          │
│           └─────────────────────────┘                          │
│                                                                │
│           [🚀 REGISTER NOW]  [ℹ️ Event Info]                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    QUICK STATS                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │  2000   │  │   6     │  │   4     │  │   3     │          │
│   │ Peserta │  │ Booth   │  │ Meja    │  │ Kategori│          │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                  EVENT HIGHLIGHTS                              │
│                                                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│   │    🎤       │  │    🍽️        │  │    🎁        │        │
│   │   Keynote    │  │   Food &     │  │   Door       │        │
│   │   Speakers   │  │   Drinks     │  │   Prizes     │        │
│   └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    📢 PENGUMUMAN                                │
│                                                                │
│   ┌──────────────────────────────────────────────────────┐    │
│   │ 📌 Pendaftaran dibuka hingga 15 September 2026       │    │
│   │ 📌 Temukan AI Avatar unik Anda saat registrasi       │    │
│   │ 📌 Jangan lupa scan QR saat tiba di venue            │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    📅 JADWAL ACARA                              │
│                                                                │
│   ┌──────────────────────────────────────────────────────┐    │
│   │ 08:00 - 09:00  │ Registration & Check-in             │    │
│   │ 09:00 - 10:00  │ Opening Ceremony                     │    │
│   │ 10:00 - 12:00  │ Keynote Speaker                      │    │
│   │ 12:00 - 13:30  │ Lunch Break                          │    │
│   │ 13:30 - 15:00  │ Networking Session                   │    │
│   │ 15:00 - 17:00  │ Games & Doorprize                    │    │
│   │ 17:00 - 18:00  │ Closing                              │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    🏢 SPONSORS                                 │
│                                                                │
│   [Logo 1]  [Logo 2]  [Logo 3]  [Logo 4]  [Logo 5]           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    📍 VENUE INFO                               │
│                                                                │
│   ┌────────────────────────────────────────────────────┐      │
│   │     Grand Ballroom, Hotel Mulia                    │      │
│   │     Jl. Asia Afrika, Jakarta Pusat                 │      │
│   │     [VIEW MAP]                                     │      │
│   └────────────────────────────────────────────────────┘      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    📞 CONTACT                                  │
│                                                                │
│   📧 event@pthki.co.id    📱 +62 812-xxxx-xxxx               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                     FOOTER                                     │
│  © 2026 PT Harapan Kita Indonesia. All rights reserved.       │
└────────────────────────────────────────────────────────────────┘
```

---

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User buka URL event (landing page)                          │
│           │                                                     │
│           ▼                                                     │
│  2. Lihat info event, countdown, pengumuman                     │
│           │                                                     │
│           ▼                                                     │
│  3. Klik "Register Now"                                         │
│           │                                                     │
│           ▼                                                     │
│  4. Isi form registrasi                                         │
│     - Nama, Email, Phone, Company                               │
│     - Bio (untuk AI avatar)                                     │
│     - Upload foto (optional)                                    │
│           │                                                     │
│           ▼                                                     │
│  5. Submit registrasi                                           │
│           │                                                     │
│           ▼                                                     │
│  6. Sistem generate:                                            │
│     - QR Code unik                                              │
│     - AI Avatar                                                 │
│     - Mock avatar (fallback)                                    │
│           │                                                     │
│           ▼                                                     │
│  7. Redirect ke halaman Ticket                                  │
│     - Tampilkan avatar, QR                                      │
│     - Download button                                           │
│           │                                                     │
│           ▼                                                     │
│  8. User simpan QR code (screenshot/download)                   │
│                                                                 │
│  ==================== HARI EVENT ====================           │
│                                                                 │
│  9. User datang ke venue                                        │
│           │                                                     │
│           ▼                                                     │
│  10. Scan QR di meja check-in (1-4)                             │
│           │                                                     │
│           ▼                                                     │
│  11. AI Avatar tampil di monitor welcome                        │
│           │                                                     │
│           ▼                                                     │
│  12. User klaim makanan/minuman di booth                        │
│       (max 2 food, 1 drink)                                     │
│           │                                                     │
│           ▼                                                     │
│  13. Selesai                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data yang Diperlukan

### Dari User (Registrasi):
| Field | Required | Keterangan |
|-------|----------|------------|
| Nama | ✅ | Nama lengkap |
| Email | ✅ | Email aktif |
| Phone | ✅ | Nomor HP |
| Company | ❌ | Nama perusahaan |
| Bio | ❌ | Untuk generate AI avatar |
| Photo | ❌ | Foto opsional |

### Dari Event Organizer:
| Data | Keterangan |
|------|------------|
| Nama event | Gathering PT HKI |
| Tanggal | 20 September 2026 |
| Lokasi | Grand Ballroom, Hotel Mulia |
| Max peserta | 2000 |
| Max food claims | 2 per peserta |
| Max drink claims | 1 per peserta |
| Logo | Perlu upload |
| Sponsors | Perlu daftar sponsor |
| Pengumuman | Perlu konten |

---

## Pertanyaan untuk Anda:

1. **Apakah mockup landing page di atas sudah sesuai?**
   - Ada yang perlu ditambah/dihapus?

2. **Warna tema:**
   - Tetap Emerald/Teal?
   - Atau ada warna branding khusus PT HKI?

3. **Logo:**
   - Apakah sudah ada logo PT HKI?
   - Perlu dibuatkan placeholder?

4. **Sponsor:**
   - Apakah ada sponsor yang ditampilkan?

5. **Apakah perlu halaman terpisah untuk:**
   - Schedule/jadwal detail?
   - Speaker profiles?
   - Venue map?

---

Setelah Anda konfirmasi, saya akan implementasikan landing page dan microsite-nya.
