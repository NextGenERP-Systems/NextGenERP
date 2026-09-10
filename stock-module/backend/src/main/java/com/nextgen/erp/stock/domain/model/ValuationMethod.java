package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum ValuationMethod {
    FIFO("FIFO"),
    MOVING_AVERAGE("Moving Average");

    private final String label;

    ValuationMethod(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ValuationMethod fromString(String value) {
        if (value == null) return FIFO;
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (ValuationMethod method : values()) {
            if (method.name().equalsIgnoreCase(normalized) || method.label.equalsIgnoreCase(value.trim())) {
                return method;
            }
        }
        return FIFO;
    }

    @Converter(autoApply = true)
    public static class ValuationMethodConverter implements AttributeConverter<ValuationMethod, String> {
        @Override
        public String convertToDatabaseColumn(ValuationMethod attribute) {
            return attribute != null ? attribute.name() : "FIFO";
        }

        @Override
        public ValuationMethod convertToEntityAttribute(String dbData) {
            return ValuationMethod.fromString(dbData);
        }
    }
}
