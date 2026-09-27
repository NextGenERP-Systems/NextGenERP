-- Add an MRP-local audit trail for material movements.
-- This migration does not integrate with any external inventory module.
CREATE TABLE IF NOT EXISTS mrp_inventory_movement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    warehouse_id VARCHAR(100) REFERENCES mrp_mock_warehouse(warehouse_id),
    quantity DECIMAL(15, 4) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    work_order_id VARCHAR(100) REFERENCES mrp_work_order(work_order_id),
    source_reference VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_inventory_movement_quantity_positive') THEN
        ALTER TABLE mrp_inventory_movement ADD CONSTRAINT ck_mrp_inventory_movement_quantity_positive
            CHECK (quantity > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_inventory_movement_type') THEN
        ALTER TABLE mrp_inventory_movement ADD CONSTRAINT ck_mrp_inventory_movement_type
            CHECK (movement_type IN ('CONSUMPTION', 'REVERSAL', 'SCRAP', 'RECEIPT', 'TRANSFER'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mrp_inventory_movement_work_order
    ON mrp_inventory_movement (work_order_id, created_at);
