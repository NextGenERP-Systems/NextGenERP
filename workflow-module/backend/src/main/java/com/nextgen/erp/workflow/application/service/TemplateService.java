package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.DocumentTemplate;
import com.nextgen.erp.workflow.domain.repository.DocumentTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public DocumentTemplate createTemplate(DocumentTemplate template) {
        return templateRepository.save(template);
    }

    public DocumentTemplate updateTemplate(UUID id, DocumentTemplate template) {
        return templateRepository.findById(id).map(existing -> {
            existing.setName(template.getName());
            existing.setDocumentType(template.getDocumentType());
            existing.setHtmlContent(template.getHtmlContent());
            return templateRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public void deleteTemplate(UUID id) {
        templateRepository.deleteById(id);
    }
}
