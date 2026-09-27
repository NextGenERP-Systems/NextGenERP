package com.nextgen.erp.accounting.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankClearanceRequest {
    private List<ClearanceItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClearanceItem {
        private String voucherNumber;
        private LocalDate clearanceDate;
    }
}
