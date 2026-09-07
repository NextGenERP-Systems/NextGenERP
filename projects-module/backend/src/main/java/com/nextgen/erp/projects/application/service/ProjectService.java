package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.domain.model.ProjectTemplateTask;
import com.nextgen.erp.projects.domain.model.Task;
import com.nextgen.erp.projects.domain.model.TaskStatus;
import com.nextgen.erp.projects.domain.model.ProjectPriority;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTemplateTaskRepository;
import com.nextgen.erp.projects.infrastructure.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTemplateTaskRepository templateTaskRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Project getProjectById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    @Transactional
    public Project createProject(Project project) {
        Project savedProject = projectRepository.save(project);
        
        if (project.getProjectTemplate() != null && project.getProjectTemplate().getId() != null) {
            List<ProjectTemplateTask> templateTasks = templateTaskRepository.findByProjectTemplate_Id(project.getProjectTemplate().getId());
            for (ProjectTemplateTask tt : templateTasks) {
                Task task = new Task();
                task.setProject(savedProject);
                task.setName(tt.getSubject());
                task.setDescription(tt.getDescription());
                task.setWeight(tt.getTaskWeight());
                task.setStatus(TaskStatus.TODO);
                task.setPriority(ProjectPriority.MEDIUM);
                if (savedProject.getExpectedStartDate() != null && tt.getStartDay() != null) {
                    task.setExpectedStartDate(savedProject.getExpectedStartDate().plusDays(tt.getStartDay()));
                    if (tt.getDurationDays() != null) {
                        task.setExpectedEndDate(task.getExpectedStartDate().plusDays(tt.getDurationDays()));
                    }
                }
                taskRepository.save(task);
            }
        }
        
        return savedProject;
    }

    @Transactional
    public Project updateProject(UUID id, Project projectDetails) {
        Project project = getProjectById(id);
        
        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        project.setStatus(projectDetails.getStatus());
        project.setPriority(projectDetails.getPriority());
        project.setExpectedStartDate(projectDetails.getExpectedStartDate());
        project.setExpectedEndDate(projectDetails.getExpectedEndDate());
        project.setActualStartDate(projectDetails.getActualStartDate());
        project.setActualEndDate(projectDetails.getActualEndDate());
        project.setEstimatedCost(projectDetails.getEstimatedCost());
        project.setActualCost(projectDetails.getActualCost());
        project.setPercentComplete(projectDetails.getPercentComplete());
        project.setProjectManagerId(projectDetails.getProjectManagerId());
        if (projectDetails.getPercentCompleteMethod() != null) {
            project.setPercentCompleteMethod(projectDetails.getPercentCompleteMethod());
        }
        project.setCompany(projectDetails.getCompany());
        project.setDepartment(projectDetails.getDepartment());

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }

    @Transactional
    public void updateProjectCompletion(UUID projectId) {
        Project project = getProjectById(projectId);
        
        if (project.getPercentCompleteMethod() == null || 
            project.getPercentCompleteMethod() == com.nextgen.erp.projects.domain.model.PercentCompleteMethod.MANUAL) {
            return;
        }

        List<Task> tasks = taskRepository.findByProject_Id(projectId);
        if (tasks.isEmpty()) {
            project.setPercentComplete(0);
            projectRepository.save(project);
            return;
        }

        double totalCompleted = 0;
        double totalWeight = 0;

        for (Task task : tasks) {
            boolean isCompleted = task.getStatus() == TaskStatus.COMPLETED;
            
            if (project.getPercentCompleteMethod() == com.nextgen.erp.projects.domain.model.PercentCompleteMethod.TASK_COMPLETION) {
                totalWeight += 1.0;
                if (isCompleted) {
                    totalCompleted += 1.0;
                }
            } else if (project.getPercentCompleteMethod() == com.nextgen.erp.projects.domain.model.PercentCompleteMethod.TASK_WEIGHT) {
                double weight = task.getWeight() != null ? task.getWeight() : 1.0;
                totalWeight += weight;
                if (isCompleted) {
                    totalCompleted += weight;
                }
            }
        }

        int percent = 0;
        if (totalWeight > 0) {
            percent = (int) Math.round((totalCompleted / totalWeight) * 100);
        }
        
        project.setPercentComplete(Math.min(100, Math.max(0, percent)));
        projectRepository.save(project);
    }
}
