package com.nextgen.erp.mrp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

/** Runs the configured Flyway migration and exits without starting a long-lived API process. */
@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "mrp.migration-only", havingValue = "true")
public class MigrationOnlyRunner implements CommandLineRunner {

    private final ConfigurableApplicationContext context;

    public MigrationOnlyRunner(ConfigurableApplicationContext context) {
        this.context = context;
    }

    @Override
    public void run(String... args) {
        int exitCode = SpringApplication.exit(context, () -> 0);
        System.exit(exitCode);
    }
}
