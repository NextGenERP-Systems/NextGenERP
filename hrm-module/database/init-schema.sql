-- ==============================================================================
-- NextGen ERP - Human Resource Management (HRM) Schema
-- Replicated from ERPNext Human Resources & Payroll (HRMS)
-- Database Engine: PostgreSQL 16+
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CORE ORGANIZATION STRUCTURE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_code VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_head_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designation_code VARCHAR(50) UNIQUE NOT NULL,
    designation_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. EMPLOYEE MASTER (EMPLOYEE 360)
-- ------------------------------------------------------------------------------

CREATE TYPE employee_status AS ENUM ('ACTIVE', 'PROBATION', 'SUSPENDED', 'LEFT');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    gender gender_type NOT NULL DEFAULT 'MALE',
    date_of_birth DATE,
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    status employee_status NOT NULL DEFAULT 'ACTIVE',
    employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
    
    -- Organizational Placement
    department_id UUID NOT NULL REFERENCES departments(id),
    designation_id UUID NOT NULL REFERENCES designations(id),
    branch_id UUID REFERENCES branches(id),
    reports_to_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Contact & Personal
    work_email VARCHAR(150) UNIQUE NOT NULL,
    personal_email VARCHAR(150),
    cell_number VARCHAR(30) NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_phone VARCHAR(30),
    address_line TEXT,
    city VARCHAR(100),
    pincode VARCHAR(20),
    
    -- Statutory & Banking
    pan_number VARCHAR(20),
    pf_number VARCHAR(50),
    esi_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(30),
    
    -- Profile Metadata
    avatar_url VARCHAR(255),
    notice_period_days INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Circular FK link for department head
ALTER TABLE departments 
ADD CONSTRAINT fk_department_head FOREIGN KEY (department_head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. SHIFTS & ATTENDANCE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS shift_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_name VARCHAR(100) UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    late_entry_grace_minutes INT DEFAULT 15,
    early_exit_grace_minutes INT DEFAULT 15,
    working_hours NUMERIC(4, 2) DEFAULT 8.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shift_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_type_id UUID NOT NULL REFERENCES shift_types(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    shift_type_id UUID REFERENCES shift_types(id),
    in_time TIMESTAMP WITH TIME ZONE,
    out_time TIMESTAMP WITH TIME ZONE,
    working_hours NUMERIC(4, 2) DEFAULT 8.00,
    late_entry_minutes INT DEFAULT 0,
    early_exit_minutes INT DEFAULT 0,
    overtime_hours NUMERIC(4, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, attendance_date)
);

-- ------------------------------------------------------------------------------
-- 4. LEAVE MANAGEMENT ENGINE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leave_type_code VARCHAR(30) UNIQUE NOT NULL,
    leave_type_name VARCHAR(100) NOT NULL,
    max_days_allowed INT NOT NULL DEFAULT 12,
    is_carry_forward BOOLEAN NOT NULL DEFAULT FALSE,
    max_carry_forward_days INT DEFAULT 0,
    is_lwp BOOLEAN NOT NULL DEFAULT FALSE, -- Leave Without Pay
    is_encashable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    fiscal_year INT NOT NULL,
    total_allocated NUMERIC(4, 1) NOT NULL,
    used_leaves NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    pending_leaves NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    remaining_leaves NUMERIC(4, 1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emp_leave_year UNIQUE (employee_id, leave_type_id, fiscal_year)
);

CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_leave_days NUMERIC(4, 1) NOT NULL,
    is_half_day BOOLEAN NOT NULL DEFAULT FALSE,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    approved_by_id UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE UNIQUE NOT NULL,
    holiday_name VARCHAR(150) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. PAYROLL & COMPENSATION ENGINE
-- ------------------------------------------------------------------------------

CREATE TYPE component_type AS ENUM ('EARNING', 'DEDUCTION');

CREATE TABLE IF NOT EXISTS salary_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_code VARCHAR(50) UNIQUE NOT NULL,
    component_name VARCHAR(150) NOT NULL,
    type component_type NOT NULL,
    description TEXT,
    is_tax_applicable BOOLEAN DEFAULT TRUE,
    is_depends_on_payment_days BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    structure_name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_structure_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
    salary_component_id UUID NOT NULL REFERENCES salary_components(id),
    amount NUMERIC(12, 2) NOT NULL,
    formula VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_structure_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id),
    from_date DATE NOT NULL,
    base_gross_pay NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE salary_slip_status AS ENUM ('DRAFT', 'SUBMITTED', 'PAID', 'CANCELLED');

CREATE TABLE IF NOT EXISTS salary_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slip_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    total_working_days NUMERIC(4, 1) NOT NULL DEFAULT 30,
    payment_days NUMERIC(4, 1) NOT NULL DEFAULT 30,
    absent_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    leave_without_pay_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    
    gross_pay NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_pay NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    rounded_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    in_words TEXT,
    
    status salary_slip_status NOT NULL DEFAULT 'DRAFT',
    bank_account_number VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_slip_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salary_slip_id UUID NOT NULL REFERENCES salary_slips(id) ON DELETE CASCADE,
    component_name VARCHAR(150) NOT NULL,
    type component_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    is_tax_applicable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. RECRUITMENT & APPLICANT PIPELINE
-- ------------------------------------------------------------------------------

CREATE TYPE job_status AS ENUM ('OPEN', 'ON_HOLD', 'CLOSED');

CREATE TABLE IF NOT EXISTS job_openings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_title VARCHAR(150) NOT NULL,
    job_code VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    designation_id UUID NOT NULL REFERENCES designations(id),
    vacancies INT NOT NULL DEFAULT 1,
    status job_status NOT NULL DEFAULT 'OPEN',
    location VARCHAR(100) DEFAULT 'HQ / Hybrid',
    min_experience_years NUMERIC(3, 1) DEFAULT 2.0,
    description TEXT,
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    closing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE applicant_stage AS ENUM ('APPLIED', 'SCREENING', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'OFFER_MADE', 'HIRED', 'REJECTED');

CREATE TABLE IF NOT EXISTS job_applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    job_opening_id UUID NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    current_company VARCHAR(150),
    current_ctc NUMERIC(12, 2),
    expected_ctc NUMERIC(12, 2),
    stage applicant_stage NOT NULL DEFAULT 'APPLIED',
    rating INT DEFAULT 3,
    resume_url VARCHAR(255),
    notes TEXT,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE & APPRAISALS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appraisal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appraisal_kras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES appraisal_templates(id) ON DELETE CASCADE,
    kra_title VARCHAR(150) NOT NULL,
    weightage_percent NUMERIC(5, 2) NOT NULL,
    description TEXT
);

CREATE TYPE appraisal_status AS ENUM ('DRAFT', 'SELF_APPRAISAL_PENDING', 'MANAGER_REVIEW_PENDING', 'COMPLETED');

CREATE TABLE IF NOT EXISTS employee_appraisals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appraisal_cycle VARCHAR(100) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES employees(id),
    template_id UUID NOT NULL REFERENCES appraisal_templates(id),
    status appraisal_status NOT NULL DEFAULT 'DRAFT',
    self_score NUMERIC(3, 2),
    manager_score NUMERIC(3, 2),
    final_score NUMERIC(3, 2),
    remarks TEXT,
    promotion_recommended BOOLEAN DEFAULT FALSE,
    increment_percentage NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. EXPENSE CLAIMS & ADVANCES
-- ------------------------------------------------------------------------------

CREATE TYPE expense_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID');

CREATE TABLE IF NOT EXISTS expense_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_type VARCHAR(100) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    sanctioned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status expense_status NOT NULL DEFAULT 'SUBMITTED',
    description TEXT,
    approved_by_id UUID REFERENCES employees(id),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- INDICES FOR HIGH PERFORMANCE
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_leaves_emp ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_salary_slips_emp ON salary_slips(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_date ON salary_slips(start_date, end_date);
