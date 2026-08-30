-- ==============================================================================
-- NEXTGEN ERP: FINANCE & ACCOUNTING - STANDARD CHART OF ACCOUNTS & SEED DATA
-- Reference: ERPNext Standard Chart of Accounts
-- ==============================================================================

-- 1. ROOT COST CENTERS
INSERT INTO cost_centers (id, cost_center_code, cost_center_name, is_group, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'CC-HQ', 'Headquarters & Core Platform', false, true),
('55555555-5555-5555-5555-555555555502', 'CC-SALES', 'Global Sales & Marketing', false, true),
('55555555-5555-5555-5555-555555555503', 'CC-ENG', 'Software Engineering & Cloud Ops', false, true)
ON CONFLICT (cost_center_code) DO NOTHING;

-- 2. CHART OF ACCOUNTS (ROOT GROUPS)
-- Assets Group (1000)
INSERT INTO chart_of_accounts (id, account_code, account_name, root_type, account_type, is_group, currency) VALUES
('10000000-0000-0000-0000-000000000000', '1000', 'Application of Funds (Assets)', 'ASSET', null, true, 'INR'),
('11000000-0000-0000-0000-000000000000', '1100', 'Current Assets', 'ASSET', null, true, 'INR'),
('11100000-0000-0000-0000-000000000000', '1110', 'Bank Accounts', 'ASSET', 'Bank', true, 'INR'),
('11100000-0000-0000-0000-000000000001', '1111', 'HDFC Bank Operating A/c', 'ASSET', 'Bank', false, 'INR'),
('11100000-0000-0000-0000-000000000002', '1112', 'ICICI Bank Current A/c', 'ASSET', 'Bank', false, 'INR'),
('11200000-0000-0000-0000-000000000000', '1120', 'Cash In Hand', 'ASSET', 'Cash', false, 'INR'),
('11300000-0000-0000-0000-000000000000', '1130', 'Accounts Receivable (Debtors)', 'ASSET', 'Receivable', false, 'INR'),
('11400000-0000-0000-0000-000000000000', '1140', 'Stock & Inventory Assets', 'ASSET', 'Stock', false, 'INR'),
('12000000-0000-0000-0000-000000000000', '1200', 'Fixed Assets', 'ASSET', 'Fixed Asset', false, 'INR')
ON CONFLICT (account_code) DO NOTHING;

-- Liabilities Group (2000)
INSERT INTO chart_of_accounts (id, account_code, account_name, root_type, account_type, is_group, currency) VALUES
('20000000-0000-0000-0000-000000000000', '2000', 'Source of Funds (Liabilities)', 'LIABILITY', null, true, 'INR'),
('21000000-0000-0000-0000-000000000000', '2100', 'Current Liabilities', 'LIABILITY', null, true, 'INR'),
('21100000-0000-0000-0000-000000000000', '2110', 'Accounts Payable (Creditors)', 'LIABILITY', 'Payable', false, 'INR'),
('21200000-0000-0000-0000-000000000000', '2120', 'Duties & Taxes (GST/TDS Payable)', 'LIABILITY', 'Tax', false, 'INR'),
('21300000-0000-0000-0000-000000000000', '2130', 'Payroll & Salary Payable', 'LIABILITY', 'Payable', false, 'INR')
ON CONFLICT (account_code) DO NOTHING;

-- Equity Group (3000)
INSERT INTO chart_of_accounts (id, account_code, account_name, root_type, account_type, is_group, currency) VALUES
('30000000-0000-0000-0000-000000000000', '3000', 'Capital & Equity', 'EQUITY', null, true, 'INR'),
('31000000-0000-0000-0000-000000000000', '3100', 'Share Capital', 'EQUITY', 'Equity', false, 'INR'),
('32000000-0000-0000-0000-000000000000', '3200', 'Retained Earnings', 'EQUITY', 'Equity', false, 'INR')
ON CONFLICT (account_code) DO NOTHING;

-- Income Group (4000)
INSERT INTO chart_of_accounts (id, account_code, account_name, root_type, account_type, is_group, currency) VALUES
('40000000-0000-0000-0000-000000000000', '4000', 'Income & Revenue', 'INCOME', null, true, 'INR'),
('41000000-0000-0000-0000-000000000000', '4100', 'Direct Sales & Enterprise Services', 'INCOME', 'Direct Income', false, 'INR'),
('42000000-0000-0000-0000-000000000000', '4200', 'SaaS Subscriptions & Licenses', 'INCOME', 'Direct Income', false, 'INR'),
('43000000-0000-0000-0000-000000000000', '4300', 'Other Operating Income', 'INCOME', 'Indirect Income', false, 'INR')
ON CONFLICT (account_code) DO NOTHING;

-- Expense Group (5000)
INSERT INTO chart_of_accounts (id, account_code, account_name, root_type, account_type, is_group, currency) VALUES
('50000000-0000-0000-0000-000000000000', '5000', 'Expenses', 'EXPENSE', null, true, 'INR'),
('51000000-0000-0000-0000-000000000000', '5100', 'Cost of Goods Sold (COGS)', 'EXPENSE', 'Cost of Goods Sold', false, 'INR'),
('52000000-0000-0000-0000-000000000000', '5200', 'Salaries & Employee Benefits', 'EXPENSE', 'Operating Expense', false, 'INR'),
('53000000-0000-0000-0000-000000000000', '5300', 'Cloud Infrastructure & Servers (GCP/AWS)', 'EXPENSE', 'Operating Expense', false, 'INR'),
('54000000-0000-0000-0000-000000000000', '5400', 'Sales, Marketing & Travel Expenses', 'EXPENSE', 'Operating Expense', false, 'INR'),
('55000000-0000-0000-0000-000000000000', '5500', 'Rent, Office & Administrative Exp', 'EXPENSE', 'Operating Expense', false, 'INR')
ON CONFLICT (account_code) DO NOTHING;

-- 3. DEFAULT CORPORATE BANK ACCOUNTS
INSERT INTO bank_accounts (id, account_name, bank_name, account_number, ifsc_code, swift_code, branch_name, gl_account_id, currency, current_balance) VALUES
('77777777-7777-7777-7777-777777777701', 'HDFC Primary Corporate Bank A/c', 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', 'HDFCINBBXXX', 'Koramangala Bangalore', '11100000-0000-0000-0000-000000000001', 'INR', 2500000.00),
('77777777-7777-7777-7777-777777777702', 'ICICI Commercial Treasury A/c', 'ICICI Bank Ltd', '000405009988', 'ICIC0000004', 'ICICINBBXXX', 'Indiranagar Bangalore', '11100000-0000-0000-0000-000000000002', 'INR', 1200000.00)
ON CONFLICT (account_number) DO NOTHING;

-- 4. TAX TEMPLATES
INSERT INTO tax_templates (id, title, tax_type, rate_percentage, account_id) VALUES
('88888888-8888-8888-8888-888888888801', 'GST 18% (Standard Enterprise Rate)', 'OUTPUT_GST', 18.00, '21200000-0000-0000-0000-000000000000'),
('88888888-8888-8888-8888-888888888802', 'GST 12% (IT Hardware & Peripherals)', 'OUTPUT_GST', 12.00, '21200000-0000-0000-0000-000000000000'),
('88888888-8888-8888-8888-888888888803', 'TDS 10% (Professional & Technical Fees)', 'TDS', 10.00, '21200000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;
