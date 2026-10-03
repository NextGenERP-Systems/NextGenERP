package com.nextgen.erp.crm.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import java.util.UUID;
import java.time.Duration;
import java.net.http.HttpClient;
import org.springframework.http.client.JdkClientHttpRequestFactory;

@Component
public class SalesCustomerDashboardClient {
    private final RestClient restClient;
    private final String baseUrl;

    public SalesCustomerDashboardClient(RestClient.Builder builder,
            @Value("${sales.service.url:}") String baseUrl) {
        var httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(4));
        this.restClient = builder.requestFactory(requestFactory).build();
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim().replaceAll("/$", "");
    }

    public Result fetch(UUID customerId) {
        if (baseUrl.isBlank()) return new Result("NOT_CONFIGURED", null);
        try {
            JsonNode dashboard = restClient.get()
                    .uri(baseUrl + "/api/v1/customers/{id}/dashboard", customerId)
                    .retrieve().body(JsonNode.class);
            return dashboard == null ? new Result("UNAVAILABLE", null) : new Result("AVAILABLE", dashboard);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound ex) {
            return new Result("NOT_FOUND", null);
        } catch (RestClientException ex) {
            return new Result("UNAVAILABLE", null);
        } catch (IllegalArgumentException ex) {
            return new Result("UNAVAILABLE", null);
        }
    }

    public record Result(String status, JsonNode dashboard) {}
}
