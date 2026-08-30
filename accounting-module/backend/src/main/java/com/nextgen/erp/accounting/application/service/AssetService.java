package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.Asset;
import com.nextgen.erp.accounting.infrastructure.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    @Transactional(readOnly = true)
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Asset> getAssetById(UUID id) {
        return assetRepository.findById(id);
    }

    @Transactional
    public Asset createAsset(Asset asset) {
        if (asset.getAssetCode() == null || asset.getAssetCode().isBlank()) {
            asset.setAssetCode("AST-" + (assetRepository.count() + 101));
        }
        if (asset.getGrossPurchaseAmount() == null) {
            asset.setGrossPurchaseAmount(BigDecimal.ZERO);
        }
        if (asset.getAccumulatedDepreciation() == null) {
            asset.setAccumulatedDepreciation(BigDecimal.ZERO);
        }
        asset.setNetBookValue(asset.getGrossPurchaseAmount().subtract(asset.getAccumulatedDepreciation()));
        return assetRepository.save(asset);
    }

    @Transactional
    public Asset runDepreciation(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + id));

        int lifeYears = asset.getUsefulLifeYears() != null && asset.getUsefulLifeYears() > 0 ? asset.getUsefulLifeYears() : 3;
        BigDecimal annualDep = asset.getGrossPurchaseAmount().divide(BigDecimal.valueOf(lifeYears), 2, RoundingMode.HALF_UP);
        BigDecimal monthlyDep = annualDep.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        BigDecimal currentAcc = asset.getAccumulatedDepreciation() != null ? asset.getAccumulatedDepreciation() : BigDecimal.ZERO;
        BigDecimal newAcc = currentAcc.add(monthlyDep);

        if (newAcc.compareTo(asset.getGrossPurchaseAmount()) > 0) {
            newAcc = asset.getGrossPurchaseAmount();
            asset.setStatus("FULLY_DEPRECIATED");
        }

        asset.setAccumulatedDepreciation(newAcc);
        asset.setNetBookValue(asset.getGrossPurchaseAmount().subtract(newAcc));
        return assetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(UUID id) {
        assetRepository.deleteById(id);
    }
}
