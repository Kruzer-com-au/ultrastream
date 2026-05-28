ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS ip_country TEXT;

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
