package com.nextgen.erp.projects.presentation.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ProjectTemplateDTO {
    private UUID id;
    private String name;
    private UUID projectTypeId;
    private String description;
    private List<TemplateTaskDTO> tasks;

    @Data
    public static class TemplateTaskDTO {
        private UUID id;
        private String subject;
        private String description;
        private Integer taskWeight;
        private Integer startDay;
        private Integer durationDays;
        private String parentTaskSubject;
    }
}
