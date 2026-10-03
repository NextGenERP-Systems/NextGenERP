CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(120),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    lead_id UUID REFERENCES crm_leads(id) ON DELETE RESTRICT,
    prospect_id UUID REFERENCES crm_prospects(id) ON DELETE RESTRICT,
    opportunity_id UUID REFERENCES crm_opportunities(id) ON DELETE RESTRICT,
    customer_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_crm_contact_one_owner CHECK (
        num_nonnulls(lead_id, prospect_id, opportunity_id, customer_id) = 1
    )
);
CREATE INDEX idx_crm_contacts_lead ON crm_contacts(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_contacts_prospect ON crm_contacts(prospect_id) WHERE prospect_id IS NOT NULL;
CREATE INDEX idx_crm_contacts_opportunity ON crm_contacts(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX idx_crm_contacts_customer ON crm_contacts(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE UNIQUE INDEX uq_crm_contacts_primary_lead ON crm_contacts(lead_id) WHERE lead_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX uq_crm_contacts_primary_prospect ON crm_contacts(prospect_id) WHERE prospect_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX uq_crm_contacts_primary_opportunity ON crm_contacts(opportunity_id) WHERE opportunity_id IS NOT NULL AND is_primary;
CREATE UNIQUE INDEX uq_crm_contacts_primary_customer ON crm_contacts(customer_id) WHERE customer_id IS NOT NULL AND is_primary;

CREATE TABLE crm_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_crm_competitors_name_ci ON crm_competitors (lower(name));

CREATE TABLE crm_opportunity_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES crm_opportunities(id) ON DELETE RESTRICT,
    competitor_id UUID NOT NULL REFERENCES crm_competitors(id) ON DELETE RESTRICT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_crm_opportunity_competitor UNIQUE (opportunity_id, competitor_id)
);
CREATE INDEX idx_crm_opportunity_competitors_opportunity ON crm_opportunity_competitors(opportunity_id);
CREATE INDEX idx_crm_opportunity_competitors_competitor ON crm_opportunity_competitors(competitor_id);
