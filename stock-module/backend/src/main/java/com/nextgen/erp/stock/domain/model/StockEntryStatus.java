package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum StockEntryStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    CANCELLED("Cancelled");

    private final String label;

    StockEntryStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static StockEntryStatus fromString(String value) {
        if (value == null) return DRAFT;
        String normalized = value.trim().toUpperCase();
        for (StockEntryStatus s : values()) {
            if (s.name().equalsIgnoreCase(normalized) || s.label.equalsIgnoreCase(value.trim())) {
                return s;
            }
        }
        return DRAFT;
    }

    @Converter(autoApply = true)
    public static class StockEntryStatusConverter implements AttributeConverter<StockEntryStatus, String> {
        @Override
        public String convertToDatabaseColumn(StockEntryStatus attribute) {
            return attribute != null ? attribute.name() : "DRAFT";
        }

        @Override
        public StockEntryStatus convertToEntityAttribute(String dbData) {
            return StockEntryStatus.fromString(dbData);
        }
    }
}
