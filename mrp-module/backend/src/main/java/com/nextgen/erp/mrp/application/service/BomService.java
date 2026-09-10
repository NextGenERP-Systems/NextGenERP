package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.Bom;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
