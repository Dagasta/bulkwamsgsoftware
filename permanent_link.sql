-- Add whatsapp_linked column to profiles to track persistent link state
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_linked BOOLEAN DEFAULT FALSE;

-- Force update it for the admin if they are already connected in memory
-- (This will be updated automatically by the new code for everyone else)
