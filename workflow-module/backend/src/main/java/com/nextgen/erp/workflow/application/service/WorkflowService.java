package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.Workflow;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import com.nextgen.erp.workflow.domain.repository.WorkflowRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowTransitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStateRepository stateRepository;
    private final WorkflowTransitionRepository transitionRepository;

    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Optional<Workflow> getWorkflowById(UUID id) {
        return workflowRepository.findById(id);
    }

    public Workflow createWorkflow(Workflow workflow) {
        return workflowRepository.save(workflow);
    }

    public List<WorkflowState> getStatesByWorkflowId(UUID workflowId) {
        return stateRepository.findByWorkflowId(workflowId);
    }

    public WorkflowState createState(UUID workflowId, WorkflowState state) {
        state.setWorkflowId(workflowId);
        return stateRepository.save(state);
    }

    public List<WorkflowTransition> getTransitionsByWorkflowId(UUID workflowId) {
        return transitionRepository.findByWorkflowId(workflowId);
    }

    public WorkflowTransition createTransition(UUID workflowId, WorkflowTransition transition) {
        transition.setWorkflowId(workflowId);
        return transitionRepository.save(transition);
    }

    public Workflow updateWorkflowStatus(UUID id, boolean isActive) {
        return workflowRepository.findById(id).map(w -> {
            w.setIsActive(isActive);
            return workflowRepository.save(w);
        }).orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    public void deleteState(UUID stateId) {
        stateRepository.deleteById(stateId);
    }

    public WorkflowState updateState(UUID stateId, WorkflowState stateDetails) {
        return stateRepository.findById(stateId).map(state -> {
            state.setStateName(stateDetails.getStateName());
            state.setColorCode(stateDetails.getColorCode());
            state.setIsInitialState(stateDetails.getIsInitialState());
            state.setIsFinalState(stateDetails.getIsFinalState());
            state.setUpdateFields(stateDetails.getUpdateFields());
            state.setAllowEditRole(stateDetails.getAllowEditRole());
            state.setIsOptionalState(stateDetails.getIsOptionalState());
            state.setSendEmail(stateDetails.getSendEmail());
            return stateRepository.save(state);
        }).orElseThrow(() -> new RuntimeException("State not found"));
    }

    public void deleteTransition(UUID transitionId) {
        transitionRepository.deleteById(transitionId);
    }

    public WorkflowTransition updateTransition(UUID transitionId, WorkflowTransition transitionDetails) {
        return transitionRepository.findById(transitionId).map(transition -> {
            transition.setFromStateId(transitionDetails.getFromStateId());
            transition.setToStateId(transitionDetails.getToStateId());
            transition.setActionName(transitionDetails.getActionName());
            transition.setAllowedRole(transitionDetails.getAllowedRole());
            transition.setConditionExpression(transitionDetails.getConditionExpression());
            transition.setAllowSelfApproval(transitionDetails.getAllowSelfApproval());
            transition.setSendEmailToCreator(transitionDetails.getSendEmailToCreator());
            return transitionRepository.save(transition);
        }).orElseThrow(() -> new RuntimeException("Transition not found"));
    }
}
