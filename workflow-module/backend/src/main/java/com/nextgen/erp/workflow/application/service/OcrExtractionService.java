package com.nextgen.erp.workflow.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class OcrExtractionService {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(?:total|amount|sum|price|\\$)\\s*:?\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern INVOICE_NO_PATTERN = Pattern.compile("(?:inv|invoice|doc|no|num|#)\\s*:?\\s*([A-Z0-9-]+)", Pattern.CASE_INSENSITIVE);

    public Map<String, Object> extractDataFromText(String rawText) {
        Map<String, Object> extractedData = new HashMap<>();

        if (rawText == null || rawText.isBlank()) {
            return extractedData;
        }

        log.info("Running OCR Data Extraction on text content of length {}...", rawText.length());

        // Extract Amount
        Matcher amountMatcher = AMOUNT_PATTERN.matcher(rawText);
        if (amountMatcher.find()) {
            try {
                double amount = Double.parseDouble(amountMatcher.group(1));
                extractedData.put("amount", amount);
                log.info("OCR extracted amount: {}", amount);
            } catch (NumberFormatException ignored) {}
        }

        // Extract Invoice / Document Number
        Matcher invoiceMatcher = INVOICE_NO_PATTERN.matcher(rawText);
        if (invoiceMatcher.find()) {
            String invNum = invoiceMatcher.group(1);
            extractedData.put("extractedDocumentNumber", invNum);
            log.info("OCR extracted invoice number: {}", invNum);
        }

        extractedData.put("ocrProcessed", true);
        return extractedData;
    }
}
