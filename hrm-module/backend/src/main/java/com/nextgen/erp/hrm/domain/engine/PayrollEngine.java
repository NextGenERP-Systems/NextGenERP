package com.nextgen.erp.hrm.domain.engine;

import com.nextgen.erp.hrm.domain.model.Enums.ComponentType;
import com.nextgen.erp.hrm.domain.model.SalarySlip;
import com.nextgen.erp.hrm.domain.model.SalarySlipItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PayrollEngine {

    private final NumberToWordsConverter numberToWordsConverter;

    public static class ComputedSalaryResult {
        public BigDecimal grossPay;
        public BigDecimal totalDeductions;
        public BigDecimal netPay;
        public BigDecimal roundedTotal;
        public String inWords;
        public List<SalarySlipItem> items = new ArrayList<>();
    }

    /**
     * Replicates ERPNext CTC Formula Computation with Attendance & Loss of Pay (LOP) Proration:
     * - Basic: 50% of Base Gross
     * - HRA: 25% of Base Gross
     * - Special Allowance: 25% of Base Gross
     * - PF Deduction: 12% of Basic
     * - PT Deduction: Standard Fixed 200
     * - TDS Deduction: Standard 4% slab estimation
     */
    public ComputedSalaryResult computeSalary(
            BigDecimal baseMonthlyGross,
            BigDecimal totalWorkingDays,
            BigDecimal paymentDays
    ) {
        return computeSalary(baseMonthlyGross, totalWorkingDays, paymentDays, BigDecimal.ZERO);
    }

    /**
     * Overloaded method to compute salary with integrated Sales Commissions & Incentives
     */
    public ComputedSalaryResult computeSalary(
            BigDecimal baseMonthlyGross,
            BigDecimal totalWorkingDays,
            BigDecimal paymentDays,
            BigDecimal salesCommission
    ) {
        ComputedSalaryResult result = new ComputedSalaryResult();

        if (totalWorkingDays == null || totalWorkingDays.compareTo(BigDecimal.ZERO) == 0) {
            totalWorkingDays = BigDecimal.valueOf(30);
        }
        if (paymentDays == null) {
            paymentDays = totalWorkingDays;
        }
        if (salesCommission == null || salesCommission.compareTo(BigDecimal.ZERO) < 0) {
            salesCommission = BigDecimal.ZERO;
        }

        // Attendance factor (e.g. 28 / 30 = 0.9333)
        BigDecimal attendanceFactor = paymentDays.divide(totalWorkingDays, 4, RoundingMode.HALF_UP);
        BigDecimal effectiveGross = baseMonthlyGross.multiply(attendanceFactor).setScale(2, RoundingMode.HALF_UP);

        // Earnings
        BigDecimal basic = effectiveGross.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hra = effectiveGross.multiply(BigDecimal.valueOf(0.25)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal special = effectiveGross.subtract(basic).subtract(hra).setScale(2, RoundingMode.HALF_UP);

        // Deductions
        BigDecimal pf = basic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pt = BigDecimal.valueOf(200.00);
        BigDecimal taxableIncome = effectiveGross.add(salesCommission);
        BigDecimal tds = taxableIncome.multiply(BigDecimal.valueOf(0.04)).setScale(2, RoundingMode.HALF_UP);

        BigDecimal gross = basic.add(hra).add(special).add(salesCommission).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deductions = pf.add(pt).add(tds).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(deductions).setScale(2, RoundingMode.HALF_UP);

        result.grossPay = gross;
        result.totalDeductions = deductions;
        result.netPay = net;
        result.roundedTotal = net.setScale(0, RoundingMode.HALF_UP);
        result.inWords = numberToWordsConverter.convertToWords(result.roundedTotal);

        // Populate Items
        result.items.add(SalarySlipItem.builder().componentName("Basic Salary").type(ComponentType.EARNING).amount(basic).build());
        result.items.add(SalarySlipItem.builder().componentName("House Rent Allowance (HRA)").type(ComponentType.EARNING).amount(hra).build());
        result.items.add(SalarySlipItem.builder().componentName("Special Allowance").type(ComponentType.EARNING).amount(special).build());
        
        if (salesCommission.compareTo(BigDecimal.ZERO) > 0) {
            result.items.add(SalarySlipItem.builder().componentName("Sales Commission & Incentives").type(ComponentType.EARNING).amount(salesCommission).build());
        }

        result.items.add(SalarySlipItem.builder().componentName("Provident Fund (PF 12%)").type(ComponentType.DEDUCTION).amount(pf).build());
        result.items.add(SalarySlipItem.builder().componentName("Professional Tax (PT)").type(ComponentType.DEDUCTION).amount(pt).build());
        result.items.add(SalarySlipItem.builder().componentName("Income Tax (TDS)").type(ComponentType.DEDUCTION).amount(tds).build());

        return result;
    }
}
