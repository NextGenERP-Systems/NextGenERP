package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.DocumentTemplate;
import com.nextgen.erp.workflow.domain.repository.DocumentTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final DocumentTemplateRepository templateRepository;

    public List<DocumentTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Optional<DocumentTemplate> getTemplateById(UUID id) {
        return templateRepository.findById(id);
    }

    @Transactional
    public DocumentTemplate createTemplate(DocumentTemplate template) {
        if (template.getCategory() == null || template.getCategory().isBlank()) {
            template.setCategory("General");
        }
        if (template.getCreatedBy() == null || template.getCreatedBy().isBlank()) {
            template.setCreatedBy("admin_user");
        }
        if (template.getIsActive() == null) {
            template.setIsActive(true);
        }
        return templateRepository.save(template);
    }

    @Transactional
    public DocumentTemplate updateTemplate(UUID id, DocumentTemplate template) {
        return templateRepository.findById(id).map(existing -> {
            if (template.getName() != null && !template.getName().isBlank()) {
                existing.setName(template.getName());
            }
            if (template.getDocumentType() != null && !template.getDocumentType().isBlank()) {
                existing.setDocumentType(template.getDocumentType());
            }
            if (template.getHtmlContent() != null) {
                existing.setHtmlContent(template.getHtmlContent());
            }
            if (template.getCategory() != null && !template.getCategory().isBlank()) {
                existing.setCategory(template.getCategory());
            }
            if (template.getIsActive() != null) {
                existing.setIsActive(template.getIsActive());
            }
            return templateRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        templateRepository.deleteById(id);
    }
}
