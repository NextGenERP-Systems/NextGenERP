package com.nextgen.erp.mrp.application.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeardownSandboxService {

    private final EntityManager entityManager;

    @Transactional
    public String executeSandboxTeardown() {
        entityManager.createNativeQuery(
                "TRUNCATE TABLE mrp_state_transition_audit, mrp_inventory_movement, mrp_job_card_time_log, mrp_job_card, mrp_work_order_operation, mrp_work_order_item, mrp_work_order, mrp_scrap_item, mrp_quality_inspection_reading, mrp_quality_inspection, mrp_production_plan_item, mrp_production_plan, mrp_downtime_entry, mrp_mock_stock_ledger CASCADE"
        ).executeUpdate();

        return "MRP Sandbox tables truncated successfully!";
    }
}
