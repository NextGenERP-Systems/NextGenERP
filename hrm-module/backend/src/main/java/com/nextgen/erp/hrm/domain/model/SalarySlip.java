package com.nextgen.erp.hrm.domain.model;

import com.nextgen.erp.hrm.domain.model.Enums.SalarySlipStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "salary_slips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlip {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "slip_number", unique = true, nullable = false, length = 50)
    private String slipNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "total_working_days", precision = 4, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal totalWorkingDays = BigDecimal.valueOf(30);

    @Column(name = "payment_days", precision = 4, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal paymentDays = BigDecimal.valueOf(30);

    @Column(name = "absent_days", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal absentDays = BigDecimal.ZERO;

    @Column(name = "leave_without_pay_days", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal leaveWithoutPayDays = BigDecimal.ZERO;

    @Column(name = "gross_pay", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal grossPay = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_pay", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal netPay = BigDecimal.ZERO;

    @Column(name = "rounded_total", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal roundedTotal = BigDecimal.ZERO;

    @Column(name = "in_words", columnDefinition = "TEXT")
    private String inWords;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SalarySlipStatus status = SalarySlipStatus.DRAFT;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @OneToMany(mappedBy = "salarySlip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SalarySlipItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public void addItem(SalarySlipItem item) {
        items.add(item);
        item.setSalarySlip(this);
    }
}
