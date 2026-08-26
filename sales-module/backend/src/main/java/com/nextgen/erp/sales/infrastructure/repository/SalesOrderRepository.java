package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesOrder;
import com.nextgen.erp.sales.domain.model.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID> {
    Optional<SalesOrder> findByOrderNumber(String orderNumber);
    List<SalesOrder> findByCustomerIdOrderByTransactionDateDesc(UUID customerId);
    List<SalesOrder> findByStatusOrderByTransactionDateDesc(SalesOrderStatus status);
    
    @Query("SELECT s FROM SalesOrder s LEFT JOIN FETCH s.items LEFT JOIN FETCH s.paymentSchedules LEFT JOIN FETCH s.stockReservations WHERE s.id = :id")
    Optional<SalesOrder> findByIdWithDetails(UUID id);

    @Query("SELECT COALESCE(SUM(s.grandTotal), 0) FROM SalesOrder s WHERE s.status NOT IN ('DRAFT', 'CANCELLED')")
    BigDecimal sumTotalConfirmedRevenue();

    @Query("SELECT COUNT(s) FROM SalesOrder s WHERE s.status = :status")
    long countByStatus(SalesOrderStatus status);

    List<SalesOrder> findTop10ByOrderByCreatedAtDesc();
}
