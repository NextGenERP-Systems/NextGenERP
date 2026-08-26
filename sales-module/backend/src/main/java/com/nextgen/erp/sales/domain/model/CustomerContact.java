package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email_id", length = 255)
    private String emailId;

    @Column(name = "mobile_no", length = 50)
    private String mobileNo;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String designation;

    @Column(name = "is_primary_contact")
    @Builder.Default
    private Boolean isPrimaryContact = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
