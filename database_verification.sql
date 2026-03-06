-- Supabase Complete Verification & Migration Script
-- Purpose: Ensures all necessary tables and columns exist for Cluster Madani application.
-- Run this in your Supabase SQL Editor.

-- 1. Create app_settings table
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

-- 2. Create residents table (if not exists)
CREATE TABLE IF NOT EXISTS residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nik TEXT,
  nomor_kk TEXT,
  nama TEXT,
  no_hp_kepala TEXT,
  jumlah_anggota INTEGER DEFAULT 0,
  anggota_keluarga JSONB DEFAULT '[]'::jsonb,
  jenis_kelamin TEXT,
  tanggal_lahir DATE,
  alamat TEXT,
  nomor_rumah TEXT,
  blok_rumah TEXT,
  rt TEXT,
  rw TEXT,
  status_kepemilikan_rumah TEXT,
  pekerjaan TEXT,
  status_perkawinan TEXT,
  nominal_ipl NUMERIC DEFAULT 0,
  status_ipl TEXT DEFAULT 'Belum Lunas',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist in residents if table already exists
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS nik TEXT,
ADD COLUMN IF NOT EXISTS nomor_kk TEXT,
ADD COLUMN IF NOT EXISTS nama TEXT,
ADD COLUMN IF NOT EXISTS no_hp_kepala TEXT,
ADD COLUMN IF NOT EXISTS jumlah_anggota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS anggota_keluarga JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT,
ADD COLUMN IF NOT EXISTS tanggal_lahir DATE,
ADD COLUMN IF NOT EXISTS alamat TEXT,
ADD COLUMN IF NOT EXISTS nomor_rumah TEXT,
ADD COLUMN IF NOT EXISTS blok_rumah TEXT,
ADD COLUMN IF NOT EXISTS rt TEXT,
ADD COLUMN IF NOT EXISTS rw TEXT,
ADD COLUMN IF NOT EXISTS status_kepemilikan_rumah TEXT,
ADD COLUMN IF NOT EXISTS pekerjaan TEXT,
ADD COLUMN IF NOT EXISTS status_perkawinan TEXT,
ADD COLUMN IF NOT EXISTS nominal_ipl NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS status_ipl TEXT DEFAULT 'Belum Lunas';

-- 3. Create ipl_payments table
CREATE TABLE IF NOT EXISTS ipl_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  period TEXT NOT NULL, -- e.g., '2024-02'
  status TEXT DEFAULT 'PAID',
  proof_url TEXT, -- URL to the payment confirmation image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist in ipl_payments (idempotency)
ALTER TABLE ipl_payments ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE ipl_payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PAID';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ipl_payments_resident_id ON ipl_payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_ipl_payments_period ON ipl_payments(period);

-- 4. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  restricted_blok TEXT,
  restricted_nomor_rumah TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure admin 'trisno' exists
INSERT INTO profiles (username, password, role)
VALUES ('trisno', 'trisno123', 'admin')
ON CONFLICT (username) DO UPDATE SET role = 'admin';

-- 5. Storage Setup (Note: Bucket creation usually needs to be done via Supabase Dashboard or API)
-- This is a hint for the user or can be run if the extension is enabled
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('payment-proofs', 'payment-proofs', true)
-- ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE residents IS 'Data utama warga Cluster Madani';
COMMENT ON TABLE app_settings IS 'Pengaturan aplikasi global';
COMMENT ON TABLE ipl_payments IS 'Riwayat pembayaran IPL';
COMMENT ON TABLE profiles IS 'Data login admin dan warga';
COMMENT ON COLUMN ipl_payments.proof_url IS 'Link bukti transfer pembayaran';
