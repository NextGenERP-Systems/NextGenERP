-- Reporting indexes over existing CRM-owned tables only.
CREATE INDEX idx_crm_leads_created_owner ON crm_leads(created_at, assigned_to);
CREATE INDEX idx_crm_opportunities_created_owner ON crm_opportunities(created_at, assigned_to);
CREATE INDEX idx_crm_opportunities_updated_status ON crm_opportunities(updated_at, status);
CREATE INDEX idx_crm_campaign_costs_date_campaign_currency ON crm_campaign_costs(cost_date, campaign_id, currency);
CREATE INDEX idx_crm_campaign_touchpoints_campaign_occurred ON crm_campaign_touchpoints(campaign_id, occurred_at, id);
CREATE INDEX idx_crm_campaign_attribution_linked ON crm_campaign_attribution_links(linked_at, touchpoint_id);
CREATE INDEX idx_crm_contracts_created_currency ON crm_contracts(created_at, currency);
CREATE INDEX idx_crm_fulfilments_created ON crm_fulfilments(created_at, contract_id);
CREATE INDEX idx_crm_warranty_claims_created ON crm_warranty_claims(created_at, customer_id);
