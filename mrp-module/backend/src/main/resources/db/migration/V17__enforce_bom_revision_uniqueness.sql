CREATE UNIQUE INDEX IF NOT EXISTS uq_mrp_bom_item_revision
    ON mrp_bom(item_code, revision_number);
