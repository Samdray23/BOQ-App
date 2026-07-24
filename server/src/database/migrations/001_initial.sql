-- BOQ AI Initial Migration
-- Migration: 001_initial
-- Description: Create all core tables for BOQ AI platform
-- Date: 2025-01-01

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables (see schema.sql for full DDL)
-- This migration is idempotent and safe to run multiple times

\i ../schema.sql

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO migrations (name) VALUES ('001_initial')
ON CONFLICT (name) DO NOTHING;

COMMIT;
