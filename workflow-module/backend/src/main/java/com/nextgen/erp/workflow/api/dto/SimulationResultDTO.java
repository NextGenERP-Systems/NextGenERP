package com.nextgen.erp.workflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResultDTO {
    private boolean success;
    private String message;
    private List<SimulationStep> steps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimulationStep {
        private String fromStateName;
        private String actionName;
        private String toStateName;
        private String allowedRole;
        private String conditionEvaluated;
    }
}
