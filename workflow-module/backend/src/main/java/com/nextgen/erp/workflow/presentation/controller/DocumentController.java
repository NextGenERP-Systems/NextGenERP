package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.application.service.DocumentService;
import com.nextgen.erp.workflow.api.dto.DocumentResponseDTO;
import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    private final Path fileStorageLocation = Paths.get("attachments").toAbsolutePath().normalize();

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @GetMapping
    public ResponseEntity<Page<DocumentResponseDTO>> getAllDocuments(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getAllDocuments(search, pageable));
    }

    @GetMapping("/kanban")
    public ResponseEntity<Page<DocumentResponseDTO>> getKanbanDocuments(
            @RequestParam(required = false) UUID stateId,
            @RequestParam String stateName,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getKanbanDocuments(stateId, stateName, search, pageable));
    }

    @GetMapping("/approvals")
    public ResponseEntity<Page<DocumentResponseDTO>> getApprovals(
            @RequestParam List<String> roles,
            @RequestParam(required = false) String username,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getPendingApprovals(roles, username, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> getDocumentById(@PathVariable UUID id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<DocumentResponseDTO>> getDocumentsByUser(@PathVariable String username) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(username));
    }

    @GetMapping("/audit-trail")
    public ResponseEntity<Page<WorkflowHistory>> getAuditLogs(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getAuditLogs(search, pageable));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<WorkflowHistory>> getDocumentHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocumentHistory(id));
    }

    @PostMapping
    public ResponseEntity<DocumentResponseDTO> createDocument(@RequestBody Document document) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.createDocument(document));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> updateDocument(@PathVariable UUID id, @RequestBody Document document, @RequestParam(required = false) String role) {
        try {
            return ResponseEntity.ok(documentService.updateDocument(id, document, role));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<?> transitionDocument(
            @PathVariable UUID id,
            @RequestParam String action,
            @RequestParam String role,
            @RequestParam String username,
            @RequestBody(required = false) Map<String, String> payload) {
        try {
            String comments = payload != null ? payload.get("comments") : null;
            DocumentResponseDTO updated = documentService.transitionDocument(id, action, role, username, comments);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadAttachment(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String fileName = id.toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            String fileDownloadUri = "/api/v1/documents/attachments/" + fileName;
            
            DocumentResponseDTO document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Document updateReq = new Document();
            updateReq.setGcsAttachmentUrl(fileDownloadUri);
            documentService.updateDocument(id, updateReq, "SYSTEM");
            
            return ResponseEntity.ok(Map.of("url", fileDownloadUri));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping("/{id}/delegate")
    public ResponseEntity<?> delegateDocument(
            @PathVariable UUID id,
            @RequestParam String targetUsername,
            @RequestParam String delegatedBy) {
        try {
            documentService.delegateDocument(id, targetUsername, delegatedBy);
            return ResponseEntity.ok(Map.of("message", "Document successfully delegated to " + targetUsername));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<?> bulkAction(@RequestBody com.nextgen.erp.workflow.api.dto.BulkActionRequest request) {
        try {
            documentService.bulkTransitionDocuments(request.getDocumentIds(), request.getAction(), request.getRole(), request.getUsername(), request.getComments());
            return ResponseEntity.ok(Map.of("message", "Successfully processed " + request.getDocumentIds().size() + " documents."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
