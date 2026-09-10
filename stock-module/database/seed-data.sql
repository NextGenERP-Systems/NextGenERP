-- NextGen ERP - Stock & Inventory Module Realistic Seed Data

SET search_path TO stock, public;

-- 1. UOMs
INSERT INTO uoms (id, uom_name, symbol, must_be_whole_number) VALUES
('uom-nos', 'Numbers / Units', 'Nos', TRUE),
('uom-kg', 'Kilograms', 'Kg', FALSE),
('uom-meter', 'Meters', 'm', FALSE),
('uom-box', 'Boxes (10 pcs)', 'Box', TRUE),
('uom-liter', 'Liters', 'L', FALSE),
('uom-set', 'Sets', 'Set', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Item Groups
INSERT INTO item_groups (id, name, parent_id, is_group, description) VALUES
('ig-root', 'All Item Groups', NULL, TRUE, 'Root Category'),
('ig-raw', 'Raw Materials', 'ig-root', FALSE, 'Metals, polymers, and raw inputs'),
('ig-elec', 'Electronics & Chips', 'ig-root', FALSE, 'Microprocessors, motherboards, capacitors'),
('ig-sub', 'Sub-Assemblies', 'ig-root', FALSE, 'Partially assembled components'),
('ig-fg', 'Finished Goods', 'ig-root', FALSE, 'Commercial products ready for customer dispatch'),
('ig-consumable', 'Consumables & Packaging', 'ig-root', FALSE, 'Boxes, tape, lubricant, PPE')
ON CONFLICT (id) DO NOTHING;

-- 3. Warehouses
INSERT INTO warehouses (id, warehouse_name, parent_warehouse_id, is_group, warehouse_type, city, state, country) VALUES
('wh-root', 'All Warehouses - NC', NULL, TRUE, 'Stores', 'San Francisco', 'California', 'USA'),
('wh-main', 'Central Stores - Rack A', 'wh-root', FALSE, 'Stores', 'San Francisco', 'California', 'USA'),
('wh-wip', 'Work In Progress Floor', 'wh-root', FALSE, 'Work In Progress', 'San Francisco', 'California', 'USA'),
('wh-fg', 'Finished Goods Distribution Center', 'wh-root', FALSE, 'Finished Goods', 'San Jose', 'California', 'USA'),
('wh-quar', 'Quarantine & QC Inspection Bay', 'wh-root', FALSE, 'Quarantine', 'San Francisco', 'California', 'USA'),
('wh-transit', 'In-Transit Fleet Warehouse', 'wh-root', FALSE, 'Transit', 'Oakland', 'California', 'USA'),
('wh-scrap', 'Scrap & Defective Store', 'wh-root', FALSE, 'Scrap', 'San Francisco', 'California', 'USA')
ON CONFLICT (id) DO NOTHING;

-- 4. Items Master
INSERT INTO items (id, item_code, item_name, item_group_id, stock_uom, valuation_method, standard_rate, opening_stock, safety_stock, lead_time_days, has_batch_no, has_serial_no, inspection_required_before_receipt, default_warehouse_id, description, barcode) VALUES
('item-cpu-01', 'ITEM-CPU-X9', 'NextGen Core Processor X9 Octa-Core', 'ig-elec', 'uom-nos', 'FIFO', 320.0000, 150.0000, 25.0000, 7, FALSE, TRUE, TRUE, 'wh-main', 'High performance enterprise AI server processor', '890123450001'),
('item-ram-02', 'ITEM-RAM-DDR5', '64GB DDR5 ECC Server Memory Module', 'ig-elec', 'uom-nos', 'FIFO', 140.0000, 300.0000, 50.0000, 5, TRUE, FALSE, FALSE, 'wh-main', 'High-speed ECC server RAM with thermal spreader', '890123450002'),
('item-case-03', 'ITEM-SRV-CHASSIS', '4U Rackmount Server Chassis Aluminum', 'ig-raw', 'uom-nos', 'Moving Average', 210.0000, 80.0000, 15.0000, 12, FALSE, FALSE, FALSE, 'wh-main', 'Heavy-duty aluminum chassis with hot-swap bays', '890123450003'),
('item-serv-04', 'ITEM-SRV-ENTERPRISE', 'NextGen AI Enterprise Rack Server 4U', 'ig-fg', 'uom-nos', 'FIFO', 2850.0000, 45.0000, 10.0000, 14, TRUE, TRUE, TRUE, 'wh-fg', 'Fully assembled 4U AI Inference server ready for shipment', '890123450004'),
('item-box-05', 'ITEM-PACK-CORRUGATED', 'Heavy Duty Corrugated Shipping Box 4U', 'ig-consumable', 'uom-nos', 'Moving Average', 8.5000, 500.0000, 100.0000, 3, FALSE, FALSE, FALSE, 'wh-main', 'Reinforced double-wall packaging box', '890123450005'),
('item-cable-06', 'ITEM-SFP-FIBER', '100Gbps SFP28 Fiber Optic Patch Cable 5m', 'ig-elec', 'uom-nos', 'FIFO', 45.0000, 220.0000, 40.0000, 4, FALSE, FALSE, FALSE, 'wh-main', 'High-density fiber patch cords for server interconnects', '890123450006')
ON CONFLICT (id) DO NOTHING;

-- 5. Bins (Initial Balances & Projected Quantities)
INSERT INTO bins (id, item_id, warehouse_id, actual_qty, ordered_qty, reserved_qty, indented_qty, planned_qty, projected_qty, valuation_rate, stock_value, stock_queue) VALUES
('bin-1', 'item-cpu-01', 'wh-main', 150.0000, 50.0000, 20.0000, 0.0000, 0.0000, 180.0000, 320.0000, 48000.0000, '[{"qty": 150, "rate": 320.0}]'::jsonb),
('bin-2', 'item-ram-02', 'wh-main', 300.0000, 100.0000, 40.0000, 0.0000, 0.0000, 360.0000, 140.0000, 42000.0000, '[{"qty": 300, "rate": 140.0}]'::jsonb),
('bin-3', 'item-case-03', 'wh-main', 80.0000, 20.0000, 10.0000, 0.0000, 0.0000, 90.0000, 210.0000, 16800.0000, '[{"qty": 80, "rate": 210.0}]'::jsonb),
('bin-4', 'item-serv-04', 'wh-fg', 45.0000, 0.0000, 12.0000, 0.0000, 25.0000, 58.0000, 2850.0000, 128250.0000, '[{"qty": 45, "rate": 2850.0}]'::jsonb),
('bin-5', 'item-box-05', 'wh-main', 500.0000, 200.0000, 50.0000, 0.0000, 0.0000, 650.0000, 8.5000, 4250.0000, '[{"qty": 500, "rate": 8.5}]'::jsonb),
('bin-6', 'item-cable-06', 'wh-main', 220.0000, 50.0000, 30.0000, 0.0000, 0.0000, 240.0000, 45.0000, 9900.0000, '[{"qty": 220, "rate": 45.0}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Batches
INSERT INTO batches (id, batch_id, item_id, manufacturing_date, expiry_date, batch_qty, supplier_batch_no, description) VALUES
('batch-ram-2026-01', 'BATCH-RAM-2026-Q1', 'item-ram-02', '2026-01-10', '2029-01-10', 300.0000, 'MICRON-US-9811', 'Q1 Certified ECC DDR5 Server Ram Batch'),
('batch-srv-2026-01', 'BATCH-SRV-PROD-09', 'item-serv-04', '2026-02-15', '2031-02-15', 45.0000, 'NG-PLANT-SF-01', 'Enterprise Server Batch Line A')
ON CONFLICT (id) DO NOTHING;

-- 7. Serial Numbers
INSERT INTO serial_nos (id, serial_no, item_id, warehouse_id, batch_id, status, purchase_rate, warranty_expiry_date) VALUES
('sn-cpu-1001', 'SN-CPU-99001', 'item-cpu-01', 'wh-main', NULL, 'Active', 320.0000, '2029-02-28'),
('sn-cpu-1002', 'SN-CPU-99002', 'item-cpu-01', 'wh-main', NULL, 'Active', 320.0000, '2029-02-28'),
('sn-cpu-1003', 'SN-CPU-99003', 'item-cpu-01', 'wh-main', NULL, 'Active', 320.0000, '2029-02-28'),
('sn-srv-2001', 'SN-SRV-AI-5001', 'item-serv-04', 'wh-fg', 'batch-srv-2026-01', 'Active', 2850.0000, '2030-01-15'),
('sn-srv-2002', 'SN-SRV-AI-5002', 'item-serv-04', 'wh-fg', 'batch-srv-2026-01', 'Active', 2850.0000, '2030-01-15')
ON CONFLICT (id) DO NOTHING;

-- 8. Stock Entries (Sample Transactions)
INSERT INTO stock_entries (id, entry_number, purpose, posting_date, posting_time, from_warehouse_id, to_warehouse_id, total_incoming_value, total_outgoing_value, value_difference, status, remarks) VALUES
('se-rec-001', 'MAT-REC-2026-001', 'Material Receipt', '2026-02-01', '10:00:00', NULL, 'wh-main', 48000.0000, 0.0000, 48000.0000, 'Submitted', 'Initial procurement of Core Processors'),
('se-trf-002', 'MAT-TRF-2026-002', 'Material Transfer', '2026-02-10', '14:30:00', 'wh-main', 'wh-wip', 6400.0000, 6400.0000, 0.0000, 'Submitted', 'Transfer raw materials to WIP floor for assembly'),
('se-mfg-003', 'MFG-ENTRY-2026-003', 'Manufacture', '2026-02-15', '18:00:00', 'wh-wip', 'wh-fg', 128250.0000, 115000.0000, 13250.0000, 'Submitted', 'Completed Production of 45x NextGen AI 4U Servers')
ON CONFLICT (id) DO NOTHING;

-- 9. Stock Ledger Entries
INSERT INTO stock_ledger_entries (id, item_id, warehouse_id, posting_date, posting_time, voucher_type, voucher_no, actual_qty, qty_after_transaction, incoming_rate, valuation_rate, stock_value, stock_value_difference, fiscal_year, remarks) VALUES
('sle-001', 'item-cpu-01', 'wh-main', '2026-02-01', '10:00:00', 'Stock Entry', 'MAT-REC-2026-001', 150.0000, 150.0000, 320.0000, 320.0000, 48000.0000, 48000.0000, '2026-2027', 'Goods Receipt for Processors'),
('sle-002', 'item-ram-02', 'wh-main', '2026-02-02', '11:15:00', 'Stock Entry', 'MAT-REC-2026-002', 300.0000, 300.0000, 140.0000, 140.0000, 42000.0000, 42000.0000, '2026-2027', 'Inbound DDR5 RAM Batches'),
('sle-003', 'item-serv-04', 'wh-fg', '2026-02-15', '18:00:00', 'Stock Entry', 'MFG-ENTRY-2026-003', 45.0000, 45.0000, 2850.0000, 2850.0000, 128250.0000, 128250.0000, '2026-2027', 'Finished Goods Inward from Assembly')
ON CONFLICT (id) DO NOTHING;
