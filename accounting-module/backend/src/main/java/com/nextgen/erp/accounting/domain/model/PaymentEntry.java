package com.nextgen.erp.accounting.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nextgen.erp.accounting.domain.model.Enums.PartyType;
import com.nextgen.erp.accounting.domain.model.Enums.PaymentMode;
import com.nextgen.erp.accounting.domain.model.Enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PaymentEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "payment_number", unique = true, nullable = false, length = 50)
    private String paymentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;

    @Column(name = "payment_date", nullable = false)
    @Builder.Default
    private LocalDate paymentDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", length = 50)
    private PartyType partyType;

    @Column(name = "party_name", length = 150)
    private String partyName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paid_from_account_id", nullable = false)
    private Account paidFromAccount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paid_to_account_id", nullable = false)
    private Account paidToAccount;

    @Column(name = "paid_amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "received_amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal receivedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_of_payment", length = 50)
    @Builder.Default
    private PaymentMode modeOfPayment = PaymentMode.BANK_TRANSFER;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "reference_date")
    private LocalDate referenceDate;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "SUBMITTED";

    @Column(name = "user_remarks", columnDefinition = "TEXT")
    private String userRemarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
