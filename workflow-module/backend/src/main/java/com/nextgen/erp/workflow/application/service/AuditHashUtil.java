package com.nextgen.erp.workflow.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

public class AuditHashUtil {

    public static String calculateHash(UUID documentId, String actionName, String performedBy, String previousHash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String rawData = String.format("%s|%s|%s|%s",
                    documentId != null ? documentId.toString() : "",
                    actionName != null ? actionName : "",
                    performedBy != null ? performedBy : "",
                    previousHash != null ? previousHash : "GENESIS_HASH");
            byte[] encodedHash = digest.digest(rawData.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
