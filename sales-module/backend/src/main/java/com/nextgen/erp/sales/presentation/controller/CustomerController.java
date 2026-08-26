package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.CustomerCreateRequest;
import com.nextgen.erp.sales.application.dto.CustomerDto;
import com.nextgen.erp.sales.application.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "Endpoints for managing ERP customer master records, credit limits, and addresses")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get all active customers")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by UUID with addresses and contacts")
    public ResponseEntity<CustomerDto> getCustomerById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new customer master record")
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        CustomerDto created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
