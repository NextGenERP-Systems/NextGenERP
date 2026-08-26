package com.nextgen.erp.sales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class NextGenSalesApplication {

    public static void main(String[] args) {
        SpringApplication.run(NextGenSalesApplication.class, args);
    }
}
