ALTER TABLE mrp_inventory_movement DROP CONSTRAINT IF EXISTS ck_mrp_inventory_movement_type;

ALTER TABLE mrp_inventory_movement ADD CONSTRAINT ck_mrp_inventory_movement_type
    CHECK (movement_type IN ('RESERVATION', 'ISSUE_TO_WIP', 'CONSUMPTION', 'REVERSAL', 'SCRAP', 'RECEIPT', 'FINISHED_GOODS', 'TRANSFER'));
