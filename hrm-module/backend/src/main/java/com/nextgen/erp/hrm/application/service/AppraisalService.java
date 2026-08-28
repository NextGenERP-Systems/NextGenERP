package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.EmployeeAppraisal;
import com.nextgen.erp.hrm.domain.model.Enums.AppraisalStatus;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeAppraisalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppraisalService {

    private final EmployeeAppraisalRepository appraisalRepository;

    @Transactional(readOnly = true)
    public List<EmployeeAppraisal> getAllAppraisals() {
        return appraisalRepository.findAll();
    }

    @Transactional
    public EmployeeAppraisal createAppraisal(EmployeeAppraisal appraisal) {
        appraisal.setStatus(AppraisalStatus.DRAFT);
        return appraisalRepository.save(appraisal);
    }

    @Transactional
    public EmployeeAppraisal completeAppraisal(UUID appraisalId, BigDecimal selfScore, BigDecimal managerScore, String remarks, Boolean promotionRecommended, BigDecimal incrementPercent) {
        EmployeeAppraisal appraisal = appraisalRepository.findById(appraisalId)
                .orElseThrow(() -> new IllegalArgumentException("Appraisal not found: " + appraisalId));

        appraisal.setSelfScore(selfScore);
        appraisal.setManagerScore(managerScore);

        if (selfScore != null && managerScore != null) {
            BigDecimal finalScore = selfScore.multiply(BigDecimal.valueOf(0.40))
                    .add(managerScore.multiply(BigDecimal.valueOf(0.60)))
                    .setScale(2, RoundingMode.HALF_UP);
            appraisal.setFinalScore(finalScore);
        }

        appraisal.setRemarks(remarks);
        if (promotionRecommended != null) appraisal.setPromotionRecommended(promotionRecommended);
        if (incrementPercent != null) appraisal.setIncrementPercentage(incrementPercent);
        appraisal.setStatus(AppraisalStatus.COMPLETED);

        return appraisalRepository.save(appraisal);
    }
}
