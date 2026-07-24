-- =============================================================================
-- Migration: 002_security_rls
-- Description: Enable Row-Level Security on all 26 application tables as
--              defense-in-depth against unauthorized direct access through
--              Supabase public roles (anon, authenticated).
--
-- ARCHITECTURE CONTEXT:
--   - The Express backend connects as a PostgreSQL superuser with BYPASSRLS.
--     RLS does NOT affect the backend connection. This is intentional.
--   - The frontend NEVER touches the database directly. There is no Supabase
--     client SDK in the frontend codebase.
--   - All user authorization is performed through Express/JWT middleware and
--     ownership-scoped repository queries in the backend service layer.
--   - This migration is NOT intended to replace application-layer auth.
--     It is a second line of defense in case the Supabase public API
--     (PostgREST / GraphQL) is exposed or misconfigured.
--
-- SAFETY:
--   - Enables RLS only. No tables created, altered, or dropped.
--   - No application data is modified or deleted.
--   - The backend superuser role bypasses RLS via BYPASSRLS privilege.
--   - FORCE ROW LEVEL SECURITY is intentionally omitted: unnecessary for the
--     current architecture and introduces future compatibility risk.
--   - REVOKE targets only anon and authenticated roles, NOT the backend role.
--   - All statements use IF EXISTS / IF NOT EXISTS for idempotency.
--   - Safe to run multiple times.
--
-- DO NOT:
--   - Modify schema.sql or 001_initial.sql
--   - Change application code
--   - Change the backend database connection role
--   - Create permissive policies (no auth.uid(), no request.jwt.claims)
--   - Grant privileges to anon or authenticated
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: Enable RLS on all 26 application tables
-- =============================================================================
-- ENABLE ROW LEVEL SECURITY: activates RLS for the table.
--   Without any policies, non-superuser roles see ZERO rows (default deny).
--   The backend superuser bypasses RLS entirely via BYPASSRLS privilege.
-- =============================================================================

-- USERS & AUTH (3 tables)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS verification_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ONBOARDING (1 table)
ALTER TABLE IF EXISTS onboarding_data ENABLE ROW LEVEL SECURITY;

-- PROJECTS (1 table)
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

-- DRAWINGS (1 table)
ALTER TABLE IF EXISTS drawings ENABLE ROW LEVEL SECURITY;

-- CONSTRUCTION STAGES — reference/seed data (1 table)
ALTER TABLE IF EXISTS construction_stages ENABLE ROW LEVEL SECURITY;

-- BOQ (3 tables)
ALTER TABLE IF EXISTS boq_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS boqs ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS boq_items ENABLE ROW LEVEL SECURITY;

-- MATERIAL SCHEDULES (2 tables)
ALTER TABLE IF EXISTS material_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS material_schedule_items ENABLE ROW LEVEL SECURITY;

-- PRICING / RATE LIBRARY — reference/seed data (3 tables)
ALTER TABLE IF EXISTS regions ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS rate_categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS rate_library ENABLE ROW LEVEL SECURITY;

-- REPORTS & EXPORTS (2 tables)
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS exports ENABLE ROW LEVEL SECURITY;

-- PAYMENTS & SUBSCRIPTIONS (2 tables)
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS (1 table)
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- AUDIT LOGS (1 table)
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- BACKGROUND JOBS (1 table)
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;

-- TEAM COLLABORATION (3 tables)
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS project_shares ENABLE ROW LEVEL SECURITY;

-- TEMPLATES (1 table)
ALTER TABLE IF EXISTS templates ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 2: Revoke table-level privileges from Supabase public roles
-- =============================================================================
-- This is a belt-and-suspenders defense alongside RLS.
--
-- Even if RLS were accidentally disabled (e.g. manual Supabase dashboard
-- toggle), these roles still cannot access data without table-level grants.
--
-- Targets:
--   anon         — Supabase anonymous/unauthenticated API role
--   authenticated — Supabase authenticated API role
--
-- NOT affected:
--   postgres superuser (backend role) — superuser ignores REVOKE
--   service_role — Supabase admin role, bypasses RLS (not used by this app)
-- =============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;


-- =============================================================================
-- SECTION 3: Note on reference tables
-- =============================================================================
-- The following 4 tables contain seed/reference data:
--   construction_stages, regions, rate_categories, rate_library
--
-- In a future phase where the frontend might access Supabase directly,
-- these could receive SELECT grants for the anon/authenticated roles.
--
-- For now, since the frontend does NOT use the Supabase client SDK,
-- no grants are issued. The backend reads these through its superuser
-- connection, which bypasses RLS entirely.
-- =============================================================================


-- =============================================================================
-- SECTION 4: Note on policies
-- =============================================================================
-- NO explicit policies are created in this migration.
--
-- When RLS is enabled and NO policies exist for a given role, PostgreSQL
-- applies DEFAULT DENY: the role sees zero rows on every query.
--
-- This is the correct behavior because:
--   1. The backend uses a superuser role that bypasses RLS — it sees all rows.
--   2. The anon/authenticated roles should see NO rows on ALL tables.
--   3. We intentionally do NOT create permissive policies using auth.uid()
--      or request.jwt.claims because the app uses custom Express/JWT auth.
--
-- If per-user isolation policies are needed in the future (e.g., for a
-- Supabase Realtime or Edge Function use case), they should be added
-- in a separate migration with explicit approval.
-- =============================================================================


-- =============================================================================
-- MIGRATION TRACKING
-- =============================================================================
-- Creates the migrations table if it doesn't exist (safe for first run),
-- then records this migration as applied.
-- =============================================================================

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO migrations (name) VALUES ('002_security_rls')
ON CONFLICT (name) DO NOTHING;


COMMIT;
