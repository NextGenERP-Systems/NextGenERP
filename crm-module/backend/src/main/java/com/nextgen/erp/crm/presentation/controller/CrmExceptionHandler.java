package com.nextgen.erp.crm.presentation.controller;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import jakarta.persistence.EntityNotFoundException;
import com.nextgen.erp.crm.service.CrmConflictException;
@RestControllerAdvice(basePackages = "com.nextgen.erp.crm")
public class CrmExceptionHandler {
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> validation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, String> fields = new java.util.LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return Map.of("message", "Check the highlighted fields", "fields", fields);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict(DataIntegrityViolationException ex) {
        return Map.of("message", "The operation conflicts with a CRM record or reference");
    }
    @ExceptionHandler(CrmConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String,String> conflict(CrmConflictException ex){return Map.of("message",ex.getMessage());}
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(EntityNotFoundException ex) {
        return Map.of("message", ex.getMessage());
    }
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(IllegalArgumentException ex) {
        return Map.of("message", ex.getMessage());
    }
}
