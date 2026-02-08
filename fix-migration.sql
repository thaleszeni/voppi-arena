-- ============================================
-- MIGRATION: FIX PHASE 5 & 6 SCHEMA
-- ============================================

-- 1. Ensure Profiles table has all gamification columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_level_xp INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_play_date TIMESTAMP WITH TIME ZONE;

-- 2. Fix Attempts table schema
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS scenario_slug TEXT,
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_strategy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_clarity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_tone INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_diagnosis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_closing INTEGER DEFAULT 0;

-- 3. Fix Scenarios RLS (Robust Admin Policy)
DROP POLICY IF EXISTS "Admins can insert scenarios" ON scenarios;
DROP POLICY IF EXISTS "Admins can update scenarios" ON scenarios;
DROP POLICY IF EXISTS "Admins can delete scenarios" ON scenarios;

CREATE POLICY "Admins can manage scenarios" ON scenarios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Set admin role for current user (example)
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
