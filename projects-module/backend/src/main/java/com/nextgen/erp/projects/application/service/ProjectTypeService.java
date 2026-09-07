package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.ProjectType;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectTypeService {

    private final ProjectTypeRepository projectTypeRepository;
    private final ProjectRepository projectRepository;

    public List<ProjectType> getAllProjectTypes() {
        return projectTypeRepository.findAll();
    }

    @Transactional
    public ProjectType createProjectType(ProjectType projectType) {
        if (projectType.getName() == null || projectType.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project Type name cannot be empty");
        }
        return projectTypeRepository.save(projectType);
    }

    @Transactional
    public ProjectType updateProjectType(UUID id, ProjectType updatedType) {
        ProjectType existing = projectTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project Type not found"));
        
        if (updatedType.getName() == null || updatedType.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project Type name cannot be empty");
        }
        
        existing.setName(updatedType.getName());
        existing.setDescription(updatedType.getDescription());
        if (updatedType.getIsActive() != null) {
            existing.setIsActive(updatedType.getIsActive());
        }
        
        return projectTypeRepository.save(existing);
    }

    @Transactional
    public void deleteProjectType(UUID id) {
        ProjectType existing = projectTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project Type not found"));
                
        if (projectRepository.existsByProjectType_Id(id)) {
            throw new IllegalStateException("Cannot delete Project Type because it is referenced by existing projects. Consider disabling it instead.");
        }
        
        projectTypeRepository.delete(existing);
    }
}
