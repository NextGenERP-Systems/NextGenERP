-- Prevent duplicate application of the same MRP material-consumption request.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mrp_inventory_movement_source_reference
    ON mrp_inventory_movement (source_reference);
