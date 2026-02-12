-- Run this SQL in your Supabase SQL Editor to update the profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS restricted_kk,
ADD COLUMN IF NOT EXISTS restricted_blok TEXT,
ADD COLUMN IF NOT EXISTS restricted_nomor_rumah TEXT;

-- Ensure admin 'trisno' exists and stays admin
INSERT INTO profiles (username, password, role)
VALUES ('trisno', 'trisno123', 'admin')
ON CONFLICT (username) DO UPDATE SET role = 'admin';
