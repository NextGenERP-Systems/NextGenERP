package com.nextgen.erp.sales.infrastructure.security;

import com.nextgen.erp.sales.domain.model.User;
import com.nextgen.erp.sales.domain.model.UserRole;
import com.nextgen.erp.sales.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin", "admin@nextgen.erp", "Admin@2026!", "System Administrator", UserRole.ROLE_ADMIN);
        seedUser("manager", "manager@nextgen.erp", "Manager@2026!", "Sales Manager", UserRole.ROLE_SALES_MANAGER);
        seedUser("salesrep", "rep@nextgen.erp", "Rep@2026!", "Senior Sales Representative", UserRole.ROLE_SALES_USER);
    }

    private void seedUser(String username, String email, String rawPassword, String fullName, UserRole role) {
        if (!userRepository.existsByUsername(username) && !userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .role(role)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded default user: {} ({}) with role {}", username, email, role);
        }
    }
}
