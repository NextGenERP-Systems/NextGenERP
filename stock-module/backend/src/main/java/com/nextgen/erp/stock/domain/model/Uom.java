package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "uoms", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Uom {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "uom_name", nullable = false, unique = true, length = 100)
    private String uomName;

    @Column(length = 20)
    private String symbol;

    @Column(name = "must_be_whole_number")
    @Builder.Default
    private Boolean mustBeWholeNumber = false;

    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
