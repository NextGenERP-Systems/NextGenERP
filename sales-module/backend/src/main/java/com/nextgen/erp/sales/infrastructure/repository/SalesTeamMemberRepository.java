package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesTeamMemberRepository extends JpaRepository<SalesTeamMember, UUID> {

    List<SalesTeamMember> findByVoucherTypeAndVoucherIdOrderByAllocatedPercentageDesc(String voucherType, UUID voucherId);

    List<SalesTeamMember> findBySalesPersonId(UUID salesPersonId);

    void deleteByVoucherTypeAndVoucherId(String voucherType, UUID voucherId);
}
