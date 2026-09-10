package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum StockEntryPurpose {
    MATERIAL_RECEIPT("Material Receipt"),
    MATERIAL_ISSUE("Material Issue"),
    MATERIAL_TRANSFER("Material Transfer"),
    MATERIAL_TRANSFER_FOR_MANUFACTURE("Material Transfer for Manufacture"),
    MANUFACTURE("Manufacture"),
    REPACK("Repack"),
    SEND_TO_SUBCONTRACTOR("Send to Subcontractor");

    private final String label;

    StockEntryPurpose(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static StockEntryPurpose fromString(String value) {
        if (value == null) return MATERIAL_RECEIPT;
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (StockEntryPurpose p : values()) {
            if (p.name().equalsIgnoreCase(normalized) || p.label.equalsIgnoreCase(value.trim())) {
                return p;
            }
        }
        return MATERIAL_RECEIPT;
    }

    @Converter(autoApply = true)
    public static class StockEntryPurposeConverter implements AttributeConverter<StockEntryPurpose, String> {
        @Override
        public String convertToDatabaseColumn(StockEntryPurpose attribute) {
            return attribute != null ? attribute.name() : "MATERIAL_RECEIPT";
        }

        @Override
        public StockEntryPurpose convertToEntityAttribute(String dbData) {
            return StockEntryPurpose.fromString(dbData);
        }
    }
}
