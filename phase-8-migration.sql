-- Add certification columns to scenarios
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS min_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}';

-- Update existing scenarios with the new roadmap logic
UPDATE scenarios SET min_level = 1 WHERE slug = 'restaurante-gatekeeper';
UPDATE scenarios SET min_level = 3, prerequisites = ARRAY['restaurante-gatekeeper'] WHERE slug = 'restaurante-decisor';
UPDATE scenarios SET min_level = 5, prerequisites = ARRAY['restaurante-decisor'] WHERE slug = 'parque-atracao';
