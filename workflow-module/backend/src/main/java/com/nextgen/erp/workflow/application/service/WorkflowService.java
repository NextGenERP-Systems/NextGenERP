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
}
