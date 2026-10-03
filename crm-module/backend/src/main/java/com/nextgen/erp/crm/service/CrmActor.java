package com.nextgen.erp.crm.service;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
@Component
final class CrmActor {
 UUID currentUserId() {
  if(!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) return null;
  var principal=attrs.getRequest().getUserPrincipal();
  if(principal==null) return null;
  try { return UUID.fromString(principal.getName()); } catch(IllegalArgumentException ignored) { return null; }
 }
}
