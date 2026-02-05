-- Supabase Schema for Voppi Arena de Roleplay Comercial
-- Execute this script in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS PROFILE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SCENARIOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  duration TEXT,
  icon TEXT,
  skills TEXT[],
  nodes JSONB NOT NULL DEFAULT '{}',
  start_node_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scenarios
CREATE POLICY "Anyone can view active scenarios" ON scenarios
  FOR SELECT USING (is_active = true OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can insert scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete scenarios" ON scenarios
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- ============================================
-- ATTEMPTS TABLE (Training Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  score_strategy INTEGER DEFAULT 0,
  score_clarity INTEGER DEFAULT 0,
  score_tone INTEGER DEFAULT 0,
  score_diagnosis INTEGER DEFAULT 0,
  score_closing INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('success', 'partial', 'failure')),
  choice_history JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attempts
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON attempts
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- OBJECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS objections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  objection TEXT NOT NULL,
  category TEXT NOT NULL,
  response1 TEXT NOT NULL,
  response2 TEXT,
  strategic_objective TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objections
CREATE POLICY "Anyone can view active objections" ON objections
  FOR SELECT USING (is_active = true OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can insert objections" ON objections
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update objections" ON objections
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete objections" ON objections
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- ============================================
-- USER_BADGES TABLE (Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all earned badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- ============================================
-- WEEKLY CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_scenario_id UUID REFERENCES scenarios(id),
  target_score INTEGER,
  target_completions INTEGER,
  xp_reward INTEGER DEFAULT 100,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON weekly_challenges
  FOR SELECT USING (is_active = true OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can manage challenges" ON weekly_challenges
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default badges
INSERT INTO badges (name, description, icon) VALUES
  ('Primeiro Roleplay', 'Completou seu primeiro roleplay', '🎯'),
  ('Abertura Forte', 'Nota máxima em abertura', '💪'),
  ('Diagnóstico Ninja', 'Identificou 10 dores do cliente', '🥷'),
  ('Mestre das Objeções', 'Contornou 20 objeções com sucesso', '🛡️'),
  ('Fechador', 'Fechou 10 vendas na simulação', '🤝'),
  ('Streak Semanal', 'Completou roleplay todos os dias da semana', '🔥'),
  ('Top 3', 'Entrou no top 3 do ranking', '🏆'),
  ('Perfeição', 'Completou um roleplay com 100%', '⭐')
ON CONFLICT DO NOTHING;

-- Create admin user (run after creating user via auth)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@voppi.com';

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update user points after attempt
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_points = total_points + NEW.total_score,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update level based on points
  UPDATE profiles
  SET level = CASE
    WHEN total_points >= 2000 THEN 5
    WHEN total_points >= 1500 THEN 4
    WHEN total_points >= 1000 THEN 3
    WHEN total_points >= 500 THEN 2
    ELSE 1
  END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_attempt_completed
  AFTER INSERT ON attempts
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  total_points INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.total_points DESC) as rank,
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.total_points,
    p.level
  FROM profiles p
  ORDER BY p.total_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
