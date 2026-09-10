-- ============================================================================
-- NextGen ERP - Workflow & Document Automation Module Unified Seed Data
-- ============================================================================

-- 1. Standard Contract Approval Workflow
INSERT INTO workflows (id, workflow_name, document_type, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Standard Contract Approval', 'Contract', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Sales Order High-Value Approval Workflow
INSERT INTO workflows (id, workflow_name, document_type, is_active) VALUES
('11111111-1111-1111-1111-111111111112', 'Sales Order Approval Workflow', 'Sales Order', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Actions
INSERT INTO workflow_actions (id, action_name, description) VALUES
('22222222-2222-2222-2222-222222222201', 'Approve', 'Approve the document or sales order'),
('22222222-2222-2222-2222-222222222202', 'Reject', 'Reject and send back for revisions'),
('22222222-2222-2222-2222-222222222203', 'Submit', 'Submit for multi-level manager approval')
ON CONFLICT (id) DO NOTHING;

-- Seed States for Standard Contract
INSERT INTO workflow_states (id, workflow_id, state_name, color_code, is_initial_state, is_final_state, update_field, update_value, allow_edit_role, send_email) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'Draft', '#94a3b8', true, false, 'status', 'Draft', 'ROLE_ADMIN,ROLE_SALES_USER', false),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'Pending Approval', '#f59e0b', false, false, 'status', 'Pending', NULL, true),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'Approved', '#10b981', false, true, 'status', 'Approved', NULL, false),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'Rejected', '#ef4444', false, true, 'status', 'Rejected', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Seed States for Sales Order Workflow
INSERT INTO workflow_states (id, workflow_id, state_name, color_code, is_initial_state, is_final_state, update_field, update_value, allow_edit_role, send_email) VALUES
('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111112', 'Draft Order', '#94a3b8', true, false, 'status', 'DRAFT', 'ROLE_SALES_USER,ROLE_ADMIN', false),
('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111112', 'Manager Review', '#f59e0b', false, false, 'status', 'TO_DELIVER_AND_BILL', NULL, true),
('33333333-3333-3333-3333-333333333313', '11111111-1111-1111-1111-111111111112', 'Order Confirmed', '#10b981', false, true, 'status', 'COMPLETED', NULL, true),
('33333333-3333-3333-3333-333333333314', '11111111-1111-1111-1111-111111111112', 'Order Rejected', '#ef4444', false, true, 'status', 'CANCELLED', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Transitions for Standard Contract
INSERT INTO workflow_transitions (id, workflow_id, from_state_id, to_state_id, action_name, allowed_role, condition_expression, allow_self_approval, send_email_to_creator) VALUES
('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302', 'Submit', 'ROLE_SALES_USER', NULL, true, false),
('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333303', 'Approve', 'ROLE_ADMIN', '#doc.amount == null || #doc.amount < 50000', false, true),
('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333304', 'Reject', 'ROLE_ADMIN', NULL, false, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Document Templates
INSERT INTO document_templates (id, template_name, document_type, html_content, created_by, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'Standard NDA', 'Contract', '<h2>Non-Disclosure Agreement</h2><p>This is a standard Mutual Non-Disclosure Agreement for commercial engagements.</p>', 'admin', true),
('55555555-5555-5555-5555-555555555502', 'Sales Master Services Agreement', 'Contract', '<h2>Master Services Agreement (MSA)</h2><p>Standard terms of sales, warranty, and deliverables for Enterprise Sales.</p>', 'admin', true),
('55555555-5555-5555-5555-555555555503', 'Commercial Quotation Pro-Forma', 'Quotation', '<h2>Commercial Quotation</h2><p>Formal quotation proposal with dynamic pricing, discounts, and terms.</p>', 'admin', true)
ON CONFLICT (id) DO NOTHING;
