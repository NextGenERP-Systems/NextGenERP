package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.ProjectTemplate;
import com.nextgen.erp.projects.domain.model.ProjectTemplateTask;
import com.nextgen.erp.projects.domain.model.ProjectType;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTemplateRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTemplateTaskRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTypeRepository;
import com.nextgen.erp.projects.presentation.dto.ProjectTemplateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectTemplateService {

    private final ProjectTemplateRepository projectTemplateRepository;
    private final ProjectTemplateTaskRepository projectTemplateTaskRepository;
    private final ProjectTypeRepository projectTypeRepository;

    public List<ProjectTemplateDTO> getAllTemplates() {
        return projectTemplateRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProjectTemplateDTO getTemplateById(UUID id) {
        ProjectTemplate template = projectTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        return mapToDTO(template);
    }

    @Transactional
    public ProjectTemplateDTO createTemplate(ProjectTemplateDTO dto) {
        ProjectTemplate template = new ProjectTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        
        if (dto.getProjectTypeId() != null) {
            ProjectType pt = projectTypeRepository.findById(dto.getProjectTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Project Type not found"));
            template.setProjectType(pt);
        }

        ProjectTemplate savedTemplate = projectTemplateRepository.save(template);
        
        if (dto.getTasks() != null && !dto.getTasks().isEmpty()) {
            for (ProjectTemplateDTO.TemplateTaskDTO taskDto : dto.getTasks()) {
                ProjectTemplateTask task = new ProjectTemplateTask();
                task.setProjectTemplate(savedTemplate);
                task.setSubject(taskDto.getSubject());
                task.setDescription(taskDto.getDescription());
                task.setTaskWeight(taskDto.getTaskWeight() != null ? taskDto.getTaskWeight() : 1);
                task.setStartDay(taskDto.getStartDay() != null ? taskDto.getStartDay() : 0);
                task.setDurationDays(taskDto.getDurationDays() != null ? taskDto.getDurationDays() : 1);
                task.setParentTaskSubject(taskDto.getParentTaskSubject());
                projectTemplateTaskRepository.save(task);
            }
        }
        
        return mapToDTO(savedTemplate);
    }

    @Transactional
    public ProjectTemplateDTO updateTemplate(UUID id, ProjectTemplateDTO dto) {
        ProjectTemplate template = projectTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        
        if (dto.getProjectTypeId() != null) {
            ProjectType pt = projectTypeRepository.findById(dto.getProjectTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Project Type not found"));
            template.setProjectType(pt);
        } else {
            template.setProjectType(null);
        }

        ProjectTemplate savedTemplate = projectTemplateRepository.save(template);

        // Simple approach: delete old tasks, insert new ones
        projectTemplateTaskRepository.deleteByProjectTemplate_Id(id);
        
        if (dto.getTasks() != null && !dto.getTasks().isEmpty()) {
            for (ProjectTemplateDTO.TemplateTaskDTO taskDto : dto.getTasks()) {
                ProjectTemplateTask task = new ProjectTemplateTask();
                task.setProjectTemplate(savedTemplate);
                task.setSubject(taskDto.getSubject());
                task.setDescription(taskDto.getDescription());
                task.setTaskWeight(taskDto.getTaskWeight() != null ? taskDto.getTaskWeight() : 1);
                task.setStartDay(taskDto.getStartDay() != null ? taskDto.getStartDay() : 0);
                task.setDurationDays(taskDto.getDurationDays() != null ? taskDto.getDurationDays() : 1);
                task.setParentTaskSubject(taskDto.getParentTaskSubject());
                projectTemplateTaskRepository.save(task);
            }
        }

        return mapToDTO(savedTemplate);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        projectTemplateTaskRepository.deleteByProjectTemplate_Id(id);
        projectTemplateRepository.deleteById(id);
    }

    private ProjectTemplateDTO mapToDTO(ProjectTemplate template) {
        ProjectTemplateDTO dto = new ProjectTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        if (template.getProjectType() != null) {
            dto.setProjectTypeId(template.getProjectType().getId());
        }

        List<ProjectTemplateTask> tasks = projectTemplateTaskRepository.findByProjectTemplate_Id(template.getId());
        List<ProjectTemplateDTO.TemplateTaskDTO> taskDtos = new ArrayList<>();
        for (ProjectTemplateTask t : tasks) {
            ProjectTemplateDTO.TemplateTaskDTO tdto = new ProjectTemplateDTO.TemplateTaskDTO();
            tdto.setId(t.getId());
            tdto.setSubject(t.getSubject());
            tdto.setDescription(t.getDescription());
            tdto.setTaskWeight(t.getTaskWeight());
            tdto.setStartDay(t.getStartDay());
            tdto.setDurationDays(t.getDurationDays());
            tdto.setParentTaskSubject(t.getParentTaskSubject());
            taskDtos.add(tdto);
        }
        dto.setTasks(taskDtos);
        
        return dto;
    }
}
