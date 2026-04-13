-- =====================================================
-- MaNu PRO — Leads Table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- Create the leads table
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contact info (from the modal form)
  name text,
  email text NOT NULL,
  phone text,
  
  -- Demographics (auto-captured from app state)
  age integer,
  retirement_age integer,
  years_in_retirement integer,
  
  -- Income & Expenses
  monthly_income numeric,
  monthly_expenses numeric,
  monthly_savings numeric,
  savings_rate numeric,
  
  -- Assets & Debts
  current_savings numeric,
  total_debt numeric,
  
  -- Magic Number
  magic_number numeric,
  mn_progress_pct numeric,
  health_score integer,
  desired_income numeric,
  social_security numeric,
  legacy_amount numeric,
  
  -- Investment context
  investment_profile text,
  
  -- App context
  tier text DEFAULT 'free',
  source_tab text,
  lang text DEFAULT 'es',
  
  -- Technical metadata
  user_agent text,
  referrer text
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT (the app sends leads without auth)
CREATE POLICY "Allow anonymous inserts" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users (admin via dashboard) can read
-- No SELECT policy for anon role = leads are private by default

-- Create index for common queries
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_email ON leads (email);
