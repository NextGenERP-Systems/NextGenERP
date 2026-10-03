package com.nextgen.erp.crm.dto;
import java.util.List;
public record CrmPageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages, boolean first, boolean last) {
 public static <T> CrmPageResponse<T> from(org.springframework.data.domain.Page<T> p){return new CrmPageResponse<>(p.getContent(),p.getNumber(),p.getSize(),p.getTotalElements(),p.getTotalPages(),p.isFirst(),p.isLast());}
}
