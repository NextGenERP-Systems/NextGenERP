package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.Bom;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BomService {

    private final BomRepository bomRepository;

    @Transactional(readOnly = true)
    public List<Bom> getAllBoms() {
        return bomRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Bom getBomByNo(String bomNo) {
        return bomRepository.findById(bomNo)
                .orElseThrow(() -> new IllegalArgumentException("BOM not found with No: " + bomNo));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> explodeBomViaCte(String bomNo) {
        return bomRepository.explodeBomWithCte(bomNo);
    }

    @Transactional
    public int replaceItemInAllBoms(String currentItemCode, String newItemCode, String newItemName, BigDecimal newRate) {
        List<Bom> boms = bomRepository.findAll();
        int count = 0;
        for (Bom bom : boms) {
            boolean updated = false;
            for (var item : bom.getItems()) {
                if (item.getItemCode().equals(currentItemCode)) {
                    item.setItemCode(newItemCode);
                    item.setItemName(newItemName);
                    if (newRate != null) {
                        item.setStandardRate(newRate);
                        item.setAmount(newRate.multiply(item.getQty()));
                    }
                    updated = true;
                }
            }
            if (updated) {
                bom.setRevisionNumber(bom.getRevisionNumber() + 1);
                bomRepository.save(bom);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public Bom saveBom(Bom bom) {
        if (bom.getRevisionNumber() == null) {
            bom.setRevisionNumber(1);
        }
        return bomRepository.save(bom);
    }
}
