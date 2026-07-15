-- =====================================================
-- MaNu PRO — Migración W56: columnas UTM en leads
-- Correr en Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Nota: si esta migración NO se corre, la app sigue funcionando:
-- submitLead detecta el error de columna y guarda el lead sin UTMs
-- (un lead nunca se pierde por atribución). Pero sin esto no sabemos
-- qué video/campaña produjo cada lead.
-- =====================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text;

CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads (utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads (utm_campaign);

-- =====================================================
-- Consultas útiles post-migración
-- =====================================================

-- Leads por campaña (últimos 30 días):
-- SELECT utm_source, utm_campaign, count(*) AS leads
-- FROM leads
-- WHERE created_at > now() - interval '30 days'
-- GROUP BY 1, 2 ORDER BY leads DESC;

-- Cálculos completados por campaña (los eventos llevan UTMs en props):
-- SELECT props->>'utm_campaign' AS campaign, count(*) AS calculos
-- FROM analytics_events
-- WHERE event = 'magic_number_calculated'
--   AND created_at > now() - interval '30 days'
-- GROUP BY 1 ORDER BY calculos DESC;

-- Embudo por fuente (visitas → cálculos → emails):
-- SELECT props->>'utm_source' AS source,
--        count(*) FILTER (WHERE event = 'page_view') AS visitas,
--        count(*) FILTER (WHERE event = 'magic_number_calculated') AS calculos,
--        count(*) FILTER (WHERE event = 'email_submitted') AS emails
-- FROM analytics_events
-- WHERE created_at > now() - interval '30 days'
-- GROUP BY 1 ORDER BY visitas DESC;
