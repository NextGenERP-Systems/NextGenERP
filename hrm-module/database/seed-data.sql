-- ==============================================================================
-- NextGen ERP - Human Resource Management (HRM) Master Schema Seed Dataset
-- Setup Data for Departments, Designations, Branches, and Salary Components
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, department_code, department_name, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'DEPT-ENG', 'Software Engineering & Platform', TRUE),
('11111111-1111-1111-1111-111111111102', 'DEPT-PROD', 'Product Strategy & Design', TRUE),
('11111111-1111-1111-1111-111111111103', 'DEPT-SALES', 'Global Sales & Business Dev', TRUE),
('11111111-1111-1111-1111-111111111104', 'DEPT-HR', 'Human Resources & People Ops', TRUE),
('11111111-1111-1111-1111-111111111105', 'DEPT-FIN', 'Finance, Tax & Legal', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. DESIGNATIONS
INSERT INTO designations (id, designation_code, designation_name, description, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'DESG-VP-ENG', 'VP of Engineering', 'Leads technical architecture and engineering managers', TRUE),
('22222222-2222-2222-2222-222222222202', 'DESG-PR-ENG', 'Principal Software Architect', 'Oversees distributed systems and core cloud platform', TRUE),
('22222222-2222-2222-2222-222222222203', 'DESG-SR-DEV', 'Senior Full-Stack Engineer', 'Specializes in Java/Spring and Next.js ecosystem', TRUE),
('22222222-2222-2222-2222-222222222204', 'DESG-HR-DIR', 'Director of People Operations', 'Directs talent acquisition, retention and payroll compliance', TRUE),
('22222222-2222-2222-2222-222222222205', 'DESG-SALES-LEAD', 'Enterprise Sales Director', 'Leads enterprise accounts and high-ticket CRM pipeline', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. BRANCHES
INSERT INTO branches (id, branch_code, branch_name, city, state, country, is_active) VALUES
('33333333-3333-3333-3333-333333333301', 'BR-HQ-BLR', 'Bengaluru Innovation Tech Park', 'Bengaluru', 'Karnataka', 'India', TRUE),
('33333333-3333-3333-3333-333333333302', 'BR-MUM-FIN', 'Mumbai Financial Center', 'Mumbai', 'Maharashtra', 'India', TRUE),
('33333333-3333-3333-3333-333333333303', 'BR-HYD-RND', 'Hyderabad Cloud Center', 'Hyderabad', 'Telangana', 'India', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. LEAVE TYPES
INSERT INTO leave_types (id, leave_type_code, leave_type_name, max_days_allowed, is_carry_forward, max_carry_forward_days, is_lwp, is_encashable) VALUES
('33333333-3333-3333-3333-333333333301', 'PL', 'Privilege / Earned Leave', 18, TRUE, 45, FALSE, TRUE),
('33333333-3333-3333-3333-333333333302', 'CL', 'Casual Leave', 12, FALSE, 0, FALSE, FALSE),
('33333333-3333-3333-3333-333333333303', 'SL', 'Sick / Medical Leave', 10, TRUE, 30, FALSE, FALSE),
('33333333-3333-3333-3333-333333333304', 'LOP', 'Loss of Pay (Unpaid)', 90, FALSE, 0, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 5. SHIFT TYPES
INSERT INTO shift_types (id, shift_name, start_time, end_time, late_entry_grace_minutes, early_exit_grace_minutes, working_hours, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'General Day Shift (HQ)', '09:00:00', '18:00:00', 15, 15, 8.0, TRUE),
('55555555-5555-5555-5555-555555555502', 'US Overlap Shift (Engineering)', '14:00:00', '23:00:00', 15, 15, 8.0, TRUE),
('55555555-5555-5555-5555-555555555503', 'Flexible Remote Shift', '10:00:00', '19:00:00', 30, 30, 8.0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SALARY COMPONENTS
INSERT INTO salary_components (id, component_code, component_name, type, is_tax_applicable, formula_expression, description) VALUES
('66666666-6666-6666-6666-666666666601', 'BASIC', 'Basic Salary', 'EARNING', TRUE, 'base * 0.50', 'Primary base pay component (50% of CTC)'),
('66666666-6666-6666-6666-666666666602', 'HRA', 'House Rent Allowance', 'EARNING', TRUE, 'basic * 0.50', 'Tax-exempt house rent allowance component'),
('66666666-6666-6666-6666-666666666603', 'SPL_ALLOW', 'Special Allowance', 'EARNING', TRUE, 'base * 0.25', 'Flexible balancing taxable allowance component'),
('66666666-6666-6666-6666-666666666604', 'PF_DEDUCT', 'Provident Fund (Employee)', 'DEDUCTION', FALSE, 'basic * 0.12', 'Statutory employee PF contribution (12% of Basic)'),
('66666666-6666-6666-6666-666666666605', 'PT_DEDUCT', 'Professional Tax', 'DEDUCTION', FALSE, '200', 'State professional tax monthly statutory deduction'),
('66666666-6666-6666-6666-666666666606', 'TDS', 'Income Tax Deducted at Source', 'DEDUCTION', FALSE, 'slab_calc', 'Direct income tax withholding per Indian IT slabs')
ON CONFLICT (id) DO NOTHING;
