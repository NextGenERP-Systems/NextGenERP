package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.api.dto.SimulationResultDTO;
import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowTransitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowSimulationService {

    private final WorkflowStateRepository stateRepository;
    private final WorkflowTransitionRepository transitionRepository;

    public SimulationResultDTO simulateWorkflow(UUID workflowId, Double amount, String title, String documentType) {
        List<WorkflowState> states = stateRepository.findByWorkflowId(workflowId);
        List<WorkflowTransition> transitions = transitionRepository.findByWorkflowId(workflowId);

        WorkflowState initialState = states.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsInitialState()))
                .findFirst()
                .orElse(null);

        if (initialState == null) {
            return SimulationResultDTO.builder()
                    .success(false)
                    .message("No initial state defined for this workflow.")
                    .steps(Collections.emptyList())
                    .build();
        }

        Document dummyDoc = Document.builder()
                .amount(amount != null ? amount : 1000.0)
                .title(title != null ? title : "Simulation Document")
                .documentType(documentType != null ? documentType : "Contract")
                .ownerUsername("simulation_user")
                .build();

        List<SimulationResultDTO.SimulationStep> steps = new ArrayList<>();
        WorkflowState currentState = initialState;
        Set<UUID> visitedStates = new HashSet<>();
        ExpressionParser parser = new SpelExpressionParser();

        while (currentState != null && !visitedStates.contains(currentState.getId())) {
            visitedStates.add(currentState.getId());

            if (Boolean.TRUE.equals(currentState.getIsFinalState())) {
                break;
            }

            final UUID currId = currentState.getId();
            List<WorkflowTransition> outgoing = transitions.stream()
                    .filter(t -> currId.equals(t.getFromStateId()))
                    .toList();

            if (outgoing.isEmpty()) {
                break;
            }

            WorkflowTransition selectedTransition = null;
            String evaluatedCond = "No condition (passed)";

            for (WorkflowTransition t : outgoing) {
                if (t.getConditionExpression() != null && !t.getConditionExpression().trim().isEmpty()) {
                    try {
                        SimpleEvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();
                        context.setVariable("doc", dummyDoc);
                        context.setVariable("amount", dummyDoc.getAmount());
                        context.setVariable("title", dummyDoc.getTitle());

                        String exprStr = t.getConditionExpression().trim();
                        if (exprStr.startsWith("doc.")) {
                            exprStr = "#" + exprStr;
                        }

                        Boolean res = parser.parseExpression(exprStr).getValue(context, Boolean.class);
                        if (Boolean.TRUE.equals(res)) {
                            selectedTransition = t;
                            evaluatedCond = "SpEL condition met: " + t.getConditionExpression();
                            break;
                        }
                    } catch (Exception e) {
                        evaluatedCond = "SpEL condition error: " + e.getMessage();
                    }
                } else {
                    selectedTransition = t;
                    break;
                }
            }

            if (selectedTransition == null) {
                break;
            }

            final UUID targetId = selectedTransition.getToStateId();
            WorkflowState nextState = states.stream()
                    .filter(s -> targetId.equals(s.getId()))
                    .findFirst()
                    .orElse(null);

            steps.add(SimulationResultDTO.SimulationStep.builder()
                    .fromStateName(currentState.getStateName())
                    .actionName(selectedTransition.getActionName())
                    .toStateName(nextState != null ? nextState.getStateName() : "Unknown")
                    .allowedRole(selectedTransition.getAllowedRole())
                    .conditionEvaluated(evaluatedCond)
                    .build());

            currentState = nextState;
        }

        return SimulationResultDTO.builder()
                .success(true)
                .message("Simulation completed successfully with " + steps.size() + " step(s).")
                .steps(steps)
                .build();
    }
}
