-- =====================================================
-- MaNu PRO — Analytics Events Table
-- Run in Supabase SQL Editor
-- =====================================================

CREATE TABLE analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  event text NOT NULL,
  props jsonb DEFAULT '{}'::jsonb,
  session_id text,
  lang text DEFAULT 'es',
  tier text DEFAULT 'free',
  user_agent text,
  referrer text
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_events_created_at ON analytics_events (created_at DESC);
CREATE INDEX idx_events_event ON analytics_events (event);
