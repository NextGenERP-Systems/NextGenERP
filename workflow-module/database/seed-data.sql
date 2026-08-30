-- Seed Workflow
INSERT INTO workflows (id, workflow_name, document_type, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Standard Contract Approval', 'Contract', true);

-- Seed Actions
INSERT INTO workflow_actions (id, action_name, description) VALUES
('22222222-2222-2222-2222-222222222201', 'Approve', 'Approve the document'),
('22222222-2222-2222-2222-222222222202', 'Reject', 'Reject the document'),
('22222222-2222-2222-2222-222222222203', 'Submit', 'Submit for approval');

-- Seed States
INSERT INTO workflow_states (id, workflow_id, state_name, color_code, is_initial_state, is_final_state, update_field, update_value, allow_edit_role, send_email) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'Draft', '#94a3b8', true, false, 'status', 'Draft', 'ADMIN,EMPLOYEE', false),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'Pending Approval', '#f59e0b', false, false, 'status', 'Pending', NULL, true),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'Approved', '#10b981', false, true, 'status', 'Approved', NULL, false),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'Rejected', '#ef4444', false, true, 'status', 'Rejected', NULL, false);

-- Seed Transitions
INSERT INTO workflow_transitions (id, workflow_id, from_state_id, to_state_id, action_name, allowed_role, condition_expression, allow_self_approval, send_email_to_creator) VALUES
('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302', 'Submit', 'EMPLOYEE', NULL, true, false),
('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333303', 'Approve', 'ADMIN', '#doc.amount == null || #doc.amount < 10000', false, true),
('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333304', 'Reject', 'ADMIN', NULL, false, true);

-- Seed Templates
INSERT INTO document_templates (id, template_name, document_type, html_content, created_by, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'Standard NDA', 'Contract', '<h2>Non-Disclosure Agreement</h2><p>This is a standard NDA.</p>', 'system', true),
('55555555-5555-5555-5555-555555555502', 'Employment Contract', 'Contract', '<h2>Employment Contract</h2><p>Standard terms of employment.</p>', 'system', true);
