-- =============================================================================
-- NextGen ERP - Production & Manufacturing (MRP) Module Seed Dataset
-- Includes Multi-level BOM (Electric Vehicle Drone), Workstations, Operations, WOs
-- =============================================================================

-- 1. MOCK ITEMS
INSERT INTO mrp_mock_item (item_code, item_name, item_group, uom, standard_rate) VALUES
('EV-DRONE-X1', 'Enterprise Industrial EV Cargo Drone X1', 'Finished Goods', 'Nos', 4500.0000),
('DRONE-FRAME-SUB', 'Carbon Fiber Chassis & Arm Sub-Assembly', 'Sub Assembly', 'Nos', 1200.0000),
('DRONE-PROP-SUB', 'Brushless Motor & Rotor Sub-Assembly', 'Sub Assembly', 'Nos', 650.0000),
('RAW-CF-SHEET', 'Raw Carbon Fiber Sheet 5mm', 'Raw Material', 'SqM', 150.0000),
('RAW-TITANIUM-BOLT', 'M4 Titanium Hex Bolts', 'Raw Material', 'Box', 25.0000),
('RAW-BLDC-MOTOR', 'BLDC High Torque 750W Motor', 'Raw Material', 'Nos', 180.0000),
('RAW-ESC-60A', '60A Electronic Speed Controller (ESC)', 'Raw Material', 'Nos', 75.0000),
('RAW-BATTERY-PACK', 'LiFePO4 48V 20Ah Smart Battery Pack', 'Raw Material', 'Nos', 850.0000),
('RAW-FLIGHT-CTRL', 'AI Flight Controller Board v4', 'Raw Material', 'Nos', 320.0000)
ON CONFLICT (item_code) DO NOTHING;

-- 2. MOCK WAREHOUSES
INSERT INTO mrp_mock_warehouse (warehouse_id, warehouse_name, warehouse_type) VALUES
('WH-STORES', 'Main Raw Material Stores', 'Stores'),
('WH-WIP', 'Shop Floor Work-In-Progress', 'WIP'),
('WH-FG', 'Finished Goods Warehouse', 'FG'),
('WH-SCRAP', 'Scrap & Material Recovery Center', 'Scrap')
ON CONFLICT (warehouse_id) DO NOTHING;

-- 3. MOCK EMPLOYEES
INSERT INTO mrp_mock_employee (employee_id, employee_name, designation, hourly_rate) VALUES
('EMP-101', 'Alexander Wright', 'Senior CNC Machinist', 35.0000),
('EMP-102', 'Elena Rostova', 'Avionics Technician', 40.0000),
('EMP-103', 'Marcus Vance', 'Quality Assurance Lead', 32.0000)
ON CONFLICT (employee_id) DO NOTHING;

-- 4. WORKSTATIONS & OPERATIONS
INSERT INTO mrp_workstation (workstation_id, workstation_name, hourly_cost, electricity_cost_per_hour, working_hours_per_day) VALUES
('WS-CNC-01', '5-Axis Precision CNC Machining Center', 65.0000, 15.0000, 16.00),
('WS-ASM-01', 'Avionics & Harness Assembly Station', 45.0000, 5.0000, 8.00),
('WS-TEST-01', 'Automated Flight & Quality Test Bench', 55.0000, 10.0000, 8.00)
ON CONFLICT (workstation_id) DO NOTHING;

INSERT INTO mrp_operation (operation_id, operation_name, default_workstation_id, description) VALUES
('OP-CNC-CUT', 'Carbon Fiber Precision CNC Cutting', 'WS-CNC-01', 'Precision milling of carbon fiber arms and central chassis plates'),
('OP-MOTOR-ASM', 'Motor & ESC Harness Soldering', 'WS-ASM-01', 'Soldering 60A ESC to BLDC motor and mounting vibration dampeners'),
('OP-FINAL-ASM', 'Chassis & Flight Controller Assembly', 'WS-ASM-01', 'Final structural integration of chassis, battery, and AI flight controller'),
('OP-QC-CALIB', 'Avionics & Sensor Calibration Test', 'WS-TEST-01', 'Full power loop, motor thrust balance, and GPS sensor calibration')
ON CONFLICT (operation_id) DO NOTHING;

-- 5. ROUTING
INSERT INTO mrp_routing (routing_id, routing_name, item_code) VALUES
('RT-DRONE-X1', 'Standard 4-Step Drone Production Route', 'EV-DRONE-X1')
ON CONFLICT (routing_id) DO NOTHING;

INSERT INTO mrp_routing_operation (routing_id, sequence_no, operation_id, workstation_id, time_in_mins) VALUES
('RT-DRONE-X1', 1, 'OP-CNC-CUT', 'WS-CNC-01', 45.00),
('RT-DRONE-X1', 2, 'OP-MOTOR-ASM', 'WS-ASM-01', 30.00),
('RT-DRONE-X1', 3, 'OP-FINAL-ASM', 'WS-ASM-01', 60.00),
('RT-DRONE-X1', 4, 'OP-QC-CALIB', 'WS-TEST-01', 25.00);

-- 6. MULTI-LEVEL BILL OF MATERIALS (BOM)
-- Sub-Assembly 1: Carbon Fiber Chassis (BOM-CHASSIS-001)
INSERT INTO mrp_bom (bom_no, item_code, item_name, quantity, uom, status, is_active, is_default, raw_material_cost, operating_cost, total_cost) VALUES
('BOM-CHASSIS-001', 'DRONE-FRAME-SUB', 'Carbon Fiber Chassis & Arm Sub-Assembly', 1.0000, 'Nos', 'ACTIVE', true, true, 350.0000, 48.7500, 398.7500)
ON CONFLICT (bom_no) DO NOTHING;

INSERT INTO mrp_bom_item (bom_no, item_code, item_name, qty, uom, standard_rate, amount) VALUES
('BOM-CHASSIS-001', 'RAW-CF-SHEET', 'Raw Carbon Fiber Sheet 5mm', 2.0000, 'SqM', 150.0000, 300.0000),
('BOM-CHASSIS-001', 'RAW-TITANIUM-BOLT', 'M4 Titanium Hex Bolts', 2.0000, 'Box', 25.0000, 50.0000);

INSERT INTO mrp_bom_operation (bom_no, sequence_no, operation_id, workstation_id, time_in_mins, operating_cost) VALUES
('BOM-CHASSIS-001', 1, 'OP-CNC-CUT', 'WS-CNC-01', 45.00, 48.7500);

-- Sub-Assembly 2: Rotor Assembly (BOM-ROTOR-001)
INSERT INTO mrp_bom (bom_no, item_code, item_name, quantity, uom, status, is_active, is_default, raw_material_cost, operating_cost, total_cost) VALUES
('BOM-ROTOR-001', 'DRONE-PROP-SUB', 'Brushless Motor & Rotor Sub-Assembly', 1.0000, 'Nos', 'ACTIVE', true, true, 510.0000, 22.5000, 532.5000)
ON CONFLICT (bom_no) DO NOTHING;

INSERT INTO mrp_bom_item (bom_no, item_code, item_name, qty, uom, standard_rate, amount) VALUES
('BOM-ROTOR-001', 'RAW-BLDC-MOTOR', 'BLDC High Torque 750W Motor', 2.0000, 'Nos', 180.0000, 360.0000),
('BOM-ROTOR-001', 'RAW-ESC-60A', '60A Electronic Speed Controller (ESC)', 2.0000, 'Nos', 75.0000, 150.0000);

INSERT INTO mrp_bom_operation (bom_no, sequence_no, operation_id, workstation_id, time_in_mins, operating_cost) VALUES
('BOM-ROTOR-001', 1, 'OP-MOTOR-ASM', 'WS-ASM-01', 30.00, 22.5000);

-- Main Finished Good BOM: EV Drone Cargo X1 (BOM-EV-DRONE-001) referencing Sub-BOMs
INSERT INTO mrp_bom (bom_no, item_code, item_name, quantity, uom, status, is_active, is_default, routing_id, raw_material_cost, operating_cost, total_cost) VALUES
('BOM-EV-DRONE-001', 'EV-DRONE-X1', 'Enterprise Industrial EV Cargo Drone X1', 1.0000, 'Nos', 'ACTIVE', true, true, 'RT-DRONE-X1', 2811.2500, 67.9167, 2879.1667)
ON CONFLICT (bom_no) DO NOTHING;

INSERT INTO mrp_bom_item (bom_no, item_code, item_name, qty, uom, standard_rate, amount, sub_bom_no) VALUES
('BOM-EV-DRONE-001', 'DRONE-FRAME-SUB', 'Carbon Fiber Chassis & Arm Sub-Assembly', 1.0000, 'Nos', 398.7500, 398.7500, 'BOM-CHASSIS-001'),
('BOM-EV-DRONE-001', 'DRONE-PROP-SUB', 'Brushless Motor & Rotor Sub-Assembly', 2.0000, 'Nos', 532.5000, 1065.0000, 'BOM-ROTOR-001'),
('BOM-EV-DRONE-001', 'RAW-BATTERY-PACK', 'LiFePO4 48V 20Ah Smart Battery Pack', 1.0000, 'Nos', 850.0000, 850.0000, NULL),
('BOM-EV-DRONE-001', 'RAW-FLIGHT-CTRL', 'AI Flight Controller Board v4', 1.0000, 'Nos', 320.0000, 320.0000, NULL);

INSERT INTO mrp_bom_operation (bom_no, sequence_no, operation_id, workstation_id, time_in_mins, operating_cost) VALUES
('BOM-EV-DRONE-001', 1, 'OP-FINAL-ASM', 'WS-ASM-01', 60.00, 45.0000),
('BOM-EV-DRONE-001', 2, 'OP-QC-CALIB', 'WS-TEST-01', 25.00, 22.9167);

-- 7. WORK ORDERS & NESTED PARENT-CHILD STRUCTURE
-- Parent Work Order for Main Drone
INSERT INTO mrp_work_order (
    work_order_id, parent_wo_id, production_item, item_name, bom_no, qty_to_produce, produced_qty, 
    source_warehouse, wip_warehouse, fg_warehouse, planned_start_date, planned_end_date, status, 
    planned_material_cost, planned_operating_cost
) VALUES (
    'WO-2026-0001', NULL, 'EV-DRONE-X1', 'Enterprise Industrial EV Cargo Drone X1', 'BOM-EV-DRONE-001', 
    10.0000, 2.0000, 'WH-STORES', 'WH-WIP', 'WH-FG', 
    CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days', 'IN_PROGRESS',
    28112.5000, 679.1670
) ON CONFLICT (work_order_id) DO NOTHING;

-- Nested Child Work Order for Chassis Sub-Assembly
INSERT INTO mrp_work_order (
    work_order_id, parent_wo_id, production_item, item_name, bom_no, qty_to_produce, produced_qty, 
    source_warehouse, wip_warehouse, fg_warehouse, planned_start_date, planned_end_date, status, 
    planned_material_cost, planned_operating_cost
) VALUES (
    'WO-2026-0002', 'WO-2026-0001', 'DRONE-FRAME-SUB', 'Carbon Fiber Chassis & Arm Sub-Assembly', 'BOM-CHASSIS-001', 
    10.0000, 10.0000, 'WH-STORES', 'WH-WIP', 'WH-WIP', 
    CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 day', 'COMPLETED',
    3500.0000, 487.5000
) ON CONFLICT (work_order_id) DO NOTHING;

-- Work Order Items for Parent WO
INSERT INTO mrp_work_order_item (work_order_id, item_code, item_name, required_qty, transferred_qty, actual_consumed_qty, uom, standard_rate) VALUES
('WO-2026-0001', 'DRONE-FRAME-SUB', 'Carbon Fiber Chassis & Arm Sub-Assembly', 10.0000, 10.0000, 10.0000, 'Nos', 398.7500),
('WO-2026-0001', 'DRONE-PROP-SUB', 'Brushless Motor & Rotor Sub-Assembly', 20.0000, 20.0000, 18.0000, 'Nos', 532.5000),
('WO-2026-0001', 'RAW-BATTERY-PACK', 'LiFePO4 48V 20Ah Smart Battery Pack', 10.0000, 10.0000, 10.0000, 'Nos', 850.0000),
('WO-2026-0001', 'RAW-FLIGHT-CTRL', 'AI Flight Controller Board v4', 10.0000, 10.0000, 11.0000, 'Nos', 320.0000); -- Over-consumed 1 unit due to shop floor defect

-- 8. JOB CARDS FOR SHOP FLOOR EXECUTIONS
INSERT INTO mrp_job_card (
    job_card_id, work_order_id, operation_id, workstation_id, for_quantity, completed_quantity, 
    status, assigned_employee_id, total_time_in_mins
) VALUES
('JC-2026-001', 'WO-2026-0001', 'OP-FINAL-ASM', 'WS-ASM-01', 10.0000, 2.0000, 'WORK_IN_PROGRESS', 'EMP-102', 120.00),
('JC-2026-002', 'WO-2026-0001', 'OP-QC-CALIB', 'WS-TEST-01', 10.0000, 0.0000, 'OPEN', 'EMP-103', 0.00)
ON CONFLICT (job_card_id) DO NOTHING;

INSERT INTO mrp_job_card_time_log (job_card_id, employee_id, start_time, end_time, time_in_mins, completed_qty) VALUES
('JC-2026-001', 'EMP-102', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP, 120.00, 2.00);

-- 9. QUALITY TEMPLATE & INSPECTION
INSERT INTO mrp_quality_template (template_id, template_name, item_code) VALUES
('QT-EV-DRONE', 'EV Cargo Drone Flight Quality Inspection Template', 'EV-DRONE-X1')
ON CONFLICT (template_id) DO NOTHING;

INSERT INTO mrp_quality_template_parameter (template_id, parameter_name, min_value, max_value, acceptance_criteria) VALUES
('QT-EV-DRONE', 'Hover Stability Drift (cm)', 0.00, 5.00, 'Max 5cm drift in wind tunnel'),
('QT-EV-DRONE', 'Battery Voltage Full Load (V)', 47.50, 52.00, 'Stable output under peak throttle');

INSERT INTO mrp_quality_inspection (inspection_id, work_order_id, inspection_type, inspected_by, inspected_qty, status, remarks) VALUES
('QI-2026-001', 'WO-2026-0001', 'In-Process', 'Marcus Vance (EMP-103)', 2.0000, 'PASSED', 'Units 1 and 2 passed wind tunnel hover test cleanly.');

-- 10. DOWNTIME ENTRY
INSERT INTO mrp_downtime_entry (downtime_id, workstation_id, operator_employee_id, category, start_time, end_time, downtime_in_mins, remarks) VALUES
('DT-2026-001', 'WS-CNC-01', 'EMP-101', 'TOOLING', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '22 hours', 120.00, 'Replaced worn tungsten carbide end-mill bit');

