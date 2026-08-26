package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "price_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "price_list_name", nullable = false, unique = true, length = 100)
    private String priceListName;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column
    @Builder.Default
    private Boolean buying = false;

    @Column
    @Builder.Default
    private Boolean selling = true;

    @Column
    @Builder.Default
    private Boolean enabled = true;
}
