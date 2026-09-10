package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.api.dto.DocumentResponseDTO;
import com.nextgen.erp.workflow.domain.repository.DocumentRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowRepository;
import com.nextgen.erp.workflow.domain.repository.DocumentTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;
    
    @Mock
    private WorkflowRepository workflowRepository;
    
    @Mock
    private DocumentTemplateRepository templateRepository;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createDocument_ShouldGenerateDocumentNumber_WhenNull() {
        Document doc = new Document();
        doc.setTitle("Test Doc");
        doc.setOwnerUsername("john.doe");

        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document savedDoc = invocation.getArgument(0);
            savedDoc.setId(UUID.randomUUID());
            return savedDoc;
        });

        DocumentResponseDTO saved = documentService.createDocument(doc);

        assertNotNull(saved.getId());
        assertTrue(saved.getDocumentNumber().startsWith("DOC-"));
        verify(documentRepository, times(1)).save(doc);
    }

    @Test
    void getDocumentById_ShouldReturnDocument_WhenExists() {
        UUID id = UUID.randomUUID();
        Document doc = new Document();
        doc.setId(id);
        
        when(documentRepository.findById(id)).thenReturn(Optional.of(doc));

        Optional<DocumentResponseDTO> result = documentService.getDocumentById(id);
        
        assertTrue(result.isPresent());
        assertEquals(id, result.get().getId());
    }
}
