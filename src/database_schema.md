# BOQ AI — Database Schema
> **Version:** 1.0 MVP  
> **Database:** PostgreSQL  
> **Document Owner:** Olushola Samuel Ariyo  
> **Status:** Draft

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Entity Relationship Summary](#entity-relationship-summary)
3. [Schema: Users & Authentication](#schema-users--authentication)
4. [Schema: Subscriptions & Plans](#schema-subscriptions--plans)
5. [Schema: Projects](#schema-projects)
6. [Schema: Drawings & AI Processing](#schema-drawings--ai-processing)
7. [Schema: BOQ & Sections](#schema-boq--sections)
8. [Schema: Material Schedules](#schema-material-schedules)
9. [Schema: Regional Pricing Engine](#schema-regional-pricing-engine)
10. [Schema: Exports](#schema-exports)
11. [Schema: Enterprise & Teams](#schema-enterprise--teams)
12. [Schema: Audit & System Logs](#schema-audit--system-logs)
13. [Indexes & Performance Notes](#indexes--performance-notes)
14. [Enums Reference](#enums-reference)
15. [Design Decisions & Notes](#design-decisions--notes)

---

## Schema Overview

BOQ AI's database is designed around five core domains:

| Domain | Tables | Description |
|---|---|---|
| Identity | `users`, `sessions`, `oauth_providers` | Authentication and account management |
| Subscriptions | `plans`, `subscriptions`, `usage_counters` | Plan tiers and billing state |
| Projects | `projects`, `project_comparisons` | User project workspace |
| Processing | `drawings`, `ai_jobs`, `quantity_takeoffs` | Drawing uploads and AI pipeline |
| Outputs | `boqs`, `boq_sections`, `boq_items`, `material_schedules`, `material_items`, `exports` | Generated content |
| Pricing | `regions`, `countries`, `price_categories`, `price_rates` | Regional cost engine |
| Teams | `organisations`, `org_members`, `rate_libraries`, `custom_rates` | Enterprise collaboration |
| System | `audit_logs`, `error_logs`, `feature_flags` | Observability and control |

All tables use `UUID` primary keys unless otherwise noted. All timestamps are stored in `TIMESTAMPTZ` (UTC).

---

## Entity Relationship Summary

```
users
 ├── sessions (1:N)
 ├── oauth_providers (1:N)
 ├── subscriptions (1:1 active)
 ├── usage_counters (1:1 per billing cycle)
 ├── projects (1:N)
 │    ├── drawings (1:N)
 │    │    ├── ai_jobs (1:N)
 │    │    └── quantity_takeoffs (1:1 per completed job)
 │    ├── boqs (1:N)
 │    │    ├── boq_sections (1:N)
 │    │    │    └── boq_items (1:N)
 │    │    └── exports (1:N)
 │    └── material_schedules (1:N)
 │         ├── material_items (1:N)
 │         └── exports (1:N)
 └── org_members (N:M via organisations)

regions
 └── price_categories (1:N)
      └── price_rates (1:N)

organisations
 ├── org_members (1:N)
 └── rate_libraries (1:N)
      └── custom_rates (1:N)
```

---

## Schema: Users & Authentication

### `users`
Stores all registered user accounts across all plan tiers.

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(320) NOT NULL UNIQUE,
    password_hash       TEXT,                          -- NULL if OAuth-only account
    full_name           VARCHAR(255) NOT NULL,
    phone_number        VARCHAR(30),
    avatar_url          TEXT,
    user_type           user_type_enum NOT NULL DEFAULT 'homeowner',
    country_id          UUID REFERENCES countries(id),
    preferred_region_id UUID REFERENCES regions(id),
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Notes:**
- `password_hash` is NULL for Google OAuth users.
- `user_type` drives agent behaviour and default UI personalisation.
- Soft delete via `is_deleted` / `deleted_at` to preserve referential integrity.

---

### `sessions`
Manages authenticated user sessions (JWT refresh token store).

```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL UNIQUE,
    ip_address      INET,
    user_agent      TEXT,
    is_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `email_verifications`
Stores email verification tokens for new registrations and email changes.

```sql
CREATE TABLE email_verifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    is_used     BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `oauth_providers`
Links user accounts to third-party OAuth providers (e.g. Google).

```sql
CREATE TABLE oauth_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,              -- e.g. 'google'
    provider_uid    VARCHAR(255) NOT NULL,             -- provider's user ID
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_uid)
);
```

---

### `password_resets`
Tracks password reset tokens.

```sql
CREATE TABLE password_resets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    is_used     BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Schema: Subscriptions & Plans

### `plans`
Master table of available subscription plans.

```sql
CREATE TABLE plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(50) NOT NULL UNIQUE,   -- 'free', 'professional', 'enterprise'
    display_name        VARCHAR(100) NOT NULL,
    price_monthly_ngn   NUMERIC(12, 2),                -- Nigerian Naira
    price_yearly_ngn    NUMERIC(12, 2),
    max_projects_per_month INT,                        -- NULL = unlimited
    max_team_members    INT,                           -- NULL = unlimited
    has_material_schedules      BOOLEAN NOT NULL DEFAULT FALSE,
    has_regional_pricing        BOOLEAN NOT NULL DEFAULT FALSE,
    has_full_project_history    BOOLEAN NOT NULL DEFAULT FALSE,
    has_excel_export            BOOLEAN NOT NULL DEFAULT FALSE,
    has_clean_pdf_export        BOOLEAN NOT NULL DEFAULT FALSE,
    has_api_access              BOOLEAN NOT NULL DEFAULT FALSE,
    has_custom_rate_libraries   BOOLEAN NOT NULL DEFAULT FALSE,
    has_team_collaboration      BOOLEAN NOT NULL DEFAULT FALSE,
    has_priority_processing     BOOLEAN NOT NULL DEFAULT FALSE,
    has_dedicated_support       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed Data:**

| name | display_name | max_projects_per_month | has_material_schedules | has_excel_export | has_api_access |
|---|---|---|---|---|---|
| free | Free Plan | 2 | FALSE | FALSE | FALSE |
| professional | Professional Plan | NULL | TRUE | TRUE | FALSE |
| enterprise | Enterprise Plan | NULL | TRUE | TRUE | TRUE |

---

### `subscriptions`
Tracks each user's active and historical subscription state.

```sql
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID NOT NULL REFERENCES plans(id),
    org_id              UUID REFERENCES organisations(id), -- set for enterprise seats
    status              subscription_status_enum NOT NULL DEFAULT 'active',
    billing_cycle       billing_cycle_enum NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end  TIMESTAMPTZ NOT NULL,
    cancelled_at        TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    payment_reference   TEXT,                          -- external payment gateway ref
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `usage_counters`
Tracks usage limits per billing cycle, particularly for the Free plan.

```sql
CREATE TABLE usage_counters (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end  TIMESTAMPTZ NOT NULL,
    projects_created    INT NOT NULL DEFAULT 0,
    boqs_generated      INT NOT NULL DEFAULT 0,
    exports_performed   INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, billing_period_start)
);
```

---

## Schema: Projects

### `projects`
The central workspace entity. Every BOQ, drawing, and material schedule belongs to a project.

```sql
CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id              UUID REFERENCES organisations(id),  -- set for enterprise projects
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    project_type        project_type_enum NOT NULL DEFAULT 'residential',
    status              project_status_enum NOT NULL DEFAULT 'draft',
    country_id          UUID REFERENCES countries(id),
    region_id           UUID NOT NULL REFERENCES regions(id),
    currency_code       CHAR(3) NOT NULL DEFAULT 'NGN',
    is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,
    duplicated_from_id  UUID REFERENCES projects(id),      -- populated on project duplication
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Notes:**
- `duplicated_from_id` enables the "Duplicate Project" workflow.
- `region_id` drives which pricing model is applied during BOQ generation.

---

### `project_comparisons`
Records user-initiated comparisons between two projects.

```sql
CREATE TABLE project_comparisons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_a_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_b_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    comparison_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (project_a_id <> project_b_id)
);
```

---

## Schema: Drawings & AI Processing

### `drawings`
Stores metadata for each uploaded architectural PDF drawing.

```sql
CREATE TABLE drawings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    file_name       VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_url        TEXT NOT NULL,                     -- S3 object URL
    s3_key          TEXT NOT NULL,                     -- S3 object key
    drawing_type    drawing_type_enum NOT NULL,        -- 'floor_plan', 'site_plan', etc.
    page_count      INT,
    upload_status   upload_status_enum NOT NULL DEFAULT 'pending',
    upload_error    TEXT,
    checksum        TEXT,                              -- SHA-256 for deduplication
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `ai_jobs`
Tracks each AI processing job triggered for a drawing.

```sql
CREATE TABLE ai_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drawing_id          UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL REFERENCES projects(id),
    job_type            ai_job_type_enum NOT NULL,     -- 'recognition', 'takeoff', 'boq_generation'
    status              ai_job_status_enum NOT NULL DEFAULT 'queued',
    priority            ai_priority_enum NOT NULL DEFAULT 'standard',  -- 'standard' | 'priority'
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    processing_time_ms  INT,                           -- actual wall time
    error_message       TEXT,
    retry_count         INT NOT NULL DEFAULT 0,
    max_retries         INT NOT NULL DEFAULT 3,
    ai_model_version    VARCHAR(100),                  -- e.g. 'deepseek-v2'
    raw_ai_response     JSONB,                         -- full model response for debugging
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Notes:**
- `priority` maps to plan tier: Professional/Enterprise users get `'priority'` queue.
- `raw_ai_response` stored as JSONB for debugging and potential reprocessing.

---

### `quantity_takeoffs`
Stores the structured output of the AI quantity extraction step.

```sql
CREATE TABLE quantity_takeoffs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_job_id           UUID NOT NULL UNIQUE REFERENCES ai_jobs(id) ON DELETE CASCADE,
    drawing_id          UUID NOT NULL REFERENCES drawings(id),
    project_id          UUID NOT NULL REFERENCES projects(id),

    -- Floor metrics
    total_floor_area_m2         NUMERIC(12, 3),
    gross_floor_area_m2         NUMERIC(12, 3),
    net_floor_area_m2           NUMERIC(12, 3),

    -- Wall metrics
    total_wall_area_m2          NUMERIC(12, 3),
    external_wall_area_m2       NUMERIC(12, 3),
    internal_wall_area_m2       NUMERIC(12, 3),
    total_wall_length_m         NUMERIC(12, 3),

    -- Ceiling metrics
    total_ceiling_area_m2       NUMERIC(12, 3),

    -- Openings
    door_count                  INT,
    window_count                INT,

    -- Roof
    roof_area_m2                NUMERIC(12, 3),
    roof_type                   VARCHAR(100),

    -- Rooms
    room_count                  INT,
    rooms_detail                JSONB,                 -- [{name, area_m2, width_m, length_m}]

    -- Drawing metadata
    detected_scale              VARCHAR(50),           -- e.g. '1:100'
    confidence_score            NUMERIC(5, 4),         -- 0.0000 to 1.0000
    unresolved_elements         JSONB,                 -- flagged ambiguities
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Schema: BOQ & Sections

### `boqs`
The top-level Bill of Quantities record for a project.

```sql
CREATE TABLE boqs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    drawing_id          UUID REFERENCES drawings(id),
    takeoff_id          UUID REFERENCES quantity_takeoffs(id),
    version             INT NOT NULL DEFAULT 1,
    title               VARCHAR(255) NOT NULL DEFAULT 'AI-Assisted Preliminary BOQ',
    status              boq_status_enum NOT NULL DEFAULT 'generating',
    region_id           UUID NOT NULL REFERENCES regions(id),
    rate_library_id     UUID REFERENCES rate_libraries(id),  -- enterprise custom rates
    total_estimated_cost NUMERIC(18, 2),
    currency_code       CHAR(3) NOT NULL DEFAULT 'NGN',
    generated_at        TIMESTAMPTZ,
    generation_time_ms  INT,
    is_published        BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `boq_sections`
Each BOQ is divided into standard sections (Preliminaries, Blockwork, etc.).

```sql
CREATE TABLE boq_sections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boq_id          UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
    section_code    VARCHAR(10) NOT NULL,              -- e.g. 'A', 'B', 'C'
    section_name    VARCHAR(255) NOT NULL,             -- e.g. 'Preliminaries'
    section_type    boq_section_type_enum NOT NULL,
    display_order   SMALLINT NOT NULL,
    subtotal        NUMERIC(18, 2),
    is_estimated    BOOLEAN NOT NULL DEFAULT FALSE,    -- TRUE for sections like Substructure
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Standard Sections (Seed):**

| section_code | section_name | display_order | is_estimated |
|---|---|---|---|
| A | Preliminaries | 1 | FALSE |
| B | Site Works | 2 | FALSE |
| C | Substructure | 3 | TRUE |
| D | Blockwork | 4 | FALSE |
| E | Roofing | 5 | FALSE |
| F | Doors | 6 | FALSE |
| G | Windows | 7 | FALSE |
| H | Floor Finishes | 8 | FALSE |
| I | Wall Finishes | 9 | FALSE |
| J | Ceiling Finishes | 10 | FALSE |
| K | Painting | 11 | FALSE |
| L | External Works | 12 | FALSE |

---

### `boq_items`
Individual line items within each BOQ section.

```sql
CREATE TABLE boq_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id          UUID NOT NULL REFERENCES boq_sections(id) ON DELETE CASCADE,
    boq_id              UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
    item_code           VARCHAR(20),                   -- e.g. 'D.01', 'D.02'
    description         VARCHAR(500) NOT NULL,         -- e.g. '225mm Hollow Block Wall'
    plain_language_note TEXT NOT NULL,                 -- mandatory jargon-free explanation
    unit                VARCHAR(50) NOT NULL,          -- e.g. 'm²', 'm³', 'nr', 'sum'
    quantity            NUMERIC(14, 3),
    unit_rate           NUMERIC(14, 2),
    amount              NUMERIC(18, 2),
    is_provisional      BOOLEAN NOT NULL DEFAULT FALSE,
    is_ai_generated     BOOLEAN NOT NULL DEFAULT TRUE,
    confidence_score    NUMERIC(5, 4),                 -- line-item level confidence
    display_order       SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Notes:**
- `plain_language_note` is NOT NULL — every line item must have a plain English explanation.
- `unit_rate` is pulled from the regional pricing engine at generation time.
- `is_provisional` flags estimated items (e.g. Substructure items based on floor area inference).

---

## Schema: Material Schedules

### `material_schedules`
Top-level material schedule record linked to a project and BOQ.

```sql
CREATE TABLE material_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    boq_id          UUID REFERENCES boqs(id),
    takeoff_id      UUID REFERENCES quantity_takeoffs(id),
    title           VARCHAR(255) NOT NULL DEFAULT 'AI-Assisted Material Schedule',
    version         INT NOT NULL DEFAULT 1,
    status          material_schedule_status_enum NOT NULL DEFAULT 'generating',
    region_id       UUID NOT NULL REFERENCES regions(id),
    generated_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `material_items`
Individual material line items within a material schedule.

```sql
CREATE TABLE material_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id         UUID NOT NULL REFERENCES material_schedules(id) ON DELETE CASCADE,
    material_type       material_type_enum NOT NULL,   -- 'cement', 'blocks', 'sand', etc.
    description         VARCHAR(500) NOT NULL,
    unit                VARCHAR(50) NOT NULL,           -- e.g. 'bags', 'm³', 'nr', 'litres'
    estimated_quantity  NUMERIC(14, 3) NOT NULL,
    wastage_factor      NUMERIC(5, 4) NOT NULL DEFAULT 0.10,  -- 10% wastage default
    adjusted_quantity   NUMERIC(14, 3),                -- quantity + wastage
    unit_price_ngn      NUMERIC(14, 2),
    total_price_ngn     NUMERIC(18, 2),
    boq_section_ref     VARCHAR(10),                   -- reference to related BOQ section code
    plain_language_note TEXT,
    display_order       SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Standard Material Types:**

| material_type | typical_unit |
|---|---|
| cement | bags (50kg) |
| blocks | nr (pieces) |
| sand | m³ |
| granite | m³ |
| paint | litres |
| tiles | m² |
| roofing_sheets | m² |
| roofing_accessories | sum |

---

## Schema: Regional Pricing Engine

### `countries`
Master list of supported countries.

```sql
CREATE TABLE countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    iso_code        CHAR(2) NOT NULL UNIQUE,           -- ISO 3166-1 alpha-2
    currency_code   CHAR(3) NOT NULL,                  -- ISO 4217
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `regions`
Geographic sub-divisions used for location-specific pricing.

```sql
CREATE TABLE regions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id      UUID NOT NULL REFERENCES countries(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,             -- e.g. 'lagos', 'abuja'
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, slug)
);
```

**MVP Seed Data (Nigeria):**

| name | slug |
|---|---|
| Lagos | lagos |
| Ibadan | ibadan |
| Abuja | abuja |
| Port Harcourt | port-harcourt |
| Kano | kano |

---

### `price_categories`
Groups pricing rates by work category, aligned to BOQ sections.

```sql
CREATE TABLE price_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,             -- e.g. 'Blockwork', 'Roofing'
    code            VARCHAR(20) NOT NULL UNIQUE,       -- matches boq_section section_code
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `price_rates`
Stores region-specific unit rates for each price category item.

```sql
CREATE TABLE price_rates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id           UUID NOT NULL REFERENCES regions(id),
    category_id         UUID NOT NULL REFERENCES price_categories(id),
    item_description    VARCHAR(500) NOT NULL,
    unit                VARCHAR(50) NOT NULL,
    rate_ngn            NUMERIC(14, 2) NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,                          -- NULL = currently active
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    source              VARCHAR(255),                  -- e.g. 'BOQ AI Internal Survey Q1 2025'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Notes:**
- `effective_from` / `effective_to` support time-versioned pricing — old rates are preserved for historical project accuracy.
- Active rate = `is_active = TRUE AND effective_to IS NULL`.

---

## Schema: Exports

### `exports`
Tracks every export file generated (PDF or Excel) for audit and download purposes.

```sql
CREATE TABLE exports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    boq_id          UUID REFERENCES boqs(id),
    schedule_id     UUID REFERENCES material_schedules(id),
    export_type     export_type_enum NOT NULL,         -- 'pdf_watermarked', 'pdf_clean', 'excel'
    file_name       VARCHAR(500) NOT NULL,
    file_url        TEXT NOT NULL,                     -- S3 pre-signed or permanent URL
    s3_key          TEXT NOT NULL,
    file_size_bytes BIGINT,
    is_watermarked  BOOLEAN NOT NULL DEFAULT FALSE,
    download_count  INT NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,                       -- for pre-signed URLs
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Schema: Enterprise & Teams

### `organisations`
Enterprise-level accounts that group multiple users under one billing entity.

```sql
CREATE TABLE organisations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    logo_url        TEXT,
    country_id      UUID REFERENCES countries(id),
    billing_email   VARCHAR(320),
    plan_id         UUID NOT NULL REFERENCES plans(id),
    max_seats       INT,                               -- NULL = unlimited
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `org_members`
Maps users to organisations with defined roles.

```sql
CREATE TABLE org_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            org_role_enum NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    invited_by      UUID REFERENCES users(id),
    joined_at       TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (org_id, user_id)
);
```

---

### `rate_libraries`
Enterprise-specific custom rate libraries that override the regional pricing engine.

```sql
CREATE TABLE rate_libraries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    region_id       UUID REFERENCES regions(id),       -- optional scope to a region
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `custom_rates`
Individual rate entries within an enterprise rate library.

```sql
CREATE TABLE custom_rates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id          UUID NOT NULL REFERENCES rate_libraries(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES price_categories(id),
    item_description    VARCHAR(500) NOT NULL,
    unit                VARCHAR(50) NOT NULL,
    rate                NUMERIC(14, 2) NOT NULL,
    currency_code       CHAR(3) NOT NULL DEFAULT 'NGN',
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Schema: Audit & System Logs

### `audit_logs`
Immutable record of significant user and system actions.

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,             -- BIGSERIAL for high-volume insert performance
    user_id         UUID REFERENCES users(id),
    org_id          UUID REFERENCES organisations(id),
    action          VARCHAR(100) NOT NULL,             -- e.g. 'project.created', 'boq.exported'
    entity_type     VARCHAR(100),                      -- e.g. 'project', 'boq', 'export'
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `error_logs`
Captures AI processing errors, upload failures, and system exceptions.

```sql
CREATE TABLE error_logs (
    id              BIGSERIAL PRIMARY KEY,
    ai_job_id       UUID REFERENCES ai_jobs(id),
    drawing_id      UUID REFERENCES drawings(id),
    project_id      UUID REFERENCES projects(id),
    user_id         UUID REFERENCES users(id),
    error_code      VARCHAR(100),
    error_message   TEXT NOT NULL,
    stack_trace     TEXT,
    context         JSONB,                             -- additional debugging context
    severity        error_severity_enum NOT NULL DEFAULT 'error',
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `feature_flags`
Controls feature rollout, A/B testing, and plan-gating at runtime.

```sql
CREATE TABLE feature_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) NOT NULL UNIQUE,      -- e.g. 'excel_export_enabled'
    description     TEXT,
    is_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    enabled_for_plans TEXT[],                          -- e.g. '{professional, enterprise}'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Indexes & Performance Notes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_country_id ON users(country_id);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_region_id ON projects(region_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Drawings
CREATE INDEX idx_drawings_project_id ON drawings(project_id);
CREATE INDEX idx_drawings_upload_status ON drawings(upload_status);

-- AI Jobs
CREATE INDEX idx_ai_jobs_drawing_id ON ai_jobs(drawing_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_created_at ON ai_jobs(created_at DESC);

-- BOQs
CREATE INDEX idx_boqs_project_id ON boqs(project_id);
CREATE INDEX idx_boqs_status ON boqs(status);

-- BOQ Items
CREATE INDEX idx_boq_items_boq_id ON boq_items(boq_id);
CREATE INDEX idx_boq_items_section_id ON boq_items(section_id);

-- Material Schedules
CREATE INDEX idx_material_schedules_project_id ON material_schedules(project_id);

-- Price Rates
CREATE INDEX idx_price_rates_region_id ON price_rates(region_id);
CREATE INDEX idx_price_rates_category_id ON price_rates(category_id);
CREATE INDEX idx_price_rates_active ON price_rates(is_active) WHERE is_active = TRUE;

-- Exports
CREATE INDEX idx_exports_project_id ON exports(project_id);
CREATE INDEX idx_exports_user_id ON exports(user_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Org Members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
```

---

## Enums Reference

```sql
-- User type (drives agent behaviour and default UI)
CREATE TYPE user_type_enum AS ENUM (
    'homeowner',
    'developer',
    'contractor',
    'architect',
    'quantity_surveyor',
    'student',
    'other'
);

-- Subscription status
CREATE TYPE subscription_status_enum AS ENUM (
    'active',
    'trialing',
    'past_due',
    'cancelled',
    'expired'
);

-- Billing cycle
CREATE TYPE billing_cycle_enum AS ENUM (
    'monthly',
    'yearly'
);

-- Project type
CREATE TYPE project_type_enum AS ENUM (
    'residential',
    'commercial',
    'mixed_use',
    'other'
);

-- Project status
CREATE TYPE project_status_enum AS ENUM (
    'draft',
    'processing',
    'complete',
    'error',
    'archived'
);

-- Drawing type
CREATE TYPE drawing_type_enum AS ENUM (
    'floor_plan',
    'site_plan',
    'roof_plan',
    'elevation',
    'section',
    'other'
);

-- Upload status
CREATE TYPE upload_status_enum AS ENUM (
    'pending',
    'uploading',
    'complete',
    'failed'
);

-- AI job type
CREATE TYPE ai_job_type_enum AS ENUM (
    'drawing_recognition',
    'quantity_takeoff',
    'boq_generation',
    'material_schedule_generation'
);

-- AI job status
CREATE TYPE ai_job_status_enum AS ENUM (
    'queued',
    'processing',
    'complete',
    'failed',
    'retrying',
    'cancelled'
);

-- AI job priority
CREATE TYPE ai_priority_enum AS ENUM (
    'standard',
    'priority'
);

-- BOQ status
CREATE TYPE boq_status_enum AS ENUM (
    'generating',
    'complete',
    'failed',
    'regenerating'
);

-- BOQ section type
CREATE TYPE boq_section_type_enum AS ENUM (
    'preliminaries',
    'site_works',
    'substructure',
    'blockwork',
    'roofing',
    'doors',
    'windows',
    'floor_finishes',
    'wall_finishes',
    'ceiling_finishes',
    'painting',
    'external_works'
);

-- Material schedule status
CREATE TYPE material_schedule_status_enum AS ENUM (
    'generating',
    'complete',
    'failed'
);

-- Material type
CREATE TYPE material_type_enum AS ENUM (
    'cement',
    'blocks',
    'sand',
    'granite',
    'paint',
    'tiles',
    'roofing_sheets',
    'roofing_accessories',
    'other'
);

-- Export type
CREATE TYPE export_type_enum AS ENUM (
    'pdf_watermarked',
    'pdf_clean',
    'excel'
);

-- Organisation role
CREATE TYPE org_role_enum AS ENUM (
    'owner',
    'admin',
    'member'
);

-- Error severity
CREATE TYPE error_severity_enum AS ENUM (
    'info',
    'warning',
    'error',
    'critical'
);
```

---

## Design Decisions & Notes

### 1. UUID Primary Keys
All core tables use `UUID` PKs generated via `gen_random_uuid()`. This ensures:
- Safe exposure of IDs in public APIs without sequential enumeration risk.
- Compatibility with distributed or sharded future architectures.

### 2. Soft Deletes
`users` and `projects` use soft deletes (`is_deleted`, `deleted_at`). This preserves referential integrity across BOQs, exports, and audit logs while honouring deletion requests.

### 3. JSONB for Flexible AI Outputs
Fields like `rooms_detail`, `raw_ai_response`, `unresolved_elements`, and `context` use JSONB. This avoids premature schema rigidity in areas where AI output structure may evolve across model versions.

### 4. Time-Versioned Pricing
`price_rates` stores historical rates via `effective_from` / `effective_to`. When a BOQ is regenerated, the system can optionally use the rate that was active at the time of original generation — preserving historical accuracy for project comparisons.

### 5. Separation of BOQ and Material Schedule
BOQs and Material Schedules are separate top-level entities linked to the same project and takeoff. This allows either to be regenerated independently and supports plan-gating (Material Schedules are a Professional+ feature).

### 6. Confidence Scores
Both `quantity_takeoffs` and `boq_items` carry a `confidence_score` (0–1). This supports future UI features such as flagging low-confidence line items for user review.

### 7. Audit Log uses BIGSERIAL
`audit_logs` and `error_logs` use `BIGSERIAL` instead of UUID for performance at high insert volume, since these tables are append-only and never exposed via public API.

### 8. Enterprise Rate Libraries
`rate_libraries` and `custom_rates` are scoped to `organisations` only. They reference `price_categories` for consistency with the standard pricing engine, but can override any rate value — satisfying the Enterprise "Custom Rate Libraries" feature requirement.

### 9. Plan Feature Enforcement
Feature gates are enforced at the application layer using the boolean flags in the `plans` table. The `feature_flags` table provides an additional runtime override mechanism for gradual rollouts and A/B testing without requiring schema or code changes.

---

*This schema is designed for BOQ AI MVP Version 1.0. Extensions for Structural, Electrical, MEP, and BIM integrations should be introduced as additive migrations in future schema versions.*