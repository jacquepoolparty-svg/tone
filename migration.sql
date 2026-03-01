-- TONE Migration SQL
-- Run this in the Supabase dashboard SQL editor:
-- https://supabase.com/dashboard/project/hpiujjvmuhwkvfndmxsl/sql

-- Workspaces table
CREATE TABLE IF NOT EXISTS tone_workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  owner_id text,
  industry text,
  platforms jsonb DEFAULT '[]',
  brand_dna jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tone users table
CREATE TABLE IF NOT EXISTS tone_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  workspace_id uuid REFERENCES tone_workspaces(id),
  role text DEFAULT 'owner',
  created_at timestamptz DEFAULT now()
);

-- Tone social posts table
CREATE TABLE IF NOT EXISTS tone_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES tone_workspaces(id),
  platform text NOT NULL,
  caption text,
  media_url text,
  scheduled_for timestamptz,
  posted_at timestamptz,
  status text DEFAULT 'draft',
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content pillars table
CREATE TABLE IF NOT EXISTS tone_pillars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES tone_workspaces(id),
  name text NOT NULL,
  description text,
  frequency_per_week int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Seed Pool Party workspace
INSERT INTO tone_workspaces (id, name, slug, owner_id, industry, platforms, brand_dna)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Pool Party',
  'pool-party',
  'jacque',
  'Creative Agency',
  '["instagram", "linkedin", "tiktok"]',
  '{
    "voice": {
      "formal_casual": 30,
      "serious_playful": 35,
      "corporate_human": 80,
      "reserved_bold": 75
    },
    "wordsToUse": ["cinematic", "elevated", "direct", "sharp", "cultural"],
    "wordsToAvoid": ["synergy", "crushing it", "awesome", "storytelling", "journey"],
    "examplePostLove": "Run Day started as a Sunday ritual — 3 friends, South Sydney, no plan. Five years later we had 500 people showing up every week.",
    "examplePostHate": "So excited to share our amazing storytelling journey! We are crushing it every single day! Awesome content incoming!",
    "targetAudience": "Brand founders, CMOs, and creative directors in Australia who want commercially sharp creative work, not generic content.",
    "visualStyle": ["cinematic", "moody"],
    "brandColours": ["#0D0D0D", "#24AD94", "#F5C842"],
    "referenceAccounts": ["@acnestudios", "@bottegaveneta", "@nicechapel"]
  }'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Pool Party pillars
INSERT INTO tone_pillars (workspace_id, name, description, frequency_per_week)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Client Work', 'Campaigns, films, and production we''ve delivered', 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Behind the Lens', 'BTS of shoots, process, craft', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Industry POV', 'Sharp takes on creative, brand, and culture', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'South Sydney', 'Community, roots, where we come from', 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Team', 'The people behind the work', 1)
ON CONFLICT DO NOTHING;

-- Seed Pool Party user
INSERT INTO tone_users (email, password_hash, workspace_id, role)
VALUES ('leo@poolparty.com.au', '$2b$10$placeholder_hash', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Seed some posts
INSERT INTO tone_posts (workspace_id, platform, caption, scheduled_for, status, created_by)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'instagram', 'Run Day started as a Sunday ritual. Three friends. South Sydney. No plan. Five years later: 500 people showing up every week. Community doesn''t need a product. It needs a reason to exist.', '2026-03-03 09:00:00+00', 'scheduled', 'Jacque'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'linkedin', 'The brief said "make it feel premium." Our question back: premium for who? That''s where the work actually starts. Not in the edit suite. In the strategy room.', '2026-03-04 08:00:00+00', 'scheduled', 'Jacque'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'instagram', 'Client came to us with a 60-second brief. We gave them a content system. Six films. Twelve social assets. A sonic identity. The 60 seconds was the last thing we made.', '2026-03-05 09:00:00+00', 'draft', 'Jacque')
ON CONFLICT DO NOTHING;
