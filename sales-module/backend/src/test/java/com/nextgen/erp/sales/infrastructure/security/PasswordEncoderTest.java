package com.nextgen.erp.sales.infrastructure.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordEncoderTest {

    @Test
    void testBcryptEncoding() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminHash = encoder.encode("Admin@2026!");
        String managerHash = encoder.encode("Manager@2026!");
        String repHash = encoder.encode("Rep@2026!");

        System.out.println("HASH_ADMIN: " + adminHash);
        System.out.println("HASH_MANAGER: " + managerHash);
        System.out.println("HASH_REP: " + repHash);

        assertTrue(encoder.matches("Admin@2026!", adminHash));
        assertTrue(encoder.matches("Manager@2026!", managerHash));
        assertTrue(encoder.matches("Rep@2026!", repHash));
    }
}
