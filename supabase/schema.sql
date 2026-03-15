-- Event Management System Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Event" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ,
  location TEXT,
  "isActive" BOOLEAN DEFAULT true,
  
  -- Landing Page Content
  tagline TEXT,
  "logoUrl" TEXT,
  "bannerUrl" TEXT,
  "primaryColor" TEXT DEFAULT '#37517e',
  "secondaryColor" TEXT DEFAULT '#47b2e4',
  
  -- Event Details
  organizer TEXT,
  website TEXT,
  "registrationStart" TIMESTAMPTZ,
  "registrationEnd" TIMESTAMPTZ,
  
  -- Social Links
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ADMIN USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS "AdminUser" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'panitia',
  "eventId" TEXT REFERENCES "Event"(id) ON DELETE CASCADE,
  "assignedType" TEXT,
  "assignedId" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON "AdminUser"(email);
CREATE INDEX IF NOT EXISTS "AdminUser_eventId_idx" ON "AdminUser"("eventId");

-- =====================================================
-- PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Participant" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  
  -- Personal Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  bio TEXT,
  
  -- Media Files
  "photoUrl" TEXT,
  "aiPhotoUrl" TEXT,
  "qrCode" TEXT UNIQUE NOT NULL,
  "qrCodeUrl" TEXT,
  
  -- Check-in Status
  "isCheckedIn" BOOLEAN DEFAULT false,
  "checkInTime" TIMESTAMPTZ,
  "checkInDesk" INTEGER,
  
  -- Claim Counters
  "foodClaims" INTEGER DEFAULT 0,
  "drinkClaims" INTEGER DEFAULT 0,
  
  -- Claim Limits
  "maxFoodClaims" INTEGER DEFAULT 2,
  "maxDrinkClaims" INTEGER DEFAULT 1,
  
  "lastClaimAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Participant_qrCode_idx" ON "Participant"("qrCode");
CREATE INDEX IF NOT EXISTS "Participant_email_idx" ON "Participant"(email);
CREATE INDEX IF NOT EXISTS "Participant_eventId_idx" ON "Participant"("eventId");
CREATE INDEX IF NOT EXISTS "Participant_isCheckedIn_idx" ON "Participant"("isCheckedIn");

-- =====================================================
-- CHECK-INS
-- =====================================================

CREATE TABLE IF NOT EXISTS "CheckIn" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "participantId" TEXT UNIQUE NOT NULL REFERENCES "Participant"(id) ON DELETE CASCADE,
  "deskNumber" INTEGER NOT NULL,
  "checkedInAt" TIMESTAMPTZ DEFAULT now(),
  "deviceName" TEXT,
  "operatorId" TEXT
);

CREATE INDEX IF NOT EXISTS "CheckIn_eventId_idx" ON "CheckIn"("eventId");
CREATE INDEX IF NOT EXISTS "CheckIn_participantId_idx" ON "CheckIn"("participantId");
CREATE INDEX IF NOT EXISTS "CheckIn_checkedInAt_idx" ON "CheckIn"("checkedInAt");

-- =====================================================
-- DISPLAY QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS "DisplayQueue" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "participantId" TEXT NOT NULL REFERENCES "Participant"(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  company TEXT,
  "photoUrl" TEXT,
  
  "displayOrder" INTEGER DEFAULT 0,
  "isDisplayed" BOOLEAN DEFAULT false,
  "displayDuration" INTEGER DEFAULT 5000,
  "displayedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "DisplayQueue_eventId_idx" ON "DisplayQueue"("eventId");
CREATE INDEX IF NOT EXISTS "DisplayQueue_isDisplayed_idx" ON "DisplayQueue"("isDisplayed");
CREATE INDEX IF NOT EXISTS "DisplayQueue_expiresAt_idx" ON "DisplayQueue"("expiresAt");

-- =====================================================
-- MENU CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS "MenuCategory" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "maxClaimsPerParticipant" INTEGER DEFAULT 2,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("eventId", name)
);

CREATE INDEX IF NOT EXISTS "MenuCategory_eventId_idx" ON "MenuCategory"("eventId");

-- =====================================================
-- MENU ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS "MenuItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "categoryId" TEXT NOT NULL REFERENCES "MenuCategory"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT,
  "initialStock" INTEGER DEFAULT 0,
  "currentStock" INTEGER DEFAULT 0,
  "totalClaims" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "MenuItem_eventId_idx" ON "MenuItem"("eventId");
CREATE INDEX IF NOT EXISTS "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");
CREATE INDEX IF NOT EXISTS "MenuItem_isActive_idx" ON "MenuItem"("isActive");

-- =====================================================
-- BOOTHS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Booth" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "boothType" TEXT NOT NULL,
  "boothNumber" INTEGER NOT NULL,
  "allowedCategory" TEXT,
  "totalClaims" INTEGER DEFAULT 0,
  "deviceName" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("eventId", "boothType", "boothNumber")
);

CREATE INDEX IF NOT EXISTS "Booth_eventId_idx" ON "Booth"("eventId");
CREATE INDEX IF NOT EXISTS "Booth_boothType_idx" ON "Booth"("boothType");
CREATE INDEX IF NOT EXISTS "Booth_isActive_idx" ON "Booth"("isActive");

-- =====================================================
-- CLAIMS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Claim" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "participantId" TEXT NOT NULL REFERENCES "Participant"(id) ON DELETE CASCADE,
  "menuItemId" TEXT NOT NULL REFERENCES "MenuItem"(id) ON DELETE CASCADE,
  "boothId" TEXT NOT NULL REFERENCES "Booth"(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  "claimedAt" TIMESTAMPTZ DEFAULT now(),
  "deviceName" TEXT,
  "operatorId" TEXT
);

CREATE INDEX IF NOT EXISTS "Claim_eventId_idx" ON "Claim"("eventId");
CREATE INDEX IF NOT EXISTS "Claim_participantId_idx" ON "Claim"("participantId");
CREATE INDEX IF NOT EXISTS "Claim_boothId_idx" ON "Claim"("boothId");
CREATE INDEX IF NOT EXISTS "Claim_menuItemId_idx" ON "Claim"("menuItemId");
CREATE INDEX IF NOT EXISTS "Claim_claimedAt_idx" ON "Claim"("claimedAt");
CREATE INDEX IF NOT EXISTS "Claim_category_idx" ON "Claim"(category);

-- =====================================================
-- SCAN LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS "ScanLog" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "participantId" TEXT REFERENCES "Participant"(id) ON DELETE SET NULL,
  "scanType" TEXT NOT NULL,
  "scanResult" TEXT NOT NULL,
  message TEXT,
  "boothId" TEXT,
  "deskNumber" INTEGER,
  "deviceName" TEXT,
  "operatorId" TEXT,
  "ipAddress" TEXT,
  "checkInId" TEXT UNIQUE REFERENCES "CheckIn"(id) ON DELETE SET NULL,
  "claimId" TEXT UNIQUE REFERENCES "Claim"(id) ON DELETE SET NULL,
  "scannedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ScanLog_eventId_idx" ON "ScanLog"("eventId");
CREATE INDEX IF NOT EXISTS "ScanLog_participantId_idx" ON "ScanLog"("participantId");
CREATE INDEX IF NOT EXISTS "ScanLog_scanType_idx" ON "ScanLog"("scanType");
CREATE INDEX IF NOT EXISTS "ScanLog_scanResult_idx" ON "ScanLog"("scanResult");
CREATE INDEX IF NOT EXISTS "ScanLog_scannedAt_idx" ON "ScanLog"("scannedAt");

-- =====================================================
-- EVENT STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS "EventStats" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT UNIQUE NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "totalParticipants" INTEGER DEFAULT 0,
  "totalCheckIns" INTEGER DEFAULT 0,
  "totalNotCheckedIn" INTEGER DEFAULT 0,
  "totalFoodClaims" INTEGER DEFAULT 0,
  "totalDrinkClaims" INTEGER DEFAULT 0,
  "totalClaims" INTEGER DEFAULT 0,
  "desk1CheckIns" INTEGER DEFAULT 0,
  "desk2CheckIns" INTEGER DEFAULT 0,
  "desk3CheckIns" INTEGER DEFAULT 0,
  "desk4CheckIns" INTEGER DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "EventStats_eventId_idx" ON "EventStats"("eventId");

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Announcement" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  priority INTEGER DEFAULT 0,
  "isPinned" BOOLEAN DEFAULT false,
  "showOnLanding" BOOLEAN DEFAULT true,
  "publishAt" TIMESTAMPTZ DEFAULT now(),
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Announcement_eventId_idx" ON "Announcement"("eventId");
CREATE INDEX IF NOT EXISTS "Announcement_isPinned_idx" ON "Announcement"("isPinned");
CREATE INDEX IF NOT EXISTS "Announcement_showOnLanding_idx" ON "Announcement"("showOnLanding");
CREATE INDEX IF NOT EXISTS "Announcement_publishAt_idx" ON "Announcement"("publishAt");

-- =====================================================
-- SCHEDULES
-- =====================================================

CREATE TABLE IF NOT EXISTS "Schedule" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ,
  location TEXT,
  speaker TEXT,
  "speakerTitle" TEXT,
  "order" INTEGER DEFAULT 0,
  category TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Schedule_eventId_idx" ON "Schedule"("eventId");
CREATE INDEX IF NOT EXISTS "Schedule_startTime_idx" ON "Schedule"("startTime");
CREATE INDEX IF NOT EXISTS "Schedule_category_idx" ON "Schedule"(category);

-- =====================================================
-- SPONSORS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Sponsor" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "logoUrl" TEXT,
  website TEXT,
  tier TEXT DEFAULT 'partner',
  "order" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Sponsor_eventId_idx" ON "Sponsor"("eventId");
CREATE INDEX IF NOT EXISTS "Sponsor_tier_idx" ON "Sponsor"(tier);
CREATE INDEX IF NOT EXISTS "Sponsor_isActive_idx" ON "Sponsor"("isActive");

-- =====================================================
-- SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS "Setting" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Setting_key_idx" ON "Setting"(key);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Participant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CheckIn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DisplayQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booth" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Claim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScanLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sponsor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for development (adjust for production)
CREATE POLICY "Allow all for development" ON "Event" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "AdminUser" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Participant" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "CheckIn" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "DisplayQueue" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "MenuCategory" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "MenuItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Booth" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Claim" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "ScanLog" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "EventStats" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Announcement" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Schedule" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Sponsor" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "Setting" FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updatedAt
CREATE TRIGGER update_Event_updatedAt BEFORE UPDATE ON "Event" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_AdminUser_updatedAt BEFORE UPDATE ON "AdminUser" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Participant_updatedAt BEFORE UPDATE ON "Participant" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_MenuItem_updatedAt BEFORE UPDATE ON "MenuItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Booth_updatedAt BEFORE UPDATE ON "Booth" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_EventStats_updatedAt BEFORE UPDATE ON "EventStats" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Announcement_updatedAt BEFORE UPDATE ON "Announcement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Schedule_updatedAt BEFORE UPDATE ON "Schedule" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Sponsor_updatedAt BEFORE UPDATE ON "Sponsor" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Setting_updatedAt BEFORE UPDATE ON "Setting" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
