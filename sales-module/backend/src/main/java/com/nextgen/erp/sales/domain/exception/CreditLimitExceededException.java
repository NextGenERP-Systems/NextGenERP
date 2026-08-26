package com.nextgen.erp.sales.domain.exception;

import java.math.BigDecimal;

public class CreditLimitExceededException extends RuntimeException {

    private final String customerName;
    private final BigDecimal currentOutstanding;
    private final BigDecimal orderAmount;
    private final BigDecimal creditLimit;

    public CreditLimitExceededException(String customerName, BigDecimal currentOutstanding, BigDecimal orderAmount, BigDecimal creditLimit) {
        super(String.format(
                "Credit limit exceeded for customer '%s'. Outstanding Balance: %s, Order Amount: %s, Total Projected: %s, Credit Limit: %s",
                customerName,
                currentOutstanding,
                orderAmount,
                currentOutstanding.add(orderAmount),
                creditLimit
        ));
        this.customerName = customerName;
        this.currentOutstanding = currentOutstanding;
        this.orderAmount = orderAmount;
        this.creditLimit = creditLimit;
    }

    public String getCustomerName() {
        return customerName;
    }

    public BigDecimal getCurrentOutstanding() {
        return currentOutstanding;
    }

    public BigDecimal getOrderAmount() {
        return orderAmount;
    }

    public BigDecimal getCreditLimit() {
        return creditLimit;
    }
}
