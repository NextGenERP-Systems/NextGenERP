CREATE TABLE crm_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL','SMS','EVENT','OTHER')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SCHEDULED','ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    owner_id UUID,
    budget NUMERIC(15,2) CHECK (budget >= 0),
    currency CHAR(3),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at),
    CHECK ((budget IS NULL AND currency IS NULL) OR (budget IS NOT NULL AND currency ~ '^[A-Z]{3}$'))
);
CREATE INDEX idx_crm_campaigns_status_dates ON crm_campaigns(status, starts_at, ends_at);

CREATE TABLE crm_campaign_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE RESTRICT,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    cost_date DATE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_crm_campaign_costs_campaign_date ON crm_campaign_costs(campaign_id, cost_date DESC);

CREATE TABLE crm_campaign_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE RESTRICT,
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'ADDED' CHECK (status IN ('ADDED','CONTACTED','RESPONDED','REMOVED')),
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, contact_id)
);
CREATE INDEX idx_crm_campaign_members_contact ON crm_campaign_members(contact_id, updated_at DESC);
CREATE TABLE crm_campaign_member_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES crm_campaign_members(id) ON DELETE RESTRICT,
    from_status VARCHAR(20) CHECK (from_status IS NULL OR from_status IN ('ADDED','CONTACTED','RESPONDED','REMOVED')),
    to_status VARCHAR(20) NOT NULL CHECK (to_status IN ('ADDED','CONTACTED','RESPONDED','REMOVED')),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);
CREATE INDEX idx_crm_campaign_member_events_member ON crm_campaign_member_events(member_id, changed_at DESC, id DESC);

CREATE TABLE crm_campaign_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES crm_campaigns(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES crm_leads(id) ON DELETE RESTRICT,
    prospect_id UUID REFERENCES crm_prospects(id) ON DELETE RESTRICT,
    opportunity_id UUID REFERENCES crm_opportunities(id) ON DELETE RESTRICT,
    event_type VARCHAR(40) NOT NULL,
    event_key VARCHAR(200) NOT NULL UNIQUE,
    source VARCHAR(100), medium VARCHAR(100), utm_source VARCHAR(200),
    utm_medium VARCHAR(200), utm_campaign VARCHAR(200), utm_content VARCHAR(200), utm_term VARCHAR(200),
    reported_by_client BOOLEAN NOT NULL DEFAULT TRUE,
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (num_nonnulls(lead_id, prospect_id, opportunity_id) = 1)
);
CREATE INDEX idx_crm_campaign_touchpoints_lead ON crm_campaign_touchpoints(lead_id, occurred_at DESC, id DESC) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_campaign_touchpoints_prospect ON crm_campaign_touchpoints(prospect_id, occurred_at DESC, id DESC) WHERE prospect_id IS NOT NULL;
CREATE INDEX idx_crm_campaign_touchpoints_opportunity ON crm_campaign_touchpoints(opportunity_id, occurred_at DESC, id DESC) WHERE opportunity_id IS NOT NULL;

CREATE TABLE crm_campaign_attribution_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    touchpoint_id UUID NOT NULL REFERENCES crm_campaign_touchpoints(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES crm_leads(id) ON DELETE RESTRICT,
    prospect_id UUID REFERENCES crm_prospects(id) ON DELETE RESTRICT,
    opportunity_id UUID REFERENCES crm_opportunities(id) ON DELETE RESTRICT,
    link_type VARCHAR(30) NOT NULL CHECK (link_type IN ('QUALIFICATION','OPPORTUNITY_ASSOCIATION')),
    linked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (num_nonnulls(lead_id, prospect_id, opportunity_id) = 1)
);
CREATE UNIQUE INDEX uq_crm_attribution_qualification_lead ON crm_campaign_attribution_links(lead_id) WHERE link_type='QUALIFICATION' AND lead_id IS NOT NULL;
CREATE UNIQUE INDEX uq_crm_attribution_qualification_prospect ON crm_campaign_attribution_links(prospect_id) WHERE link_type='QUALIFICATION' AND prospect_id IS NOT NULL;
CREATE UNIQUE INDEX uq_crm_attribution_opportunity ON crm_campaign_attribution_links(opportunity_id) WHERE link_type='OPPORTUNITY_ASSOCIATION' AND opportunity_id IS NOT NULL;

CREATE TABLE crm_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL','SMS')),
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
    subject VARCHAR(998),
    body TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, channel, revision),
    CHECK ((channel='EMAIL' AND subject IS NOT NULL AND length(subject)>0) OR channel='SMS')
);

CREATE TABLE crm_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE RESTRICT,
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL','SMS')),
    destination VARCHAR(320) NOT NULL,
    consent_state VARCHAR(20) NOT NULL CHECK (consent_state IN ('OPTED_IN','OPTED_OUT','UNKNOWN')),
    source VARCHAR(100) NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID,
    UNIQUE(contact_id, channel, destination)
);
CREATE TABLE crm_communication_preference_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preference_id UUID NOT NULL REFERENCES crm_communication_preferences(id) ON DELETE RESTRICT,
    consent_state VARCHAR(20) NOT NULL CHECK (consent_state IN ('OPTED_IN','OPTED_OUT','UNKNOWN')),
    source VARCHAR(100) NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);
CREATE INDEX idx_crm_preference_events_preference ON crm_communication_preference_events(preference_id, effective_at DESC, id DESC);

CREATE TABLE crm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES crm_campaigns(id) ON DELETE RESTRICT,
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE RESTRICT,
    template_id UUID REFERENCES crm_message_templates(id) ON DELETE RESTRICT,
    template_revision INTEGER,
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL','SMS')),
    destination VARCHAR(320) NOT NULL,
    subject_snapshot VARCHAR(998), body_snapshot TEXT NOT NULL,
    idempotency_key VARCHAR(200) NOT NULL UNIQUE,
    payload_hash CHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','PROCESSING','SUBMITTED','DELIVERED','FAILED','CANCELLED','UNKNOWN')),
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lease_until TIMESTAMPTZ,
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    next_attempt_at TIMESTAMPTZ,
    provider_message_id VARCHAR(200),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((channel='EMAIL' AND subject_snapshot IS NOT NULL) OR channel='SMS')
);
CREATE INDEX idx_crm_messages_dispatch ON crm_messages(status, scheduled_at, next_attempt_at) WHERE status IN ('QUEUED','PROCESSING');
CREATE INDEX idx_crm_messages_contact ON crm_messages(contact_id, created_at DESC);

CREATE TABLE crm_message_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES crm_messages(id) ON DELETE RESTRICT,
    attempt_number INTEGER NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('SUBMITTED','RETRYABLE','DELIVERED','FAILED','UNKNOWN')),
    provider_message_id VARCHAR(200), error_code VARCHAR(100), error_detail TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    UNIQUE(message_id, attempt_number)
);
CREATE INDEX idx_crm_message_attempts_message ON crm_message_delivery_attempts(message_id, attempt_number DESC);

CREATE TABLE crm_provider_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(80) NOT NULL,
    provider_event_id VARCHAR(200) NOT NULL,
    message_id UUID REFERENCES crm_messages(id) ON DELETE RESTRICT,
    event_type VARCHAR(40) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_event_id)
);
