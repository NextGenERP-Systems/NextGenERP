package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

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
        return projectRepository.save(project);
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

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
