package com.nextgen.erp.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NextGenCrmApplication {
    public static void main(String[] args) {
        SpringApplication.run(NextGenCrmApplication.class, args);
    }
}
