package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum WarehouseType {
    STORES("Stores"),
    WORK_IN_PROGRESS("Work In Progress"),
    FINISHED_GOODS("Finished Goods"),
    QUARANTINE("Quarantine"),
    TRANSIT("Transit"),
    SCRAP("Scrap");

    private final String label;

    WarehouseType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static WarehouseType fromString(String value) {
        if (value == null) return STORES;
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (WarehouseType type : values()) {
            if (type.name().equalsIgnoreCase(normalized) || type.label.equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        return STORES;
    }

    @Converter(autoApply = true)
    public static class WarehouseTypeConverter implements AttributeConverter<WarehouseType, String> {
        @Override
        public String convertToDatabaseColumn(WarehouseType attribute) {
            return attribute != null ? attribute.name() : "STORES";
        }

        @Override
        public WarehouseType convertToEntityAttribute(String dbData) {
            return WarehouseType.fromString(dbData);
        }
    }
}
