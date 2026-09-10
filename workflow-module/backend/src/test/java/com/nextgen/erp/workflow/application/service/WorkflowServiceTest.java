package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.*;
import com.nextgen.erp.workflow.domain.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WorkflowService.
 *
 * Covers:
 *   - CRUD for Workflow, WorkflowState, WorkflowTransition
 *   - Repository interaction verification
 *   - Edge cases (missing workflow, empty transitions)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("WorkflowService Unit Tests")
class WorkflowServiceTest {

    // -------------------------------------------------------------------------
    // Mocks
    // -------------------------------------------------------------------------
    @Mock private WorkflowRepository           workflowRepository;
    @Mock private WorkflowStateRepository      stateRepository;
    @Mock private WorkflowTransitionRepository transitionRepository;

    @InjectMocks
    private WorkflowService workflowService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private Workflow buildWorkflow(UUID id, String name) {
        Workflow wf = new Workflow();
        wf.setId(id);
        wf.setName(name);
        return wf;
    }

    private WorkflowState buildState(UUID id, UUID workflowId, String name, boolean initial, boolean finalSt) {
        return WorkflowState.builder()
                .id(id)
                .workflowId(workflowId)
                .stateName(name)
                .isInitialState(initial)
                .isFinalState(finalSt)
                .colorCode("#4CAF50")
                .build();
    }

    private WorkflowTransition buildTransition(UUID id, UUID workflowId, UUID from, UUID to, String action, String role) {
        return WorkflowTransition.builder()
                .id(id)
                .workflowId(workflowId)
                .fromStateId(from)
                .toStateId(to)
                .actionName(action)
                .allowedRole(role)
                .allowSelfApproval(false)
                .sendEmailToCreator(true)
                .build();
    }

    // =========================================================================
    // 1. getAllWorkflows
    // =========================================================================
    @Nested
    @DisplayName("getAllWorkflows()")
    class GetAllWorkflows {

        @Test
        @DisplayName("returns all workflows from repository")
        void returnsAllWorkflows() {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            List<Workflow> workflows = List.of(buildWorkflow(id1, "Contract Approval"),
                                               buildWorkflow(id2, "Leave Request"));

            when(workflowRepository.findAll()).thenReturn(workflows);

            List<Workflow> result = workflowService.getAllWorkflows();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(Workflow::getName)
                              .containsExactly("Contract Approval", "Leave Request");
            verify(workflowRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("returns empty list when no workflows exist")
        void returnsEmptyList_WhenNoWorkflows() {
            when(workflowRepository.findAll()).thenReturn(Collections.emptyList());

            List<Workflow> result = workflowService.getAllWorkflows();

            assertThat(result).isEmpty();
        }
    }

    // =========================================================================
    // 2. getWorkflowById
    // =========================================================================
    @Nested
    @DisplayName("getWorkflowById()")
    class GetWorkflowById {

        @Test
        @DisplayName("returns workflow when found")
        void returnsWorkflow_WhenFound() {
            UUID id = UUID.randomUUID();
            Workflow wf = buildWorkflow(id, "Contract Approval");
            when(workflowRepository.findById(id)).thenReturn(Optional.of(wf));

            Optional<Workflow> result = workflowService.getWorkflowById(id);

            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("Contract Approval");
        }

        @Test
        @DisplayName("returns empty Optional when workflow not found")
        void returnsEmpty_WhenNotFound() {
            UUID id = UUID.randomUUID();
            when(workflowRepository.findById(id)).thenReturn(Optional.empty());

            Optional<Workflow> result = workflowService.getWorkflowById(id);

            assertThat(result).isEmpty();
        }
    }

    // =========================================================================
    // 3. createWorkflow
    // =========================================================================
    @Nested
    @DisplayName("createWorkflow()")
    class CreateWorkflow {

        @Test
        @DisplayName("persists and returns the saved workflow")
        void persistsWorkflow() {
            UUID id = UUID.randomUUID();
            Workflow wf = buildWorkflow(null, "Purchase Order Approval");

            when(workflowRepository.save(wf)).thenAnswer(inv -> {
                Workflow saved = inv.getArgument(0);
                saved.setId(id);
                return saved;
            });

            Workflow result = workflowService.createWorkflow(wf);

            assertThat(result.getId()).isEqualTo(id);
            assertThat(result.getName()).isEqualTo("Purchase Order Approval");
            verify(workflowRepository, times(1)).save(wf);
        }
    }

    // =========================================================================
    // 4. getStatesByWorkflowId
    // =========================================================================
    @Nested
    @DisplayName("getStatesByWorkflowId()")
    class GetStatesByWorkflowId {

        @Test
        @DisplayName("returns all states for a given workflow")
        void returnsStates_ForWorkflow() {
            UUID workflowId = UUID.randomUUID();
            UUID stateId1   = UUID.randomUUID();
            UUID stateId2   = UUID.randomUUID();
            UUID stateId3   = UUID.randomUUID();

            List<WorkflowState> states = List.of(
                    buildState(stateId1, workflowId, "Draft",    true,  false),
                    buildState(stateId2, workflowId, "Pending",  false, false),
                    buildState(stateId3, workflowId, "Approved", false, true)
            );
            when(stateRepository.findByWorkflowId(workflowId)).thenReturn(states);

            List<WorkflowState> result = workflowService.getStatesByWorkflowId(workflowId);

            assertThat(result).hasSize(3);
            assertThat(result).extracting(WorkflowState::getStateName)
                              .containsExactly("Draft", "Pending", "Approved");
            // Verify initial and final flags are preserved
            assertThat(result.get(0).getIsInitialState()).isTrue();
            assertThat(result.get(2).getIsFinalState()).isTrue();
        }

        @Test
        @DisplayName("returns empty list when workflow has no states")
        void returnsEmpty_WhenNoStates() {
            UUID workflowId = UUID.randomUUID();
            when(stateRepository.findByWorkflowId(workflowId)).thenReturn(Collections.emptyList());

            List<WorkflowState> result = workflowService.getStatesByWorkflowId(workflowId);

            assertThat(result).isEmpty();
        }
    }

    // =========================================================================
    // 5. createState
    // =========================================================================
    @Nested
    @DisplayName("createState()")
    class CreateState {

        @Test
        @DisplayName("sets workflowId on state before saving")
        void setsWorkflowId_BeforeSave() {
            UUID workflowId = UUID.randomUUID();
            WorkflowState state = buildState(null, null, "Draft", true, false);

            when(stateRepository.save(any(WorkflowState.class))).thenAnswer(inv -> {
                WorkflowState s = inv.getArgument(0);
                s.setId(UUID.randomUUID());
                return s;
            });

            WorkflowState result = workflowService.createState(workflowId, state);

            assertThat(result.getWorkflowId()).isEqualTo(workflowId);
            assertThat(result.getId()).isNotNull();
            verify(stateRepository, times(1)).save(state);
        }

        @Test
        @DisplayName("initial state flag is preserved after save")
        void preservesInitialStateFlag() {
            UUID workflowId = UUID.randomUUID();
            WorkflowState state = buildState(null, null, "Draft", true, false);
            when(stateRepository.save(any())).thenReturn(state);

            WorkflowState result = workflowService.createState(workflowId, state);

            assertThat(result.getIsInitialState()).isTrue();
            assertThat(result.getIsFinalState()).isFalse();
        }
    }

    // =========================================================================
    // 6. getTransitionsByWorkflowId
    // =========================================================================
    @Nested
    @DisplayName("getTransitionsByWorkflowId()")
    class GetTransitionsByWorkflowId {

        @Test
        @DisplayName("returns all transitions for a given workflow")
        void returnsTransitions() {
            UUID workflowId = UUID.randomUUID();
            UUID draftId    = UUID.randomUUID();
            UUID pendingId  = UUID.randomUUID();
            UUID approvedId = UUID.randomUUID();

            List<WorkflowTransition> transitions = List.of(
                    buildTransition(UUID.randomUUID(), workflowId, draftId,   pendingId,  "Submit",  "EMPLOYEE"),
                    buildTransition(UUID.randomUUID(), workflowId, pendingId, approvedId, "Approve", "MANAGER"),
                    buildTransition(UUID.randomUUID(), workflowId, pendingId, draftId,    "Reject",  "MANAGER")
            );
            when(transitionRepository.findByWorkflowId(workflowId)).thenReturn(transitions);

            List<WorkflowTransition> result = workflowService.getTransitionsByWorkflowId(workflowId);

            assertThat(result).hasSize(3);
            assertThat(result).extracting(WorkflowTransition::getActionName)
                              .containsExactlyInAnyOrder("Submit", "Approve", "Reject");
        }

        @Test
        @DisplayName("returns empty list when no transitions defined")
        void returnsEmpty_WhenNoTransitions() {
            UUID workflowId = UUID.randomUUID();
            when(transitionRepository.findByWorkflowId(workflowId)).thenReturn(Collections.emptyList());

            assertThat(workflowService.getTransitionsByWorkflowId(workflowId)).isEmpty();
        }
    }

    // =========================================================================
    // 7. createTransition
    // =========================================================================
    @Nested
    @DisplayName("createTransition()")
    class CreateTransition {

        @Test
        @DisplayName("sets workflowId on transition before saving")
        void setsWorkflowId_BeforeSave() {
            UUID workflowId = UUID.randomUUID();
            UUID fromId     = UUID.randomUUID();
            UUID toId       = UUID.randomUUID();

            WorkflowTransition transition = buildTransition(null, null, fromId, toId, "Submit", "EMPLOYEE");

            when(transitionRepository.save(any(WorkflowTransition.class))).thenAnswer(inv -> {
                WorkflowTransition t = inv.getArgument(0);
                t.setId(UUID.randomUUID());
                return t;
            });

            WorkflowTransition result = workflowService.createTransition(workflowId, transition);

            assertThat(result.getWorkflowId()).isEqualTo(workflowId);
            assertThat(result.getId()).isNotNull();
            verify(transitionRepository, times(1)).save(transition);
        }

        @Test
        @DisplayName("self-approval flag and email flag are preserved")
        void preservesFlags() {
            UUID workflowId = UUID.randomUUID();
            WorkflowTransition transition = buildTransition(null, null, UUID.randomUUID(), UUID.randomUUID(), "Approve", "MANAGER");
            transition.setAllowSelfApproval(false);
            transition.setSendEmailToCreator(true);

            when(transitionRepository.save(any())).thenReturn(transition);

            WorkflowTransition result = workflowService.createTransition(workflowId, transition);

            assertThat(result.getAllowSelfApproval()).isFalse();
            assertThat(result.getSendEmailToCreator()).isTrue();
        }
    }
}
