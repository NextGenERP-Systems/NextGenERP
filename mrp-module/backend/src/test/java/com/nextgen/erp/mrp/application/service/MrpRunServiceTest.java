package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.MrpRun;
import com.nextgen.erp.mrp.domain.repository.MrpRunRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrpRunServiceTest {

    @Mock MrpRunRepository mrpRunRepository;
    @Mock MrpRunRequirementRepository requirementRepository;
    @Mock ProductionPlanRepository productionPlanRepository;
    @Mock BomRepository bomRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;

    @InjectMocks MrpRunService service;

    @Test
    void reviewsOnlyCalculatedRuns() {
        UUID runId = UUID.randomUUID();
        MrpRun run = run(runId, "CALCULATED");
        when(mrpRunRepository.findByRunIdForUpdate(runId)).thenReturn(Optional.of(run));
        when(mrpRunRepository.save(any(MrpRun.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(requirementRepository.findByRunId(runId)).thenReturn(java.util.List.of());

        var result = service.reviewRun(runId);

        assertEquals("REVIEWED", result.get("status"));
    }

    @Test
    void repeatedReviewReturnsTheReviewedRun() {
        UUID runId = UUID.randomUUID();
        when(mrpRunRepository.findByRunIdForUpdate(runId)).thenReturn(Optional.of(run(runId, "REVIEWED")));
        when(requirementRepository.findByRunId(runId)).thenReturn(java.util.List.of());

        var result = service.reviewRun(runId);

        assertEquals("REVIEWED", result.get("status"));
        org.mockito.Mockito.verify(mrpRunRepository, org.mockito.Mockito.never())
                .save(any(MrpRun.class));
    }

    @Test
    void releasesReviewedRunsAndIsIdempotent() {
        UUID runId = UUID.randomUUID();
        MrpRun run = run(runId, "REVIEWED");
        when(mrpRunRepository.findByRunIdForUpdate(runId)).thenReturn(Optional.of(run));
        when(mrpRunRepository.save(any(MrpRun.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(requirementRepository.findByRunId(runId)).thenReturn(java.util.List.of());

        var result = service.releaseRun(runId);

        assertEquals("RELEASED", result.get("status"));
        assertEquals("RELEASED", run.getStatus());
        var repeated = service.releaseRun(runId);
        assertEquals("RELEASED", repeated.get("status"));
        org.mockito.Mockito.verify(mrpRunRepository, org.mockito.Mockito.times(1)).save(any(MrpRun.class));
    }

    private MrpRun run(UUID id, String status) {
        MrpRun run = new MrpRun();
        run.setRunId(id);
        run.setBomNo("BOM-1");
        run.setPlannedQty(BigDecimal.ONE);
        run.setStatus(status);
        return run;
    }
}
