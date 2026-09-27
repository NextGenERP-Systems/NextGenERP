package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.Operation;
import com.nextgen.erp.mrp.domain.entity.Routing;
import com.nextgen.erp.mrp.domain.repository.OperationRepository;
import com.nextgen.erp.mrp.domain.repository.RoutingRepository;
import com.nextgen.erp.mrp.domain.repository.WorkstationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoutingService {

    private final OperationRepository operationRepository;
    private final RoutingRepository routingRepository;
    private final WorkstationRepository workstationRepository;

    private void requireWorkstation(String wsId) {
        if (wsId == null || wsId.isBlank() || !workstationRepository.existsById(wsId)) {
            throw new IllegalArgumentException("Unknown workstation: " + wsId);
        }
    }

    @Transactional(readOnly = true)
    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    @Transactional
    public Operation createOperation(Operation op) {
        if (op.getOperationId() == null || op.getOperationId().isBlank()) {
            op.setOperationId("OP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        requireWorkstation(op.getDefaultWorkstationId());
        return operationRepository.saveAndFlush(op);
    }

    @Transactional(readOnly = true)
    public List<Routing> getAllRoutings() {
        return routingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Routing getRoutingById(String routingId) {
        return routingRepository.findById(routingId)
                .orElseThrow(() -> new IllegalArgumentException("Routing not found with ID: " + routingId));
    }

    @Transactional
    public Routing createRouting(Routing routing) {
        if (routing.getRoutingId() == null || routing.getRoutingId().isBlank()) {
            routing.setRoutingId("RT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        if (routing.getOperations() != null) {
            routing.getOperations().forEach(op -> {
                op.setRouting(routing);
                requireWorkstation(op.getWorkstationId());

                if (op.getOperationId() != null && !operationRepository.existsById(op.getOperationId())) {
                    throw new IllegalArgumentException("Unknown operation: " + op.getOperationId());
                }
            });
        }
        return routingRepository.save(routing);
    }
}
