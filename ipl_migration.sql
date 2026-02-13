-- Create app_settings table for global configurations
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default IPL amount if not exists
INSERT INTO app_settings (key, value)
VALUES ('ipl_amount', '50000')
ON CONFLICT (key) DO NOTHING;

-- Create ipl_payments table for payment history
CREATE TABLE IF NOT EXISTS ipl_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  period TEXT NOT NULL, -- e.g., '2024-02'
  status TEXT DEFAULT 'PAID',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_ipl_payments_resident_id ON ipl_payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_ipl_payments_period ON ipl_payments(period);

-- Ensure residents table has status_ipl column (already in migration, but good to double check)
ALTER TABLE residents ADD COLUMN IF NOT EXISTS status_ipl TEXT DEFAULT 'Belum Lunas';
