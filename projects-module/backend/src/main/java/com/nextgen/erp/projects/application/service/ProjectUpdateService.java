package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.domain.model.ProjectUpdate;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectUpdateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectUpdateService {

    private final ProjectUpdateRepository projectUpdateRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectUpdate> getProjectUpdates(UUID projectId) {
        return projectUpdateRepository.findByProject_IdOrderByUpdateDateDesc(projectId);
    }

    @Transactional(readOnly = true)
    public ProjectUpdate getProjectUpdateById(UUID id) {
        return projectUpdateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Update not found"));
    }

    @Transactional
    public ProjectUpdate createProjectUpdate(ProjectUpdate projectUpdate) {
        if (projectUpdate.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }
        Project project = projectRepository.findById(projectUpdate.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectUpdate.setProject(project);

        if ("Sent".equalsIgnoreCase(projectUpdate.getStatus())) {
            projectUpdate.setSentAt(LocalDateTime.now());
            // Here you would typically trigger an email or notification using the existing infrastructure
            // notificationService.sendProjectUpdate(projectUpdate);
        }

        return projectUpdateRepository.save(projectUpdate);
    }

    @Transactional
    public ProjectUpdate updateProjectUpdate(UUID id, ProjectUpdate details) {
        ProjectUpdate existing = getProjectUpdateById(id);

        if ("Sent".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalStateException("Cannot modify a project update that has already been sent");
        }

        existing.setUpdateDate(details.getUpdateDate());
        existing.setProgress(details.getProgress());
        existing.setChallenges(details.getChallenges());
        existing.setNextSteps(details.getNextSteps());
        existing.setRecipients(details.getRecipients());
        existing.setStatus(details.getStatus());

        if ("Sent".equalsIgnoreCase(details.getStatus())) {
            existing.setSentAt(LocalDateTime.now());
            // Trigger notification
        }

        return projectUpdateRepository.save(existing);
    }

    @Transactional
    public void deleteProjectUpdate(UUID id) {
        ProjectUpdate existing = getProjectUpdateById(id);
        if ("Sent".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalStateException("Cannot delete a project update that has already been sent");
        }
        projectUpdateRepository.delete(existing);
    }
}
