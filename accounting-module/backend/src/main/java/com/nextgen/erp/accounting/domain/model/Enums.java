package com.nextgen.erp.accounting.domain.model;

public class Enums {

    public enum RootType {
        ASSET,
        LIABILITY,
        EQUITY,
        INCOME,
        EXPENSE
    }

    public enum AccountType {
        Bank,
        Cash,
        Receivable,
        Payable,
        Stock,
        Fixed_Asset,
        Cost_of_Goods_Sold,
        Tax,
        Direct_Income,
        Indirect_Income,
        Operating_Expense,
        Equity
    }

    public enum VoucherType {
        SALES_INVOICE,
        PURCHASE_INVOICE,
        PAYMENT_ENTRY,
        JOURNAL_ENTRY
    }

    public enum JournalVoucherType {
        JOURNAL_ENTRY,
        BANK_ENTRY,
        CASH_ENTRY,
        OPENING_ENTRY,
        CONTRA_ENTRY
    }

    public enum InvoiceStatus {
        DRAFT,
        SUBMITTED,
        PARTLY_PAID,
        PAID,
        OVERDUE,
        CANCELLED
    }

    public enum PaymentType {
        RECEIVE,
        PAY,
        INTERNAL_TRANSFER
    }

    public enum PaymentMode {
        CASH,
        BANK_TRANSFER,
        CHEQUE,
        UPI,
        CREDIT_CARD
    }

    public enum PartyType {
        CUSTOMER,
        SUPPLIER,
        EMPLOYEE,
        SHAREHOLDER
    }
}
