package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.exception.CreditLimitExceededException;
import com.nextgen.erp.sales.domain.model.Customer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CreditLimitValidatorTest {

    private CreditLimitValidator creditLimitValidator;

    @BeforeEach
    void setUp() {
        creditLimitValidator = new CreditLimitValidator();
    }

    @Test
    @DisplayName("Should pass when order amount within credit limit")
    void testCreditLimitWithinBound() {
        Customer customer = Customer.builder()
                .customerName("Acme Corp")
                .creditLimit(new BigDecimal("50000.00"))
                .outstandingBalance(new BigDecimal("20000.00"))
                .bypassCreditLimitCheck(false)
                .build();

        assertDoesNotThrow(() -> creditLimitValidator.validateCustomerCredit(customer, new BigDecimal("15000.00")));
    }

    @Test
    @DisplayName("Should throw CreditLimitExceededException when order pushes outstanding above limit")
    void testCreditLimitExceeded() {
        Customer customer = Customer.builder()
                .customerName("Acme Corp")
                .creditLimit(new BigDecimal("50000.00"))
                .outstandingBalance(new BigDecimal("45000.00"))
                .bypassCreditLimitCheck(false)
                .build();

        assertThrows(CreditLimitExceededException.class, () ->
                creditLimitValidator.validateCustomerCredit(customer, new BigDecimal("10000.00"))
        );
    }

    @Test
    @DisplayName("Should bypass credit check if customer has bypass flag enabled")
    void testBypassCreditLimit() {
        Customer customer = Customer.builder()
                .customerName("VIP Corp")
                .creditLimit(new BigDecimal("10000.00"))
                .outstandingBalance(new BigDecimal("50000.00"))
                .bypassCreditLimitCheck(true)
                .build();

        assertDoesNotThrow(() -> creditLimitValidator.validateCustomerCredit(customer, new BigDecimal("100000.00")));
    }
}
