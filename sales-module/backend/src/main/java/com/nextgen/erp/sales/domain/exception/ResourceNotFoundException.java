package com.nextgen.erp.sales.domain.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s with identifier '%s' was not found", resourceName, identifier));
    }
}
