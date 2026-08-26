package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.exception.CreditLimitExceededException;
import com.nextgen.erp.sales.domain.model.Customer;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CreditLimitValidator {

    public void validateCustomerCredit(Customer customer, BigDecimal newOrderAmount) {
        if (customer == null || Boolean.TRUE.equals(customer.getBypassCreditLimitCheck())) {
            return;
        }

        BigDecimal limit = customer.getCreditLimit();
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            return; // No credit limit imposed
        }

        BigDecimal currentBalance = customer.getOutstandingBalance() != null ? customer.getOutstandingBalance() : BigDecimal.ZERO;
        BigDecimal projectedBalance = currentBalance.add(newOrderAmount != null ? newOrderAmount : BigDecimal.ZERO);

        if (projectedBalance.compareTo(limit) > 0) {
            throw new CreditLimitExceededException(
                    customer.getCustomerName(),
                    currentBalance,
                    newOrderAmount != null ? newOrderAmount : BigDecimal.ZERO,
                    limit
            );
        }
    }
}
