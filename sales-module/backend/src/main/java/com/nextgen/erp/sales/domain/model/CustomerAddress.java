package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "address_title", nullable = false, length = 100)
    private String addressTitle;

    @Column(name = "address_type", length = 50)
    @Builder.Default
    private String addressType = "Billing";

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 20)
    private String pincode;

    @Column(name = "is_primary_address")
    @Builder.Default
    private Boolean isPrimaryAddress = false;

    @Column(name = "is_shipping_address")
    @Builder.Default
    private Boolean isShippingAddress = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
