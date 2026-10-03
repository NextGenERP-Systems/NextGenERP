-- CRM-only Phase 3 persistence. History and interactions restrict hard deletion
-- of referenced lifecycle records so audit records cannot disappear via cascades.
CREATE TABLE crm_lead_prospect_links (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL UNIQUE REFERENCES crm_leads(id),
    prospect_id UUID NOT NULL UNIQUE REFERENCES crm_prospects(id),
    linked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    linked_by UUID
);

CREATE TABLE crm_lead_history (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES crm_leads(id),
    event_type VARCHAR(30) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    from_first_name VARCHAR(100),
    to_first_name VARCHAR(100),
    from_last_name VARCHAR(100),
    to_last_name VARCHAR(100),
    from_assigned_to UUID,
    to_assigned_to UUID,
    from_company_name VARCHAR(255),
    to_company_name VARCHAR(255),
    from_email VARCHAR(255),
    to_email VARCHAR(255),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);

CREATE TABLE crm_opportunity_history (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL REFERENCES crm_opportunities(id),
    event_type VARCHAR(30) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    from_stage_id UUID,
    to_stage_id UUID,
    from_stage_name VARCHAR(100),
    to_stage_name VARCHAR(100),
    from_amount NUMERIC(15,2),
    to_amount NUMERIC(15,2),
    from_probability INTEGER,
    to_probability INTEGER,
    from_assigned_to UUID,
    to_assigned_to UUID,
    from_prospect_id UUID,
    to_prospect_id UUID,
    from_customer_id UUID,
    to_customer_id UUID,
    from_opportunity_name VARCHAR(255),
    to_opportunity_name VARCHAR(255),
    from_lost_reason_id UUID,
    to_lost_reason_id UUID,
    from_expected_close_date DATE,
    to_expected_close_date DATE,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);

CREATE TABLE crm_activities (
    id UUID PRIMARY KEY,
    target_lead_id UUID REFERENCES crm_leads(id),
    target_prospect_id UUID REFERENCES crm_prospects(id),
    target_opportunity_id UUID REFERENCES crm_opportunities(id),
    activity_type VARCHAR(30) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL,
    occurred_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT ck_crm_activity_single_target CHECK (
        (target_lead_id IS NOT NULL)::int + (target_prospect_id IS NOT NULL)::int +
        (target_opportunity_id IS NOT NULL)::int = 1
    )
);

CREATE TABLE crm_notes (
    id UUID PRIMARY KEY,
    target_lead_id UUID REFERENCES crm_leads(id),
    target_prospect_id UUID REFERENCES crm_prospects(id),
    target_opportunity_id UUID REFERENCES crm_opportunities(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author_id UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT ck_crm_note_single_target CHECK (
        (target_lead_id IS NOT NULL)::int + (target_prospect_id IS NOT NULL)::int +
        (target_opportunity_id IS NOT NULL)::int = 1
    )
);

CREATE TABLE crm_appointments (
    id UUID PRIMARY KEY,
    target_lead_id UUID REFERENCES crm_leads(id),
    target_prospect_id UUID REFERENCES crm_prospects(id),
    target_opportunity_id UUID REFERENCES crm_opportunities(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL,
    location VARCHAR(255),
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT ck_crm_appointment_single_target CHECK (
        (target_lead_id IS NOT NULL)::int + (target_prospect_id IS NOT NULL)::int +
        (target_opportunity_id IS NOT NULL)::int = 1
    ),
    CONSTRAINT ck_crm_appointment_dates CHECK (ends_at > starts_at)
);

-- An upgrade has no trustworthy pre-V4 transition timestamps. Start a clearly
-- labelled baseline now; never synthesize a historical stage duration.
INSERT INTO crm_lead_history (id, lead_id, event_type, to_status, to_first_name, to_last_name,
    to_assigned_to, to_company_name, to_email, occurred_at)
SELECT gen_random_uuid(), id, 'BASELINE', status, first_name, last_name,
    assigned_to, company_name, email, CURRENT_TIMESTAMP FROM crm_leads;

INSERT INTO crm_opportunity_history (id, opportunity_id, event_type, to_status, to_stage_id,
    to_stage_name, to_amount, to_probability, to_assigned_to, to_prospect_id, to_customer_id,
    to_opportunity_name, to_lost_reason_id, to_expected_close_date, occurred_at)
SELECT gen_random_uuid(), o.id, 'BASELINE', o.status, o.sales_stage_id, s.name,
    o.amount, o.probability, o.assigned_to, o.prospect_id, o.customer_id,
    o.opportunity_name, o.lost_reason_id, o.expected_close_date, CURRENT_TIMESTAMP
FROM crm_opportunities o LEFT JOIN crm_sales_stages s ON s.id=o.sales_stage_id;

CREATE INDEX idx_crm_lead_history_timeline ON crm_lead_history(lead_id, occurred_at DESC, id DESC);
CREATE INDEX idx_crm_opportunity_history_timeline ON crm_opportunity_history(opportunity_id, occurred_at DESC, id DESC);
CREATE INDEX idx_crm_activities_target_lead ON crm_activities(target_lead_id, occurred_at DESC);
CREATE INDEX idx_crm_activities_target_prospect ON crm_activities(target_prospect_id, occurred_at DESC);
CREATE INDEX idx_crm_activities_target_opportunity ON crm_activities(target_opportunity_id, occurred_at DESC);
CREATE INDEX idx_crm_notes_target_lead ON crm_notes(target_lead_id, created_at DESC);
CREATE INDEX idx_crm_notes_target_prospect ON crm_notes(target_prospect_id, created_at DESC);
CREATE INDEX idx_crm_notes_target_opportunity ON crm_notes(target_opportunity_id, created_at DESC);
CREATE INDEX idx_crm_appointments_target_lead ON crm_appointments(target_lead_id, starts_at);
CREATE INDEX idx_crm_appointments_target_prospect ON crm_appointments(target_prospect_id, starts_at);
CREATE INDEX idx_crm_appointments_target_opportunity ON crm_appointments(target_opportunity_id, starts_at);
