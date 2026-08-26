package com.nextgen.erp.sales.presentation.exception;

import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.CreditLimitExceededException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("https://nextgen-erp.io/errors/not-found"));
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }

    @ExceptionHandler(CreditLimitExceededException.class)
    public ProblemDetail handleCreditLimitExceeded(CreditLimitExceededException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.PAYMENT_REQUIRED, ex.getMessage());
        problem.setTitle("Customer Credit Limit Exceeded");
        problem.setType(URI.create("https://nextgen-erp.io/errors/credit-limit-exceeded"));
        problem.setProperty("timestamp", OffsetDateTime.now());
        problem.setProperty("customerName", ex.getCustomerName());
        problem.setProperty("currentOutstanding", ex.getCurrentOutstanding());
        problem.setProperty("orderAmount", ex.getOrderAmount());
        problem.setProperty("creditLimit", ex.getCreditLimit());
        return problem;
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ProblemDetail handleBusinessValidation(BusinessValidationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Business Rule Violation");
        problem.setType(URI.create("https://nextgen-erp.io/errors/validation-error"));
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationErrors(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for one or more fields");
        problem.setTitle("Invalid Request Parameters");
        problem.setType(URI.create("https://nextgen-erp.io/errors/bad-request"));
        problem.setProperty("timestamp", OffsetDateTime.now());

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        problem.setProperty("fieldErrors", fieldErrors);
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        problem.setTitle("Internal Server Error");
        problem.setType(URI.create("https://nextgen-erp.io/errors/internal-error"));
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }
}
