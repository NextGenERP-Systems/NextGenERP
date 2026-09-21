package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.MrpRun;
import com.nextgen.erp.mrp.domain.entity.MrpRunRequirement;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.MockStockLedgerRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class MrpWizardService {

    private final BomRepository bomRepository;
    private final MockStockLedgerRepository mockStockLedgerRepository;
    private final MrpRunRepository mrpRunRepository;
    private final MrpRunRequirementRepository mrpRunRequirementRepository;

    @Transactional
    public Map<String, Object> calculateMaterialRequirements(String bomNo, BigDecimal plannedQty) {
        return calculateMaterialRequirements(bomNo, plannedQty, LocalDate.now());
    }

    @Transactional
    public Map<String, Object> calculateMaterialRequirements(String bomNo, BigDecimal plannedQty, LocalDate planningDate) {
        ZonedDateTime calculationCutoffAt = ZonedDateTime.now();
        if (bomNo == null || bomNo.isBlank()) {
            throw new IllegalArgumentException("BOM number is required");
        }
        if (plannedQty == null || plannedQty.signum() <= 0) {
            throw new IllegalArgumentException("MRP planned quantity must be greater than zero");
        }
        if (planningDate == null) {
            throw new IllegalArgumentException("MRP planning date is required");
        }
        if (!bomRepository.existsById(bomNo)) {
            throw new IllegalArgumentException("BOM not found: " + bomNo);
        }
        List<Map<String, Object>> explodedItems = bomRepository.explodeBomWithCte(bomNo, planningDate);
        Map<String, Map<String, Object>> aggregatedItems = new LinkedHashMap<>();
        for (Map<String, Object> row : explodedItems) {
            String itemCode = (String) row.get("item_code");
            BigDecimal rowQty = new BigDecimal(row.get("total_exploded_qty").toString());
            Map<String, Object> aggregate = aggregatedItems.get(itemCode);
            if (aggregate == null) {
                aggregate = new HashMap<>(row);
                aggregate.put("total_exploded_qty", rowQty);
                aggregatedItems.put(itemCode, aggregate);
            } else {
                BigDecimal currentQty = new BigDecimal(aggregate.get("total_exploded_qty").toString());
                aggregate.put("total_exploded_qty", currentQty.add(rowQty));
                if (aggregate.get("total_exploded_amount") != null && row.get("total_exploded_amount") != null) {
                    BigDecimal currentAmount = new BigDecimal(aggregate.get("total_exploded_amount").toString());
                    aggregate.put("total_exploded_amount", currentAmount
                            .add(new BigDecimal(row.get("total_exploded_amount").toString())));
                }
            }
        }

        List<Map<String, Object>> shortages = new ArrayList<>();
        for (Map<String, Object> row : aggregatedItems.values()) {
            String itemCode = (String) row.get("item_code");
            BigDecimal qtyPerUnit = new BigDecimal(row.get("total_exploded_qty").toString());
            BigDecimal requiredTotal = qtyPerUnit.multiply(plannedQty);
            
            BigDecimal actualInStock = mockStockLedgerRepository.findTotalStockByItemCode(itemCode);
            if (actualInStock == null) {
                actualInStock = BigDecimal.ZERO;
            }
            
            BigDecimal shortage = requiredTotal.subtract(actualInStock);

            Map<String, Object> itemRequirement = new HashMap<>(row);
            itemRequirement.put("required_total_qty", requiredTotal);
            itemRequirement.put("actual_in_stock", actualInStock);
            itemRequirement.put("mock_in_stock", actualInStock); // backward compatibility
            itemRequirement.put("shortage_qty", shortage.compareTo(BigDecimal.ZERO) > 0 ? shortage : BigDecimal.ZERO);
            String action = "STOCK_AVAILABLE";
            if (shortage.compareTo(BigDecimal.ZERO) > 0) {
                boolean manufacturedSubassembly = bomRepository
                        .findByItemCodeAndIsDefaultTrue(itemCode)
                        .isPresent();
                action = manufacturedSubassembly
                        ? "SPAWN_WORK_ORDER"
                        : "PURCHASE_ORDER";
            }
            itemRequirement.put("action_recommended", action);

            shortages.add(itemRequirement);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bomNo", bomNo);
        response.put("plannedQty", plannedQty);
        response.put("planningDate", planningDate);
        response.put("totalExplodedItems", aggregatedItems.size());
        response.put("requirements", shortages);

        MrpRun run = new MrpRun();
        run.setBomNo(bomNo);
        run.setPlannedQty(plannedQty);
        run.setPlanningDate(planningDate);
        run.setCalculationCutoffAt(calculationCutoffAt);
        MrpRun savedRun = mrpRunRepository.save(run);
        for (Map<String, Object> requirement : shortages) {
            MrpRunRequirement snapshot = new MrpRunRequirement();
            snapshot.setRunId(savedRun.getRunId());
            snapshot.setItemCode((String) requirement.get("item_code"));
            snapshot.setRequiredQty((BigDecimal) requirement.get("required_total_qty"));
            snapshot.setStockQty((BigDecimal) requirement.get("actual_in_stock"));
            snapshot.setShortageQty((BigDecimal) requirement.get("shortage_qty"));
            snapshot.setRecommendedAction((String) requirement.get("action_recommended"));
            mrpRunRequirementRepository.save(snapshot);
        }
        response.put("runId", savedRun.getRunId());
        return response;
    }
}
