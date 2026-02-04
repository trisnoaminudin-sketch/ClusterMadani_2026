-- Complete Migration: Add ALL missing columns to residents table
-- Run this SQL in your Supabase SQL Editor

-- This script adds all columns that might be missing from your residents table
-- The IF NOT EXISTS clause ensures it won't error if a column already exists

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
ADD COLUMN IF NOT EXISTS nominal_ipl NUMERIC,
ADD COLUMN IF NOT EXISTS status_ipl TEXT;

-- Add comments for documentation
COMMENT ON COLUMN residents.nik IS 'Nomor Induk Kependudukan';
COMMENT ON COLUMN residents.nomor_kk IS 'Nomor Kartu Keluarga';
COMMENT ON COLUMN residents.jumlah_anggota IS 'Jumlah anggota keluarga';
COMMENT ON COLUMN residents.anggota_keluarga IS 'Data anggota keluarga dalam format JSON array';
COMMENT ON COLUMN residents.status_kepemilikan_rumah IS 'Status kepemilikan rumah (Milik Sendiri, Kontrak, dll)';
