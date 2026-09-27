package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_routing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Routing {

    @Id
    @Column(name = "routing_id", length = 100)
    private String routingId;

    @Column(name = "routing_name", nullable = false)
    private String routingName;

    @Column(name = "item_code", length = 100)
    private String itemCode;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "routing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoutingOperation> operations = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getRoutingId() { return routingId; }
    public void setRoutingId(String routingId) { this.routingId = routingId; }

    public String getRoutingName() { return routingName; }
    public void setRoutingName(String routingName) { this.routingName = routingName; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public List<RoutingOperation> getOperations() { return operations; }
    public void setOperations(List<RoutingOperation> operations) { this.operations = operations; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
