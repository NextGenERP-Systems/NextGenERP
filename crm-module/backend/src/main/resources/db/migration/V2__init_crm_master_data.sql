-- V1__init_crm_master_data.sql

CREATE TABLE crm_sales_stages (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sequence_order INT NOT NULL,
    probability DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE crm_lead_sources (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE crm_opportunity_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE crm_lost_reasons (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE crm_market_segments (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

-- Insert Default Data
INSERT INTO crm_sales_stages (id, name, description, sequence_order, probability) VALUES
    (gen_random_uuid(), 'Prospecting', 'Initial contact and prospecting', 10, 10.00),
    (gen_random_uuid(), 'Qualification', 'Qualifying the lead', 20, 20.00),
    (gen_random_uuid(), 'Needs Analysis', 'Analyzing customer needs', 30, 40.00),
    (gen_random_uuid(), 'Value Proposition', 'Presenting value proposition', 40, 50.00),
    (gen_random_uuid(), 'Decision Makers', 'Identifying decision makers', 50, 60.00),
    (gen_random_uuid(), 'Perception Analysis', 'Analyzing perception', 60, 70.00),
    (gen_random_uuid(), 'Proposal/Price Quote', 'Sending proposal and quote', 70, 75.00),
    (gen_random_uuid(), 'Negotiation/Review', 'Negotiation and review', 80, 90.00),
    (gen_random_uuid(), 'Closed Won', 'Opportunity won', 90, 100.00),
    (gen_random_uuid(), 'Closed Lost', 'Opportunity lost', 100, 0.00);

INSERT INTO crm_lead_sources (id, name) VALUES
    (gen_random_uuid(), 'Website / Inbound'),
    (gen_random_uuid(), 'Outbound Cold Call'),
    (gen_random_uuid(), 'Outbound Email'),
    (gen_random_uuid(), 'Trade Show'),
    (gen_random_uuid(), 'Partner Referral'),
    (gen_random_uuid(), 'Social Media');

INSERT INTO crm_opportunity_types (id, name) VALUES
    (gen_random_uuid(), 'New Business'),
    (gen_random_uuid(), 'Existing Business - Upsell'),
    (gen_random_uuid(), 'Existing Business - Renewal');

INSERT INTO crm_lost_reasons (id, name) VALUES
    (gen_random_uuid(), 'Price too high'),
    (gen_random_uuid(), 'Missing feature'),
    (gen_random_uuid(), 'Lost to competitor'),
    (gen_random_uuid(), 'Project cancelled'),
    (gen_random_uuid(), 'No budget');

INSERT INTO crm_market_segments (id, name) VALUES
    (gen_random_uuid(), 'Enterprise'),
    (gen_random_uuid(), 'Mid-Market'),
    (gen_random_uuid(), 'SMB'),
    (gen_random_uuid(), 'Startup');
