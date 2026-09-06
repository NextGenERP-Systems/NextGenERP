package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.repository.BomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MrpWizardService {

    private final BomRepository bomRepository;

    public Map<String, Object> calculateMaterialRequirements(String bomNo, BigDecimal plannedQty) {
        List<Map<String, Object>> explodedItems = bomRepository.explodeBomWithCte(bomNo);

        List<Map<String, Object>> shortages = new ArrayList<>();
        for (Map<String, Object> row : explodedItems) {
            BigDecimal qtyPerUnit = new BigDecimal(row.get("total_exploded_qty").toString());
            BigDecimal requiredTotal = qtyPerUnit.multiply(plannedQty);
            BigDecimal mockInStock = new BigDecimal("10.0000"); // Mock current inventory stock
            BigDecimal shortage = requiredTotal.subtract(mockInStock);

            Map<String, Object> itemRequirement = new HashMap<>(row);
            itemRequirement.put("required_total_qty", requiredTotal);
            itemRequirement.put("mock_in_stock", mockInStock);
            itemRequirement.put("shortage_qty", shortage.compareTo(BigDecimal.ZERO) > 0 ? shortage : BigDecimal.ZERO);
            itemRequirement.put("action_recommended", shortage.compareTo(BigDecimal.ZERO) > 0 ? "SPAWN_WORK_ORDER_OR_PURCHASE" : "STOCK_AVAILABLE");

            shortages.add(itemRequirement);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bomNo", bomNo);
        response.put("plannedQty", plannedQty);
        response.put("totalExplodedItems", explodedItems.size());
        response.put("requirements", shortages);
        return response;
    }
}
