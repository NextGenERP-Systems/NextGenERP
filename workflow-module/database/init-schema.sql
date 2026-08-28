-- ============================================================================
-- NextGen ERP - Document & Workflow Automation Module Schema (PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Shared Users (Mock for standalone testing)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE
);

-- 1. Workflows & States
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(150) NOT NULL UNIQUE,
    document_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    state_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(20) DEFAULT '#000000',
    is_initial_state BOOLEAN DEFAULT FALSE,
    is_final_state BOOLEAN DEFAULT FALSE,
    update_field VARCHAR(255),
    update_value VARCHAR(255),
    allow_edit_role VARCHAR(255),
    send_email BOOLEAN,
    is_optional_state BOOLEAN,
    UNIQUE(workflow_id, state_name)
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    from_state_id UUID NOT NULL REFERENCES workflow_states(id),
    to_state_id UUID NOT NULL REFERENCES workflow_states(id),
    action_name VARCHAR(100) NOT NULL,
    allowed_role VARCHAR(100) NOT NULL,
    condition_expression VARCHAR(255),
    allow_self_approval BOOLEAN,
    send_email_to_creator BOOLEAN,
    UNIQUE(workflow_id, from_state_id, action_name)
);

-- 2. Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(200) NOT NULL UNIQUE,
    document_type VARCHAR(100) NOT NULL,
    html_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    template_id UUID REFERENCES document_templates(id),
    workflow_id UUID REFERENCES workflows(id),
    current_state_id UUID REFERENCES workflow_states(id),
    content_html TEXT,
    amount NUMERIC,
    status VARCHAR(100),
    gcs_attachment_url VARCHAR(500),
    owner_username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1
);

-- 4. Document Versions (Audit Trail)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content_html TEXT NOT NULL,
    gcs_attachment_url VARCHAR(500),
    modified_by VARCHAR(100) NOT NULL,
    change_summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Workflow History
CREATE TABLE IF NOT EXISTS workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    from_state_id UUID REFERENCES workflow_states(id),
    to_state_id UUID REFERENCES workflow_states(id),
    action_name VARCHAR(100),
    action_by VARCHAR(100) NOT NULL,
    action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- Indexes for performance
CREATE INDEX idx_docs_type ON documents(document_type);
CREATE INDEX idx_docs_state ON documents(current_state_id);
CREATE INDEX idx_docs_owner ON documents(owner_username);
CREATE INDEX idx_transitions_workflow ON workflow_transitions(workflow_id);
