-- ============================================================================
-- NextGen ERP - Sales (Selling) Module Seed Dataset
-- ============================================================================

-- 1. Customer Groups
INSERT INTO customer_groups (id, name, is_group) VALUES
('11111111-1111-1111-1111-111111111101', 'Commercial Enterprise', FALSE),
('11111111-1111-1111-1111-111111111102', 'Government & Public Sector', FALSE),
('11111111-1111-1111-1111-111111111103', 'Small & Medium Business', FALSE),
('11111111-1111-1111-1111-111111111104', 'Direct Retail', FALSE)
ON CONFLICT (name) DO NOTHING;

-- 2. Territories
INSERT INTO territories (id, name, is_group) VALUES
('22222222-2222-2222-2222-222222222201', 'North America - US East', FALSE),
('22222222-2222-2222-2222-222222222202', 'North America - US West', FALSE),
('22222222-2222-2222-2222-222222222203', 'Europe - Central', FALSE),
('22222222-2222-2222-2222-222222222204', 'Asia Pacific - India', FALSE)
ON CONFLICT (name) DO NOTHING;

-- 3. Price Lists
INSERT INTO price_lists (id, price_list_name, currency, buying, selling, enabled) VALUES
('33333333-3333-3333-3333-333333333301', 'Standard Selling (INR)', 'INR', FALSE, TRUE, TRUE),
('33333333-3333-3333-3333-333333333302', 'Enterprise Tier-1 (INR)', 'INR', FALSE, TRUE, TRUE)
ON CONFLICT (price_list_name) DO NOTHING;

-- 4. Items Master
INSERT INTO items (id, item_code, item_name, item_group, stock_uom, is_stock_item, is_sales_item, standard_rate, valuation_rate, max_discount) VALUES
('44444444-4444-4444-4444-444444444401', 'ERP-CLOUD-ENT', 'NextGen Cloud ERP Enterprise License', 'Software Licenses', 'Nos', FALSE, TRUE, 12000.00, 2000.00, 25.00),
('44444444-4444-4444-4444-444444444402', 'ERP-IMPL-SERV', 'ERP Implementation & Migration Services', 'Services', 'Hours', FALSE, TRUE, 150.00, 50.00, 15.00),
('44444444-4444-4444-4444-444444444403', 'SRV-RACK-2U', 'NextGen Edge Server Appliance 2U', 'Hardware', 'Nos', TRUE, TRUE, 4500.00, 2800.00, 10.00),
('44444444-4444-4444-4444-444444444404', 'IOT-GW-IND', 'Industrial IoT Telemetry Gateway', 'Hardware', 'Nos', TRUE, TRUE, 850.00, 480.00, 12.00),
('44444444-4444-4444-4444-444444444405', 'SUP-SLA-247', '24/7 Enterprise Platinum Support', 'Service SLA', 'Years', FALSE, TRUE, 6000.00, 1000.00, 20.00)
ON CONFLICT (item_code) DO NOTHING;

-- Item Prices
INSERT INTO item_prices (id, item_id, price_list_id, price_list_rate) VALUES
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 12000.00),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 150.00),
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 4500.00),
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 850.00),
('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333301', 6000.00)
ON CONFLICT (item_id, price_list_id) DO NOTHING;

-- 5. Sales Tax Template
INSERT INTO sales_tax_templates (id, title, company, is_default) VALUES
('66666666-6666-6666-6666-666666666601', 'Standard State & Federal Tax (8.25%)', 'NextGen Corp', TRUE)
ON CONFLICT (title) DO NOTHING;

INSERT INTO sales_tax_template_details (template_id, charge_type, account_head, rate, description, row_order) VALUES
('66666666-6666-6666-6666-666666666601', 'ON_NET_TOTAL', 'Output VAT / State Sales Tax', 6.2500, 'State Sales Tax 6.25%', 1),
('66666666-6666-6666-6666-666666666601', 'ON_NET_TOTAL', 'Municipal Infrastructure Surcharge', 2.0000, 'City/Municipal Surcharge 2.0%', 2)
ON CONFLICT DO NOTHING;

-- 6. Customer Master Seed
INSERT INTO customers (id, customer_code, customer_name, customer_type, customer_group_id, territory_id, default_currency, credit_limit, outstanding_balance, email, phone, website) VALUES
('77777777-7777-7777-7777-777777777701', 'CUST-001', 'Apex Global Technologies LLC', 'COMPANY', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'INR', 150000.00, 24500.00, 'procurement@apexglobal.io', '+1 (555) 234-8800', 'https://apexglobal.io'),
('77777777-7777-7777-7777-777777777702', 'CUST-002', 'Vanguard Industrial Robotics Inc', 'COMPANY', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 'INR', 80000.00, 12000.00, 'supplychain@vanguardrobotics.com', '+1 (555) 891-3420', 'https://vanguardrobotics.com'),
('77777777-7777-7777-7777-777777777703', 'CUST-003', 'BlueSky Logistics Corp', 'COMPANY', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', 'INR', 50000.00, 48500.00, 'accounts@blueskylogistics.net', '+1 (555) 431-7711', 'https://blueskylogistics.net'),
('77777777-7777-7777-7777-777777777704', 'CUST-004', 'Quantum Health Systems', 'COMPANY', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 'INR', 200000.00, 0.00, 'operations@quantumhealth.org', '+44 20 7946 0192', 'https://quantumhealth.org')
ON CONFLICT (customer_code) DO NOTHING;

-- Addresses & Contacts
INSERT INTO customer_addresses (customer_id, address_title, address_type, address_line1, city, state, country, pincode, is_primary_address, is_shipping_address) VALUES
('77777777-7777-7777-7777-777777777701', 'Apex HQ Austin', 'Billing', '500 Congress Avenue, Suite 1400', 'Austin', 'Texas', 'United States', '78701', TRUE, TRUE),
('77777777-7777-7777-7777-777777777702', 'Vanguard San Jose Plant', 'Billing', '220 Innovation Way', 'San Jose', 'California', 'United States', '95134', TRUE, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO customer_contacts (customer_id, first_name, last_name, email_id, mobile_no, designation, is_primary_contact) VALUES
('77777777-7777-7777-7777-777777777701', 'Eleanor', 'Vance', 'e.vance@apexglobal.io', '+1-512-555-0199', 'VP of Procurement', TRUE),
('77777777-7777-7777-7777-777777777702', 'Marcus', 'Sterling', 'm.sterling@vanguardrobotics.com', '+1-408-555-0812', 'Chief Technology Officer', TRUE)
ON CONFLICT DO NOTHING;

-- 7. Quotations Seed
INSERT INTO quotations (id, quotation_number, transaction_date, valid_till, customer_id, customer_name, order_type, status, currency, net_total, base_net_total, total_taxes_and_charges, base_total_taxes_and_charges, grand_total, base_grand_total, notes) VALUES
('88888888-8888-8888-8888-888888888801', 'SAL-QTN-2026-0001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', '77777777-7777-7777-7777-777777777701', 'Apex Global Technologies LLC', 'SALES', 'OPEN', 'INR', 30000.00, 30000.00, 2475.00, 2475.00, 32475.00, 32475.00, 'Comprehensive Cloud ERP roll-out with 100 hours implementation package.'),
('88888888-8888-8888-8888-888888888802', 'SAL-QTN-2026-0002', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', '77777777-7777-7777-7777-777777777702', 'Vanguard Industrial Robotics Inc', 'SALES', 'ORDERED', 'INR', 18500.00, 18500.00, 1526.25, 1526.25, 20026.25, 20026.25, 'Industrial IoT Telemetry kit with 2 Edge Servers.')
ON CONFLICT (quotation_number) DO NOTHING;

-- Quotation Items
INSERT INTO quotation_items (quotation_id, idx, item_id, item_code, item_name, qty, rate, base_rate, amount, base_amount, net_rate, net_amount, base_net_amount) VALUES
('88888888-8888-8888-8888-888888888801', 1, '44444444-4444-4444-4444-444444444401', 'ERP-CLOUD-ENT', 'NextGen Cloud ERP Enterprise License', 2.0000, 12000.00, 12000.00, 24000.00, 24000.00, 12000.00, 24000.00, 24000.00),
('88888888-8888-8888-8888-888888888801', 2, '44444444-4444-4444-4444-444444444405', 'SUP-SLA-247', '24/7 Enterprise Platinum Support', 1.0000, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00),
('88888888-8888-8888-8888-888888888802', 1, '44444444-4444-4444-4444-444444444403', 'SRV-RACK-2U', 'NextGen Edge Server Appliance 2U', 2.0000, 4500.00, 4500.00, 9000.00, 9000.00, 4500.00, 9000.00, 9000.00),
('88888888-8888-8888-8888-888888888802', 2, '44444444-4444-4444-4444-444444444404', 'IOT-GW-IND', 'Industrial IoT Telemetry Gateway', 10.0000, 850.00, 850.00, 8500.00, 8500.00, 850.00, 8500.00, 8500.00),
('88888888-8888-8888-8888-888888888802', 3, '44444444-4444-4444-4444-444444444402', 'ERP-IMPL-SERV', 'ERP Implementation & Migration Services', 10.0000, 100.00, 100.00, 1000.00, 1000.00, 100.00, 1000.00, 1000.00)
ON CONFLICT DO NOTHING;

-- 8. Sales Orders Seed
INSERT INTO sales_orders (id, order_number, transaction_date, delivery_date, po_no, customer_id, customer_name, order_type, status, delivery_status, billing_status, currency, net_total, base_net_total, total_taxes_and_charges, base_total_taxes_and_charges, grand_total, base_grand_total, per_delivered, per_billed, reserve_stock, amount_eligible_for_commission, commission_rate, total_commission) VALUES
('99999999-9999-9999-9999-999999999901', 'SAL-ORD-2026-0001', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '14 days', 'PO-APEX-9921', '77777777-7777-7777-7777-777777777701', 'Apex Global Technologies LLC', 'SALES', 'TO_DELIVER_AND_BILL', 'NOT_DELIVERED', 'NOT_BILLED', 'INR', 30000.00, 30000.00, 2475.00, 2475.00, 32475.00, 32475.00, 0.00, 0.00, TRUE, 30000.00, 5.00, 1500.00),
('99999999-9999-9999-9999-999999999902', 'SAL-ORD-2026-0002', CURRENT_DATE - INTERVAL '1 days', CURRENT_DATE + INTERVAL '7 days', 'PO-VG-7788', '77777777-7777-7777-7777-777777777702', 'Vanguard Industrial Robotics Inc', 'SALES', 'COMPLETED', 'FULLY_DELIVERED', 'FULLY_BILLED', 'INR', 18500.00, 18500.00, 1526.25, 1526.25, 20026.25, 20026.25, 100.00, 100.00, TRUE, 18500.00, 6.00, 1110.00)
ON CONFLICT (order_number) DO NOTHING;

-- Sales Order Items
INSERT INTO sales_order_items (id, sales_order_id, idx, item_id, item_code, item_name, delivery_date, qty, rate, base_rate, amount, base_amount, net_rate, net_amount, base_net_amount, valuation_rate, gross_profit) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '99999999-9999-9999-9999-999999999901', 1, '44444444-4444-4444-4444-444444444401', 'ERP-CLOUD-ENT', 'NextGen Cloud ERP Enterprise License', CURRENT_DATE + INTERVAL '14 days', 2.0000, 12000.00, 12000.00, 24000.00, 24000.00, 12000.00, 24000.00, 24000.00, 2000.00, 20000.00),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '99999999-9999-9999-9999-999999999901', 2, '44444444-4444-4444-4444-444444444405', 'SUP-SLA-247', '24/7 Enterprise Platinum Support', CURRENT_DATE + INTERVAL '14 days', 1.0000, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 6000.00, 1000.00, 5000.00),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '99999999-9999-9999-9999-999999999902', 1, '44444444-4444-4444-4444-444444444403', 'SRV-RACK-2U', 'NextGen Edge Server Appliance 2U', CURRENT_DATE + INTERVAL '7 days', 2.0000, 4500.00, 4500.00, 9000.00, 9000.00, 4500.00, 9000.00, 9000.00, 2800.00, 3400.00),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '99999999-9999-9999-9999-999999999902', 2, '44444444-4444-4444-4444-444444444404', 'IOT-GW-IND', 'Industrial IoT Telemetry Gateway', CURRENT_DATE + INTERVAL '7 days', 10.0000, 850.00, 850.00, 8500.00, 8500.00, 850.00, 8500.00, 8500.00, 480.00, 3700.00),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '99999999-9999-9999-9999-999999999902', 3, '44444444-4444-4444-4444-444444444402', 'ERP-IMPL-SERV', 'ERP Implementation & Migration Services', CURRENT_DATE + INTERVAL '7 days', 10.0000, 100.00, 100.00, 1000.00, 1000.00, 100.00, 1000.00, 1000.00, 50.00, 500.00)
ON CONFLICT DO NOTHING;

-- Sales Team Split
INSERT INTO sales_teams (voucher_type, voucher_id, sales_person_name, allocated_percentage, allocated_amount, commission_rate, incentives) VALUES
('Sales Order', '99999999-9999-9999-9999-999999999901', 'Sarah Jenkins (Account Lead)', 70.00, 21000.00, 5.00, 1050.00),
('Sales Order', '99999999-9999-9999-9999-999999999901', 'Alex Rivera (Solutions Engineer)', 30.00, 9000.00, 5.00, 450.00)
ON CONFLICT DO NOTHING;

-- Taxes on Sales Orders
INSERT INTO sales_taxes_and_charges (voucher_type, voucher_id, idx, charge_type, account_head, description, rate, tax_amount, total, base_tax_amount, base_total) VALUES
('Sales Order', '99999999-9999-9999-9999-999999999901', 1, 'ON_NET_TOTAL', 'Output VAT / State Sales Tax', 'State Sales Tax 6.25%', 6.2500, 1875.00, 31875.00, 1875.00, 31875.00),
('Sales Order', '99999999-9999-9999-9999-999999999901', 2, 'ON_NET_TOTAL', 'Municipal Infrastructure Surcharge', 'City/Municipal Surcharge 2.0%', 2.0000, 600.00, 32475.00, 600.00, 32475.00)
ON CONFLICT DO NOTHING;
