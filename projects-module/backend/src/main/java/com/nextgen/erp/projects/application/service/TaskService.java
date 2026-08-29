package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.domain.model.Task;
import com.nextgen.erp.projects.domain.model.TaskStatus;
import com.nextgen.erp.projects.domain.model.DependencyType;
import com.nextgen.erp.projects.domain.model.TaskDependency;
import com.nextgen.erp.projects.domain.repository.TaskDependencyRepository;
import com.nextgen.erp.projects.infrastructure.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final TaskDependencyRepository dependencyRepository;

    @Transactional(readOnly = true)
    public List<Task> getTasksByProjectId(UUID projectId) {
        return taskRepository.findByProject_Id(projectId);
    }

    @Transactional(readOnly = true)
    public Task getTaskById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    @Transactional
    public Task createTask(UUID projectId, Task task) {
        Project project = projectService.getProjectById(projectId);
        task.setProject(project);
        if (task.getParentTask() != null && task.getParentTask().getId() != null) {
             Task parent = getTaskById(task.getParentTask().getId());
             task.setParentTask(parent);
        } else {
             task.setParentTask(null);
        }
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(UUID id, Task taskDetails) {
        Task task = getTaskById(id);
        
        long daysShifted = 0;
        if (task.getExpectedStartDate() != null && taskDetails.getExpectedStartDate() != null) {
            daysShifted = ChronoUnit.DAYS.between(task.getExpectedStartDate(), taskDetails.getExpectedStartDate());
        }

        task.setName(taskDetails.getName());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setExpectedStartDate(taskDetails.getExpectedStartDate());
        task.setExpectedEndDate(taskDetails.getExpectedEndDate());
        task.setAssigneeId(taskDetails.getAssigneeId());
        task.setWeight(taskDetails.getWeight());
        task.setIsMilestone(taskDetails.getIsMilestone());
        if (taskDetails.getKanbanState() != null) {
            task.setKanbanState(taskDetails.getKanbanState());
        }

        Task updated = taskRepository.save(task);

        if (daysShifted != 0) {
            shiftSuccessorTasks(updated.getId(), daysShifted);
        }

        return updated;
    }

    private void shiftSuccessorTasks(UUID predecessorId, long daysShifted) {
        List<TaskDependency> dependencies = dependencyRepository.findByPredecessorId(predecessorId);
        
        for (TaskDependency dep : dependencies) {
            Task successor = dep.getSuccessor();
            
            // For FINISH_TO_START or START_TO_START, shift the successor's start date
            if (dep.getType() == DependencyType.FINISH_TO_START || dep.getType() == DependencyType.START_TO_START) {
                if (successor.getExpectedStartDate() != null) {
                    LocalDate newStart = successor.getExpectedStartDate().plusDays(daysShifted);
                    LocalDate newEnd = successor.getExpectedEndDate() != null 
                        ? successor.getExpectedEndDate().plusDays(daysShifted) 
                        : null;
                        
                    successor.setExpectedStartDate(newStart);
                    successor.setExpectedEndDate(newEnd);
                    taskRepository.save(successor);
                    
                    // Recursively shift down the chain
                    shiftSuccessorTasks(successor.getId(), daysShifted);
                }
            }
        }
    }

    @Transactional
    public Task updateTaskStatus(UUID id, TaskStatus status) {
        Task task = getTaskById(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(UUID id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
