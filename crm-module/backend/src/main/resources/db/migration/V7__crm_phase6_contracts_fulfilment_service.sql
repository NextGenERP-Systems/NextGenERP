CREATE TABLE crm_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    opportunity_id UUID REFERENCES crm_opportunities(id) ON DELETE RESTRICT,
    customer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','ACTIVE','EXPIRED','TERMINATED')),
    starts_on DATE,
    ends_on DATE,
    total_amount NUMERIC(15,2) NOT NULL CHECK (total_amount >= 0),
    currency CHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (opportunity_id IS NOT NULL OR customer_id IS NOT NULL),
    CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on)
);
CREATE INDEX idx_crm_contracts_customer ON crm_contracts(customer_id, created_at DESC);
CREATE INDEX idx_crm_contracts_opportunity ON crm_contracts(opportunity_id);
CREATE INDEX idx_crm_contracts_status_dates ON crm_contracts(status, starts_on, ends_on);

CREATE TABLE crm_contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES crm_contracts(id) ON DELETE RESTRICT,
    external_product_id UUID,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(15,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(40) NOT NULL DEFAULT 'UNIT',
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
    warranty_starts_on DATE,
    warranty_ends_on DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (warranty_starts_on IS NULL OR warranty_ends_on IS NULL OR warranty_ends_on >= warranty_starts_on)
);
CREATE INDEX idx_crm_contract_items_contract ON crm_contract_items(contract_id, created_at, id);

CREATE TABLE crm_contract_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES crm_contracts(id) ON DELETE RESTRICT,
    from_status VARCHAR(20) CHECK (from_status IS NULL OR from_status IN ('DRAFT','ACTIVE','EXPIRED','TERMINATED')),
    to_status VARCHAR(20) NOT NULL CHECK (to_status IN ('DRAFT','ACTIVE','EXPIRED','TERMINATED')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);
CREATE INDEX idx_crm_contract_events_contract ON crm_contract_events(contract_id, occurred_at, id);

CREATE TABLE crm_fulfilments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES crm_contracts(id) ON DELETE RESTRICT,
    contract_item_id UUID REFERENCES crm_contract_items(id) ON DELETE RESTRICT,
    fulfilment_type VARCHAR(20) NOT NULL CHECK (fulfilment_type IN ('DELIVERY','SERVICE')),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED'
        CHECK (status IN ('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED')),
    description VARCHAR(500) NOT NULL,
    planned_quantity NUMERIC(15,3) CHECK (planned_quantity IS NULL OR planned_quantity >= 0),
    completed_quantity NUMERIC(15,3) NOT NULL DEFAULT 0 CHECK (completed_quantity >= 0),
    planned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    external_reference VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (planned_quantity IS NULL OR completed_quantity <= planned_quantity)
);
CREATE INDEX idx_crm_fulfilments_contract ON crm_fulfilments(contract_id, planned_at, id);
CREATE INDEX idx_crm_fulfilments_status ON crm_fulfilments(status, planned_at);

CREATE TABLE crm_warranty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number VARCHAR(100) NOT NULL UNIQUE,
    contract_id UUID NOT NULL REFERENCES crm_contracts(id) ON DELETE RESTRICT,
    contract_item_id UUID REFERENCES crm_contract_items(id) ON DELETE RESTRICT,
    customer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED','WITHDRAWN')),
    issue VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT,
    reported_on DATE NOT NULL DEFAULT CURRENT_DATE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_crm_warranty_claims_contract ON crm_warranty_claims(contract_id, reported_on DESC);
CREATE INDEX idx_crm_warranty_claims_customer ON crm_warranty_claims(customer_id, reported_on DESC);
CREATE INDEX idx_crm_warranty_claims_status ON crm_warranty_claims(status, reported_on DESC);

CREATE TABLE crm_warranty_claim_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES crm_warranty_claims(id) ON DELETE RESTRICT,
    from_status VARCHAR(20) CHECK (from_status IS NULL OR from_status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED','WITHDRAWN')),
    to_status VARCHAR(20) NOT NULL CHECK (to_status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED','WITHDRAWN')),
    note TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID
);
CREATE INDEX idx_crm_warranty_claim_events_claim ON crm_warranty_claim_events(claim_id, occurred_at, id);

CREATE TABLE crm_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES crm_contracts(id) ON DELETE RESTRICT,
    contract_item_id UUID REFERENCES crm_contract_items(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','COMPLETED','CANCELLED')),
    starts_on DATE NOT NULL,
    ends_on DATE,
    interval_days INTEGER NOT NULL CHECK (interval_days BETWEEN 1 AND 3650),
    next_due_on DATE NOT NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (ends_on IS NULL OR ends_on >= starts_on),
    CHECK (contract_item_id IS NULL OR contract_id IS NOT NULL)
);
CREATE INDEX idx_crm_maintenance_schedules_due ON crm_maintenance_schedules(status, next_due_on);
CREATE INDEX idx_crm_maintenance_schedules_customer ON crm_maintenance_schedules(customer_id, next_due_on);

CREATE TABLE crm_maintenance_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES crm_maintenance_schedules(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','COMPLETED','CANCELLED','MISSED')),
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    assigned_to UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_crm_maintenance_visits_schedule ON crm_maintenance_visits(schedule_id, due_at, id);
CREATE INDEX idx_crm_maintenance_visits_status ON crm_maintenance_visits(status, due_at);
CREATE UNIQUE INDEX uq_crm_maintenance_visit_schedule_due ON crm_maintenance_visits(schedule_id, due_at);
