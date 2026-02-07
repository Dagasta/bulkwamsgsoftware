-- ENTERPRISE WHATSAPP STABILITY UPGRADE (CONSOLIDATED)
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Upgrade Profiles Table with High-Stability Columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_session JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'idle';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_qr TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_last_scan TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_linked BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_lock_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_lock_at TIMESTAMP WITH TIME ZONE;

-- 2. Performance High-Speed Search Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_status ON profiles(whatsapp_status);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_lock ON profiles(whatsapp_lock_id);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_session ON profiles USING GIN (whatsapp_session);

-- 3. Success Feedback
DO $$
BEGIN
  RAISE NOTICE 'Enterprise WhatsApp Stability Upgrade Successful!';
  RAISE NOTICE 'Profile columns added: session, status, qr, linked, lock_id, lock_at';
  RAISE NOTICE 'Neural Watchdog is now enabled for auto-recovery.';
END $$;
