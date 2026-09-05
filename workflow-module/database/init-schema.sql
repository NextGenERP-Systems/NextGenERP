-- ============================================================================
-- NextGen ERP - Document & Workflow Automation Module Schema (PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Shared Users (Mock for standalone testing)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS app_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES app_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS workflow_state_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_name VARCHAR(100) NOT NULL UNIQUE,
    color_code VARCHAR(20) DEFAULT '#000000',
    description VARCHAR(255)
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


CREATE TABLE IF NOT EXISTS workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    state_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(20) DEFAULT '#000000',
    is_initial_state BOOLEAN DEFAULT FALSE,
    is_final_state BOOLEAN DEFAULT FALSE,
    update_fields JSONB,
    allow_edit_role VARCHAR(255),
    send_email BOOLEAN,
    is_optional_state BOOLEAN,
    sla_days INTEGER,
    escalation_role VARCHAR(255),
    requires_all_roles BOOLEAN DEFAULT FALSE,
    required_roles VARCHAR(500),
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
    category VARCHAR(100) NOT NULL,
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
    amount DOUBLE PRECISION,
    status VARCHAR(100),
    gcs_attachment_url VARCHAR(500),
    owner_username VARCHAR(100) NOT NULL,
    assigned_username VARCHAR(100),
    pending_approvers VARCHAR(500),
    state_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    performed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Workflow Settings
CREATE TABLE IF NOT EXISTS workflow_settings (
    id BIGSERIAL PRIMARY KEY,
    enable_email_notifications BOOLEAN DEFAULT TRUE,
    default_auto_rejection_timeout_days INTEGER DEFAULT 7,
    strict_mode BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_docs_type ON documents(document_type);
CREATE INDEX idx_docs_state ON documents(current_state_id);
CREATE INDEX idx_docs_owner ON documents(owner_username);
CREATE INDEX idx_transitions_workflow ON workflow_transitions(workflow_id);
CREATE INDEX idx_notifs_user ON in_app_notifications(username);

