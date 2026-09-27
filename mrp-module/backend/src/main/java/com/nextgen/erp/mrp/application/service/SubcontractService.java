package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.SubcontractOrder;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.SubcontractOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubcontractService {

    private final SubcontractOrderRepository subcontractRepository;
    private final MockItemRepository mockItemRepository;

    @Transactional(readOnly = true)
    public List<SubcontractOrder> getAllSubcontractOrders() {
        return subcontractRepository.findAll();
    }

    @Transactional
    public SubcontractOrder createSubcontractOrder(SubcontractOrder order) {
        if (order.getSubcontractId() == null || order.getSubcontractId().isBlank()) {
            order.setSubcontractId("SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (order.getItemCode() != null && !order.getItemCode().isBlank()) {
            if (!mockItemRepository.existsById(order.getItemCode())) {
                throw new IllegalArgumentException("Item master not found: " + order.getItemCode());
            }
        }

        order.setStatus("SUBMITTED");
        return subcontractRepository.save(order);
    }

    @Transactional
    public SubcontractOrder updateStatus(String subcontractId, String status) {
        SubcontractOrder order = subcontractRepository.findById(subcontractId)
                .orElseThrow(() -> new IllegalArgumentException("Subcontract Order not found with ID: " + subcontractId));
        order.setStatus(status);
        return subcontractRepository.save(order);
    }

    @Transactional
    public SubcontractOrder dispatchMaterials(String subcontractId) {
        SubcontractOrder order = subcontractRepository.findById(subcontractId)
                .orElseThrow(() -> new IllegalArgumentException("Subcontract Order not found with ID: " + subcontractId));
        order.setStatus("MATERIALS_DISPATCHED");
        order.setMaterialsDispatched(true);
        order.setDispatchDate(java.time.ZonedDateTime.now());
        return subcontractRepository.save(order);
    }

    @Transactional
    public SubcontractOrder receiveGoods(String subcontractId) {
        SubcontractOrder order = subcontractRepository.findById(subcontractId)
                .orElseThrow(() -> new IllegalArgumentException("Subcontract Order not found with ID: " + subcontractId));
        order.setStatus("COMPLETED");
        return subcontractRepository.save(order);
    }
}
