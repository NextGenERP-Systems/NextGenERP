ALTER TABLE mrp_run ADD COLUMN IF NOT EXISTS planning_date DATE;
UPDATE mrp_run SET planning_date = created_at::date WHERE planning_date IS NULL;
ALTER TABLE mrp_run ALTER COLUMN planning_date SET NOT NULL;

CREATE OR REPLACE FUNCTION explode_mrp_bom(p_bom_no VARCHAR, p_planning_date DATE)
RETURNS TABLE (
    root_bom_no VARCHAR,
    item_code VARCHAR,
    item_name VARCHAR,
    total_exploded_qty NUMERIC,
    uom VARCHAR,
    standard_rate NUMERIC,
    total_exploded_amount NUMERIC,
    level_depth INTEGER,
    path TEXT[]
) LANGUAGE sql AS $$
WITH RECURSIVE bom_tree AS (
    SELECT bi.bom_no AS root_bom_no, bi.item_code, bi.item_name,
        (bi.qty / NULLIF(parent_bom.quantity, 0))::NUMERIC(15,4) AS required_qty,
        bi.uom, bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        (bi.qty / NULLIF(parent_bom.quantity, 0) * bi.standard_rate)::NUMERIC(15,4) AS amount,
        bi.sub_bom_no, 1 AS level_depth, ARRAY[bi.item_code::text] AS path
    FROM mrp_bom_item bi
    JOIN mrp_bom parent_bom ON parent_bom.bom_no = bi.bom_no
        AND parent_bom.bom_no = p_bom_no
        AND parent_bom.is_active = TRUE AND parent_bom.status = 'ACTIVE'
        AND (parent_bom.effective_from IS NULL OR parent_bom.effective_from <= p_planning_date)
        AND (parent_bom.effective_to IS NULL OR parent_bom.effective_to >= p_planning_date)
    UNION ALL
    SELECT bt.root_bom_no, child_bi.item_code, child_bi.item_name,
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0))::NUMERIC(15,4),
        child_bi.uom, child_bi.standard_rate::NUMERIC(15,4),
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0) * child_bi.standard_rate)::NUMERIC(15,4),
        child_bi.sub_bom_no, bt.level_depth + 1, bt.path || child_bi.item_code::text
    FROM bom_tree bt
    JOIN mrp_bom_item child_bi ON bt.sub_bom_no = child_bi.bom_no
    JOIN mrp_bom child_bom ON child_bom.bom_no = child_bi.bom_no
        AND child_bom.is_active = TRUE AND child_bom.status = 'ACTIVE'
        AND (child_bom.effective_from IS NULL OR child_bom.effective_from <= p_planning_date)
        AND (child_bom.effective_to IS NULL OR child_bom.effective_to >= p_planning_date)
)
SELECT root_bom_no, item_code, item_name, SUM(required_qty)::NUMERIC(15,4),
    uom, standard_rate, SUM(amount)::NUMERIC(15,4), level_depth, path
FROM bom_tree
GROUP BY root_bom_no, item_code, item_name, uom, standard_rate, level_depth, path;
$$;
