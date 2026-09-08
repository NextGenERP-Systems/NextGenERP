CREATE TABLE crm_leads (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    lead_source_id UUID REFERENCES crm_lead_sources(id),
    market_segment_id UUID REFERENCES crm_market_segments(id),
    status VARCHAR(50) NOT NULL, -- NEW, CONTACTED, QUALIFIED, UNQUALIFIED
    assigned_to UUID,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_prospects (
    id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    primary_contact_name VARCHAR(200),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL, -- ACTIVE, CONVERTED_TO_CUSTOMER, LOST
    customer_id UUID, -- Reference to existing Sales Customer (when converted)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_opportunities (
    id UUID PRIMARY KEY,
    opportunity_name VARCHAR(255) NOT NULL,
    prospect_id UUID REFERENCES crm_prospects(id),
    customer_id UUID, -- Either prospect_id or customer_id must be populated
    amount NUMERIC(15, 2),
    expected_close_date DATE,
    sales_stage_id UUID REFERENCES crm_sales_stages(id),
    opportunity_type_id UUID REFERENCES crm_opportunity_types(id),
    probability INTEGER,
    status VARCHAR(50) NOT NULL, -- OPEN, WON, LOST
    lost_reason_id UUID REFERENCES crm_lost_reasons(id),
    assigned_to UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for better lookup performance
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_prospects_status ON crm_prospects(status);
CREATE INDEX idx_crm_opportunities_status ON crm_opportunities(status);
CREATE INDEX idx_crm_opportunities_prospect_id ON crm_opportunities(prospect_id);
CREATE INDEX idx_crm_opportunities_customer_id ON crm_opportunities(customer_id);
