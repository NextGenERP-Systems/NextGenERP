package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.domain.model.ProjectUser;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectUserService {

    private final ProjectUserRepository projectUserRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectUser> getProjectUsers(UUID projectId) {
        return projectUserRepository.findByProject_Id(projectId);
    }

    @Transactional
    public ProjectUser addProjectUser(ProjectUser projectUser) {
        if (projectUser.getProject() != null && projectUser.getProject().getId() != null) {
            Project project = projectRepository.findById(projectUser.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            projectUser.setProject(project);
        }
        return projectUserRepository.save(projectUser);
    }

    @Transactional
    public void removeProjectUser(UUID id) {
        projectUserRepository.deleteById(id);
    }
}
