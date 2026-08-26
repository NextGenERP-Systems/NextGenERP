package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByCustomerCode(String customerCode);
    List<Customer> findByDisabledFalseOrderByIdDesc();
    
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.addresses LEFT JOIN FETCH c.contacts WHERE c.id = :id")
    Optional<Customer> findByIdWithDetails(UUID id);
}
