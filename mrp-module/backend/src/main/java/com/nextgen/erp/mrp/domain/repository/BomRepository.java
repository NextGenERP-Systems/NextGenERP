package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;

@Repository
public interface BomRepository extends JpaRepository<Bom, String> {

    Optional<Bom> findByItemCodeAndIsDefaultTrue(String itemCode);

    List<Bom> findByItemCode(String itemCode);

    boolean existsByItemCodeAndRevisionNumber(String itemCode, Integer revisionNumber);

    /**
     * Executes the PostgreSQL Recursive CTE View to return the fully exploded multi-level BoM tree.
     */
    @Query(value = "SELECT root_bom_no, item_code, item_name, total_exploded_qty, uom, standard_rate, total_exploded_amount, level_depth, path " +
                   "FROM view_mrp_bom_explosion WHERE root_bom_no = :bomNo ORDER BY level_depth ASC", nativeQuery = true)
    List<Map<String, Object>> explodeBomWithCte(@Param("bomNo") String bomNo);

    @Query(value = "SELECT root_bom_no, item_code, item_name, total_exploded_qty, uom, standard_rate, total_exploded_amount, level_depth, path " +
            "FROM explode_mrp_bom(:bomNo, :planningDate) ORDER BY level_depth ASC", nativeQuery = true)
    List<Map<String, Object>> explodeBomWithCte(@Param("bomNo") String bomNo, @Param("planningDate") LocalDate planningDate);
}
