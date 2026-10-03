package com.nextgen.erp.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service @RequiredArgsConstructor
public class CrmAnalyticsService {
    private static final String VERSION="1.0";
    private final NamedParameterJdbcTemplate db;

    @Transactional(readOnly=true) public Map<String,Object> overview(LocalDate from,LocalDate to,UUID ownerId){
        LocalDate[] period=period(from,to);from=period[0];to=period[1];
        MapSqlParameterSource p=range(from,to).addValue("owner",ownerId);
        Map<String,Object> counts=one("""
            SELECT (SELECT count(*) FROM crm_leads l WHERE l.created_at>=:fromTs AND l.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR l.assigned_to=:owner)) AS leads_created,
                   (SELECT count(*) FROM crm_leads l WHERE l.status='QUALIFIED' AND l.created_at>=:fromTs AND l.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR l.assigned_to=:owner)) AS leads_qualified,
                   (SELECT count(*) FROM crm_opportunities o WHERE o.created_at>=:fromTs AND o.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR o.assigned_to=:owner)) AS opportunities_created,
                   (SELECT count(*) FROM crm_opportunities o WHERE o.status='WON' AND o.created_at>=:fromTs AND o.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR o.assigned_to=:owner)) AS opportunities_won,
                   (SELECT count(*) FROM crm_opportunities o WHERE o.status='LOST' AND o.created_at>=:fromTs AND o.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR o.assigned_to=:owner)) AS opportunities_lost,
                   (SELECT count(*) FROM crm_contracts c WHERE c.created_at>=:fromTs AND c.created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR c.opportunity_id IN (SELECT o.id FROM crm_opportunities o WHERE o.assigned_to=:owner))) AS contracts_created
            """,p);
        List<Map<String,Object>> contractAmounts=db.queryForList("SELECT currency,sum(total_amount) AS amount FROM crm_contracts WHERE created_at>=:fromTs AND created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR opportunity_id IN (SELECT o.id FROM crm_opportunities o WHERE o.assigned_to=:owner)) GROUP BY currency ORDER BY currency",p);
        long leads=num(counts.get("leads_created")),qualified=num(counts.get("leads_qualified")),opps=num(counts.get("opportunities_created")),won=num(counts.get("opportunities_won"));
        return Map.of("definitionVersion",VERSION,"filters",filters(from,to,ownerId),"counts",counts,"rates",Map.of("leadQualificationRate",rate(qualified,leads),"opportunityWinRate",rate(won,opps)),"contractAmountsByCurrency",contractAmounts,"semantics",Map.of("leadQualificationRate","Currently qualified leads in the created-in-range cohort divided by leads created in range.","opportunityWinRate","Currently WON opportunities in the created-in-range cohort divided by opportunities created in range.","contractAmountsByCurrency","Sum of CRM contract snapshots, grouped by recorded currency; not collected revenue."));
    }

    @Transactional(readOnly=true) public Map<String,Object> funnel(LocalDate from,LocalDate to,UUID ownerId){
        LocalDate[] period=period(from,to);from=period[0];to=period[1];
        MapSqlParameterSource p=range(from,to).addValue("owner",ownerId);
        List<Map<String,Object>> lead= db.queryForList("SELECT status,count(*) AS record_count FROM crm_leads WHERE created_at>=:fromTs AND created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR assigned_to=:owner) GROUP BY status ORDER BY status",p);
        List<Map<String,Object>> opp= db.queryForList("SELECT status,count(*) AS record_count,COALESCE(sum(amount),0) AS raw_amount_sum FROM crm_opportunities WHERE created_at>=:fromTs AND created_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR assigned_to=:owner) GROUP BY status ORDER BY status",p);
        return Map.of("definitionVersion",VERSION,"filters",filters(from,to,ownerId),"leadStatuses",lead,"opportunityStatuses",opp,"semantics","Status counts use records created within the selected period. Opportunity amounts are raw CRM values and are not converted across currencies.");
    }

    @Transactional(readOnly=true) public Map<String,Object> pipeline(LocalDate from,LocalDate to,UUID ownerId){
        LocalDate[] period=period(from,to);from=period[0];to=period[1];
        MapSqlParameterSource p=range(from,to).addValue("owner",ownerId);
        List<Map<String,Object>> stages=db.queryForList("""
            SELECT o.sales_stage_id AS stage_id,COALESCE(s.name,'(no stage recorded)') AS stage_name,
                   count(*) AS opportunities,COALESCE(sum(o.amount),0) AS raw_amount_sum,
                   COALESCE(avg(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP-entered.entered_at))/86400.0),0) AS avg_days_in_current_stage
            FROM crm_opportunities o LEFT JOIN crm_sales_stages s ON s.id=o.sales_stage_id
            LEFT JOIN LATERAL (SELECT h.occurred_at AS entered_at FROM crm_opportunity_history h
                WHERE h.opportunity_id=o.id AND h.to_stage_id IS NOT DISTINCT FROM o.sales_stage_id
                  AND (h.event_type IN ('CREATED','BASELINE') OR h.from_stage_id IS DISTINCT FROM h.to_stage_id)
                ORDER BY h.occurred_at DESC,h.id DESC LIMIT 1) entered ON TRUE
            WHERE o.status='OPEN' AND (CAST(:owner AS uuid) IS NULL OR o.assigned_to=:owner)
            GROUP BY o.sales_stage_id,s.name ORDER BY s.name NULLS LAST
            """,p);
        List<Map<String,Object>> outcomes=db.queryForList("SELECT status,count(*) AS opportunities,COALESCE(sum(amount),0) AS raw_amount_sum FROM crm_opportunities WHERE status IN ('WON','LOST') AND updated_at>=:fromTs AND updated_at<:toExclusive AND (CAST(:owner AS uuid) IS NULL OR assigned_to=:owner) GROUP BY status ORDER BY status",p);
        return Map.of("definitionVersion",VERSION,"filters",filters(from,to,ownerId),"stages",stages,"outcomes",outcomes,"amountSemantics","Raw opportunity amount sums are not currency-converted and are not collected revenue.","durationSemantics","The open pipeline is a current snapshot as of request time. Current-stage duration is measured from the latest recorded entry to now; baseline history marks the start of known history, and records without a matching entry do not contribute to the average. The date range applies to the outcome period, not the open pipeline snapshot.");
    }

    @Transactional(readOnly=true) public Map<String,Object> campaigns(LocalDate from,LocalDate to){
        LocalDate[] period=period(from,to);from=period[0];to=period[1];
        MapSqlParameterSource p=range(from,to);
        List<Map<String,Object>> rows=db.queryForList("""
            SELECT c.id AS campaign_id,c.name,c.channel,
                   COALESCE(cost.cost_by_currency,'{}'::jsonb) AS recorded_cost_by_currency,
                   COALESCE(touch.touchpoints,0) AS touchpoints,
                   COALESCE(attr.leads,0) AS attributed_leads,
                   COALESCE(attr.prospects,0) AS attributed_prospects,
                   COALESCE(attr.opportunities,0) AS attributed_opportunities,
                   COALESCE(attr.raw_opportunity_amount,0) AS raw_attributed_opportunity_amount
            FROM crm_campaigns c
            LEFT JOIN (SELECT campaign_id,jsonb_object_agg(currency,total) cost_by_currency FROM (SELECT campaign_id,currency,sum(amount) total FROM crm_campaign_costs WHERE cost_date>=:fromDate AND cost_date<:toDate GROUP BY campaign_id,currency) currency_cost GROUP BY campaign_id) cost ON cost.campaign_id=c.id
            LEFT JOIN (SELECT campaign_id,count(*) touchpoints FROM crm_campaign_touchpoints WHERE occurred_at>=:fromTs AND occurred_at<:toExclusive GROUP BY campaign_id) touch ON touch.campaign_id=c.id
            LEFT JOIN (SELECT t.campaign_id,count(DISTINCT a.lead_id) FILTER(WHERE a.lead_id IS NOT NULL) leads,
                       count(DISTINCT a.prospect_id) FILTER(WHERE a.prospect_id IS NOT NULL) prospects,
                       count(DISTINCT a.opportunity_id) FILTER(WHERE a.opportunity_id IS NOT NULL) opportunities,
                       COALESCE(sum(o.amount),0) raw_opportunity_amount
                       FROM crm_campaign_attribution_links a JOIN crm_campaign_touchpoints t ON t.id=a.touchpoint_id
                       LEFT JOIN crm_opportunities o ON o.id=a.opportunity_id
                       WHERE a.linked_at>=:fromTs AND a.linked_at<:toExclusive GROUP BY t.campaign_id) attr ON attr.campaign_id=c.id
            WHERE cost.campaign_id IS NOT NULL OR touch.campaign_id IS NOT NULL OR attr.campaign_id IS NOT NULL
            ORDER BY c.name,c.id LIMIT 500
            """,p);
        return Map.of("definitionVersion",VERSION,"filters",filters(from,to,null),"campaigns",rows,"semantics",Map.of("attribution","Counts use explicit crm_campaign_attribution_links in the selected period; this endpoint does not infer first-touch or last-touch credit.","cost","Recorded CRM campaign costs; amount currencies are preserved in source rows and are not converted by this summary.","opportunityAmount","Raw amount of explicitly attributed opportunities; not revenue, bookings, or ROI."));
    }

    @Transactional(readOnly=true) public Map<String,Object> service(LocalDate from,LocalDate to,UUID customerId){
        LocalDate[] period=period(from,to);from=period[0];to=period[1];
        MapSqlParameterSource p=range(from,to).addValue("customer",customerId);
        Map<String,Object> result=one("""
            SELECT (SELECT count(*) FROM crm_contracts c WHERE c.created_at>=:fromTs AND c.created_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR c.customer_id=:customer)) contracts_created,
                   (SELECT count(*) FROM crm_fulfilments f JOIN crm_contracts c ON c.id=f.contract_id WHERE f.created_at>=:fromTs AND f.created_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR c.customer_id=:customer)) fulfilments_created,
                   (SELECT count(*) FROM crm_fulfilments f JOIN crm_contracts c ON c.id=f.contract_id WHERE f.status='COMPLETED' AND f.completed_at>=:fromTs AND f.completed_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR c.customer_id=:customer)) fulfilments_completed,
                   (SELECT count(*) FROM crm_warranty_claims w WHERE w.created_at>=:fromTs AND w.created_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR w.customer_id=:customer)) claims_created,
                   (SELECT count(*) FROM crm_warranty_claims w WHERE w.status='RESOLVED' AND w.resolved_at>=:fromTs AND w.resolved_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR w.customer_id=:customer)) claims_resolved,
                   (SELECT count(*) FROM crm_maintenance_visits v JOIN crm_maintenance_schedules s ON s.id=v.schedule_id WHERE v.due_at>=:fromTs AND v.due_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR s.customer_id=:customer)) maintenance_visits_due,
                   (SELECT count(*) FROM crm_maintenance_visits v JOIN crm_maintenance_schedules s ON s.id=v.schedule_id WHERE v.status='COMPLETED' AND v.completed_at>=:fromTs AND v.completed_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR s.customer_id=:customer)) maintenance_visits_completed
            """,p);
        List<Map<String,Object>> amounts=db.queryForList("SELECT currency,sum(total_amount) AS amount FROM crm_contracts WHERE created_at>=:fromTs AND created_at<:toExclusive AND (CAST(:customer AS uuid) IS NULL OR customer_id=:customer) GROUP BY currency ORDER BY currency",p);
        return Map.of("definitionVersion",VERSION,"filters",filters(from,to,customerId),"metrics",result,"contractAmountsByCurrency",amounts,"amountSemantics","Contract amounts are CRM snapshots, grouped by recorded currency; not collected revenue.");
    }

    private MapSqlParameterSource range(LocalDate from,LocalDate to){return new MapSqlParameterSource().addValue("fromTs",from.atStartOfDay(java.time.ZoneOffset.UTC).toOffsetDateTime()).addValue("toExclusive",to.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toOffsetDateTime()).addValue("fromDate",from).addValue("toDate",to.plusDays(1));}
    private static LocalDate[] period(LocalDate from,LocalDate to){LocalDate today=LocalDate.now(java.time.ZoneOffset.UTC),end=to==null?today:to,start=from==null?end.minusDays(364):from;if(end.isAfter(today))throw new IllegalArgumentException("to cannot be in the future");if(end.isBefore(start))throw new IllegalArgumentException("to must be on or after from");if(java.time.temporal.ChronoUnit.DAYS.between(start,end)>3649)throw new IllegalArgumentException("Analytics date range is limited to 10 years");return new LocalDate[]{start,end};}
    private static Map<String,Object> filters(LocalDate from,LocalDate to,UUID id){Map<String,Object> m=new LinkedHashMap<>();m.put("from",from);m.put("to",to);if(id!=null)m.put("scopeId",id);m.put("timezone","UTC");return m;}
    private Map<String,Object> one(String sql,SqlParameterSource p){return db.queryForMap(sql,p);}
    private static long num(Object n){return n==null?0:((Number)n).longValue();}
    private static double rate(long numerator,long denominator){return denominator==0?0.0:(double)numerator/denominator;}
}
