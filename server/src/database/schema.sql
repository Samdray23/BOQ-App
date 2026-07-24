-- BOQ AI PostgreSQL Schema
-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(50) NOT NULL DEFAULT 'quantity_surveyor',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  google_id VARCHAR(255),
  avatar_url TEXT,
  refresh_token TEXT,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ONBOARDING
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  company_name VARCHAR(255),
  company_size VARCHAR(50),
  country VARCHAR(100),
  region VARCHAR(100),
  experience_level VARCHAR(50),
  estimation_standards JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  ai_mode VARCHAR(100),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  type VARCHAR(50) NOT NULL DEFAULT 'residential',
  location VARCHAR(255),
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  building_type VARCHAR(100),
  num_floors INTEGER DEFAULT 1,
  total_area DECIMAL(15, 2),
  start_date DATE,
  completion_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================
-- DRAWINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_key TEXT NOT NULL,
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  version INTEGER NOT NULL DEFAULT 1,
  drawing_type VARCHAR(100),
  page_count INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON drawings(project_id);

-- ============================================================
-- CONSTRUCTION STAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS construction_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO construction_stages (code, name, display_order, description) VALUES
  ('A', 'Preliminaries', 1, 'Site establishment, mobilisation, project management, insurances'),
  ('B', 'Substructure', 2, 'Excavation, foundations, ground floor slab, hardcore filling'),
  ('C', 'Superstructure', 3, 'Columns, beams, walls, stairs, lintels'),
  ('D', 'Roofing', 4, 'Roof structure, roof covering, ceiling, insulation'),
  ('E', 'Doors & Windows', 5, 'Door frames, door leaves, window frames, window panes, ironmongery'),
  ('F', 'Finishes', 6, 'Floor finishes, wall finishes, ceiling finishes, painting'),
  ('G', 'External Works', 7, 'Fencing, drainage, paving, landscaping, gates')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- BOQ SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS boq_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boq_id UUID NOT NULL,
  stage_id UUID NOT NULL REFERENCES construction_stages(id),
  section_code VARCHAR(10) NOT NULL,
  section_name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  plain_language_summary TEXT,
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOQS
-- ============================================================
CREATE TABLE IF NOT EXISTS boqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'generating',
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  total_estimated_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  material_cost_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  labour_cost_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  equipment_cost_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  contingencies DECIMAL(15, 2) NOT NULL DEFAULT 0,
  profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  confidence_score DECIMAL(5, 2),
  plain_language_summary TEXT,
  ai_disclaimer TEXT,
  drawing_id UUID REFERENCES drawings(id),
  job_id UUID,
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boqs_project_id ON boqs(project_id);

-- ============================================================
-- BOQ ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS boq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES boq_sections(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES construction_stages(id),
  item_code VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL DEFAULT 0,
  unit_rate DECIMAL(15, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  material_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  labour_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  equipment_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  wastage_factor DECIMAL(5, 2) NOT NULL DEFAULT 0,
  is_provisional BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score DECIMAL(5, 2),
  plain_language_note TEXT,
  metadata JSONB DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boq_items_boq_id ON boq_items(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_section_id ON boq_items(section_id);

-- ============================================================
-- MATERIAL SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS material_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS material_schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES material_schedules(id) ON DELETE CASCADE,
  material_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  estimated_quantity DECIMAL(15, 2) NOT NULL DEFAULT 0,
  wastage_factor DECIMAL(5, 2) NOT NULL DEFAULT 0,
  adjusted_quantity DECIMAL(15, 2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  region VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRICING / RATE LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  state VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  markup_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO regions (country, state, city, code, markup_percentage) VALUES
  ('Nigeria', 'Oyo', 'Ibadan', 'IB', 0),
  ('Nigeria', 'Lagos', 'Lagos', 'LA', 15),
  ('Nigeria', 'FCT', 'Abuja', 'AB', 12),
  ('Nigeria', 'Rivers', 'Port Harcourt', 'PH', 10),
  ('Nigeria', 'Kano', 'Kano', 'KN', 8)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS rate_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rate_categories (name, description) VALUES
  ('materials', 'Construction material rates'),
  ('labour', 'Labour rates by trade'),
  ('equipment', 'Plant and equipment hire rates')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS rate_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES rate_categories(id),
  item_description VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  rate DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  source VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_library_region ON rate_library(region_id);
CREATE INDEX IF NOT EXISTS idx_rate_library_category ON rate_library(category_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  boq_id UUID REFERENCES boqs(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL DEFAULT 'pdf',
  status VARCHAR(50) NOT NULL DEFAULT 'generating',
  storage_key TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}',
  job_id UUID,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  boq_id UUID REFERENCES boqs(id),
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processing',
  storage_key TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}',
  job_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  payment_provider VARCHAR(50),
  provider_subscription_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(50) NOT NULL,
  provider_reference VARCHAR(255),
  provider_response JSONB,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  category VARCHAR(50),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- BACKGROUND JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB DEFAULT '{}',
  error TEXT,
  progress INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);

-- ============================================================
-- TEAM COLLABORATION
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================================
-- TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'boq',
  config JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at (with drop if exists for idempotency)
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_drawings_updated_at ON drawings;
CREATE TRIGGER set_drawings_updated_at BEFORE UPDATE ON drawings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_boqs_updated_at ON boqs;
CREATE TRIGGER set_boqs_updated_at BEFORE UPDATE ON boqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_rate_library_updated_at ON rate_library;
CREATE TRIGGER set_rate_library_updated_at BEFORE UPDATE ON rate_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_reports_updated_at ON reports;
CREATE TRIGGER set_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW-LEVEL SECURITY (defense-in-depth)
-- ============================================================
-- Enables RLS on every application table so that non-superuser
-- roles (anon, authenticated) see zero rows by default.
--
-- The backend connects as postgres with BYPASSRLS, so RLS has
-- no effect on backend queries. This protects against direct
-- Supabase API exposure or misconfiguration.
-- ============================================================

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS construction_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS material_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS material_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS templates ENABLE ROW LEVEL SECURITY;

-- Revoke all table privileges from Supabase public roles.
-- Without grants, these roles cannot access any data.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
