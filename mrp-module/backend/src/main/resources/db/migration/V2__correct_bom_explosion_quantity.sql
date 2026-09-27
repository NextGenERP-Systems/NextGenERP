-- Correct BOM explosion quantities by normalizing each component against the
-- output quantity of the BOM that owns it. Apply only after the live schema has
-- been inspected and the reviewed baseline is established.

CREATE OR REPLACE VIEW view_mrp_bom_explosion AS
WITH RECURSIVE bom_tree AS (
    SELECT
        bi.bom_no AS root_bom_no,
        bi.item_code,
        bi.item_name,
        (bi.qty / NULLIF(parent_bom.quantity, 0))::NUMERIC(15,4) AS required_qty,
        bi.uom,
        bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        (bi.qty / NULLIF(parent_bom.quantity, 0) * bi.standard_rate)::NUMERIC(15,4) AS amount,
        bi.sub_bom_no,
        1 AS level_depth,
        ARRAY[bi.item_code::text] AS path
    FROM mrp_bom_item bi
    JOIN mrp_bom parent_bom ON parent_bom.bom_no = bi.bom_no

    UNION ALL

    SELECT
        bt.root_bom_no,
        child_bi.item_code,
        child_bi.item_name,
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0))::NUMERIC(15,4),
        child_bi.uom,
        child_bi.standard_rate::NUMERIC(15,4),
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0) * child_bi.standard_rate)::NUMERIC(15,4),
        child_bi.sub_bom_no,
        bt.level_depth + 1,
        bt.path || child_bi.item_code::text
    FROM bom_tree bt
    JOIN mrp_bom_item child_bi ON bt.sub_bom_no = child_bi.bom_no
    JOIN mrp_bom child_bom ON child_bom.bom_no = child_bi.bom_no
)
SELECT root_bom_no, item_code, item_name,
       SUM(required_qty)::NUMERIC(15,4) AS total_exploded_qty,
       uom, standard_rate, SUM(amount)::NUMERIC(15,4) AS total_exploded_amount,
       level_depth, path
FROM bom_tree
GROUP BY root_bom_no, item_code, item_name, uom, standard_rate, level_depth, path;
