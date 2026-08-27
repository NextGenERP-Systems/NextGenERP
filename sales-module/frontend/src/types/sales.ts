export type CustomerType = 'COMPANY' | 'INDIVIDUAL' | 'PARTNERSHIP';
export type QuotationStatus = 'DRAFT' | 'OPEN' | 'REPLIED' | 'PARTIALLY_ORDERED' | 'ORDERED' | 'LOST' | 'CANCELLED' | 'EXPIRED';
export type SalesOrderStatus = 'DRAFT' | 'ON_HOLD' | 'TO_DELIVER_AND_BILL' | 'TO_DELIVER' | 'TO_BILL' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
export type DeliveryStatus = 'NOT_DELIVERED' | 'FULLY_DELIVERED' | 'PARTLY_DELIVERED' | 'CLOSED' | 'NOT_APPLICABLE';
export type BillingStatus = 'NOT_BILLED' | 'FULLY_BILLED' | 'PARTLY_BILLED' | 'CLOSED';
export type TaxChargeType = 'ON_NET_TOTAL' | 'ACTUAL' | 'ON_PREVIOUS_ROW_TOTAL';
export type DiscountApplyOn = 'GRAND_TOTAL' | 'NET_TOTAL';
export type OrderType = 'SALES' | 'MAINTENANCE' | 'SHOPPING_CART';

export interface CustomerAddress {
  id?: string;
  addressTitle: string;
  addressType: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  pincode?: string;
  isPrimaryAddress?: boolean;
  isShippingAddress?: boolean;
}

export interface CustomerContact {
  id?: string;
  firstName: string;
  lastName?: string;
  emailId?: string;
  mobileNo?: string;
  designation?: string;
  isPrimaryContact?: boolean;
}

export interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  customerType: CustomerType;
  customerGroupId?: string;
  customerGroupName?: string;
  territoryId?: string;
  territoryName?: string;
  defaultCurrency: string;
  taxId?: string;
  taxCategory?: string;
  defaultReceivableAccount?: string;
  paymentTerms?: string;
  defaultSalesPartner?: string;
  defaultCommissionRate?: number;
  isInternalCustomer?: boolean;
  representsCompany?: string;
  soRequired?: boolean;
  dnRequired?: boolean;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  bypassCreditLimitCheck: boolean;
  isFrozen?: boolean;
  disabled?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  addresses?: CustomerAddress[];
  contacts?: CustomerContact[];
  createdAt?: string;
}

export interface Customer360Dashboard {
  customer: Customer;
  totalQuotationsCount: number;
  totalQuotationsValue: number;
  totalSalesOrdersCount: number;
  totalSalesOrdersValue: number;
  totalDeliveryNotesCount: number;
  totalDeliveredQty: number;
  totalInvoicesCount: number;
  totalInvoicedValue: number;
  totalPaidValue: number;
  totalOutstandingValue: number;
  totalPaymentsCount: number;
  totalCollectedAmount: number;
  recentQuotations: Quotation[];
  recentSalesOrders: SalesOrder[];
  recentDeliveryNotes: DeliveryNote[];
  recentSalesInvoices: SalesInvoice[];
  recentPaymentEntries: PaymentEntry[];
  customerLedger: GlEntry[];
}

export type BlanketOrderStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface BlanketOrderItem {
  id?: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
  orderedQty: number;
  remainingQty: number;
}

export interface BlanketOrder {
  id: string;
  blanketOrderNumber: string;
  customerId: string;
  customerName: string;
  fromDate: string;
  toDate: string;
  company?: string;
  status: BlanketOrderStatus;
  termsAndConditions?: string;
  items: BlanketOrderItem[];
  createdAt?: string;
}

export interface SalesPartner {
  id: string;
  partnerName: string;
  partnerType: string;
  commissionRate: number;
  currency: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  territory?: string;
  totalAllocatedAmount: number;
  totalCommissionEarned: number;
  disabled?: boolean;
  createdAt?: string;
}

export interface SalesPerson {
  id: string;
  salesPersonName: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  parentSalesPerson?: string;
  commissionRate: number;
  targetAmount: number;
  allocatedAmount: number;
  incentivesEarned: number;
  disabled?: boolean;
  createdAt?: string;
}

export interface CatalogItem {
  id: string;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  stockUom: string;
  isStockItem: boolean;
  isSalesItem: boolean;
  standardRate: number;
  valuationRate: number;
  maxDiscount: number;
}

export interface SalesTaxAndCharge {
  id?: string;
  idx: number;
  chargeType: TaxChargeType;
  rowId?: number;
  accountHead: string;
  description?: string;
  rate: number;
  taxAmount: number;
  total: number;
  baseTaxAmount?: number;
  baseTotal?: number;
}

export interface SalesTeamMember {
  id?: string;
  salesPersonName: string;
  allocatedPercentage: number;
  allocatedAmount: number;
  commissionRate: number;
  incentives: number;
}

export interface QuotationItem {
  id?: string;
  idx: number;
  itemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  qty: number;
  uom: string;
  priceListRate: number;
  discountPercentage: number;
  discountAmount: number;
  rate: number;
  amount: number;
  netRate: number;
  netAmount: number;
  valuationRate?: number;
  grossProfit?: number;
  orderedQty?: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  transactionDate: string;
  validTill?: string;
  customerId: string;
  customerName: string;
  orderType: OrderType;
  status: QuotationStatus;
  currency: string;
  conversionRate: number;
  totalQty: number;
  netTotal: number;
  baseNetTotal: number;
  totalTaxesAndCharges: number;
  discountAmount: number;
  additionalDiscountPercentage: number;
  applyDiscountOn: DiscountApplyOn;
  grandTotal: number;
  baseGrandTotal: number;
  roundedTotal?: number;
  baseRoundedTotal?: number;
  inWords?: string;
  paymentTermsTemplate?: string;
  termsAndConditions?: string;
  notes?: string;
  opportunityId?: string;
  lostReason?: string;
  competitorName?: string;
  items: QuotationItem[];
  taxes: SalesTaxAndCharge[];
  createdAt?: string;
}

export interface SalesOrderItem {
  id?: string;
  idx: number;
  itemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  warehouse: string;
  deliveryDate: string;
  qty: number;
  uom: string;
  priceListRate: number;
  discountPercentage: number;
  discountAmount: number;
  rate: number;
  amount: number;
  netRate: number;
  netAmount: number;
  valuationRate?: number;
  grossProfit?: number;
  deliveredQty: number;
  billedAmt: number;
  pickedQty: number;
  deliveredBySupplier?: boolean;
  grantCommission?: boolean;
}

export interface StockReservation {
  id: string;
  salesOrderItemId: string;
  itemCode: string;
  warehouse: string;
  reservedQty: number;
  deliveredQty: number;
  status: string;
  createdAt?: string;
}

export interface PaymentSchedule {
  id?: string;
  paymentTerm: string;
  dueDate: string;
  invoicePortion: number;
  paymentAmount: number;
  outstanding: number;
  paidAmount: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  transactionDate: string;
  deliveryDate: string;
  poNo?: string;
  poDate?: string;
  customerId: string;
  customerName: string;
  orderType: OrderType;
  status: SalesOrderStatus;
  deliveryStatus: DeliveryStatus;
  billingStatus: BillingStatus;
  quotationId?: string;
  currency: string;
  conversionRate: number;
  totalQty: number;
  netTotal: number;
  baseNetTotal: number;
  totalTaxesAndCharges: number;
  discountAmount: number;
  additionalDiscountPercentage: number;
  applyDiscountOn: DiscountApplyOn;
  grandTotal: number;
  baseGrandTotal: number;
  roundedTotal?: number;
  baseRoundedTotal?: number;
  inWords?: string;
  advancePaid: number;
  perDelivered: number;
  perBilled: number;
  perPicked: number;
  reserveStock: boolean;
  skipDeliveryNote: boolean;
  paymentTermsTemplate?: string;
  termsAndConditions?: string;
  amountEligibleForCommission: number;
  commissionRate: number;
  totalCommission: number;
  items: SalesOrderItem[];
  taxes: SalesTaxAndCharge[];
  salesTeam?: SalesTeamMember[];
  paymentSchedules?: PaymentSchedule[];
  stockReservations?: StockReservation[];
  createdAt?: string;
  submittedAt?: string;
}

export interface SalesAnalyticsSummary {
  totalConfirmedRevenue: number;
  totalSalesOrders: number;
  pendingFulfillmentOrders: number;
  openQuotations: number;
  averageOrderValue: number;
  totalPipelineValue: number;
  monthlyTrends: { month: string; revenue: number; orderCount: number }[];
  topCustomers: { customerName: string; totalRevenue: number; ordersCount: number }[];
  salesTeamPerformance: { salesPersonName: string; totalSales: number; incentivesEarned: number }[];
}

// --- CRM & Pre-Sales ---
export type LeadStatus = 'OPEN' | 'CONTACTED' | 'QUALIFIED' | 'LOST';
export type OpportunityStatus = 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  leadName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  leadSource?: string;
  territoryId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  opportunityFrom: 'LEAD' | 'CUSTOMER';
  partyId?: string;
  partyName: string;
  opportunityType: string;
  status: OpportunityStatus;
  dealSize: number;
  probability: number;
  expectedClosingDate?: string;
  salesStage: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Fulfilment & Delivery Notes ---
export type DeliveryNoteStatus = 'DRAFT' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';

export interface DeliveryNoteItem {
  id?: string;
  salesOrderItemId?: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
  warehouse?: string;
}

export interface DeliveryNote {
  id: string;
  deliveryNoteNumber: string;
  salesOrderId?: string;
  customerId: string;
  customerName: string;
  postingDate: string;
  status: DeliveryNoteStatus;
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: string;
  totalQty: number;
  totalAmount: number;
  inWords?: string;
  notes?: string;
  items: DeliveryNoteItem[];
  createdAt?: string;
  updatedAt?: string;
}

// --- Billing & Sales Invoices ---
export type SalesInvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface SalesInvoiceItem {
  id?: string;
  salesOrderItemId?: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
  amount: number;
  incomeAccount?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  deliveryNoteId?: string;
  customerId: string;
  customerName: string;
  postingDate: string;
  dueDate: string;
  status: SalesInvoiceStatus;
  currency: string;
  conversionRate?: number;
  netTotal: number;
  totalTax: number;
  grandTotal: number;
  roundedTotal?: number;
  inWords?: string;
  paidAmount: number;
  outstandingAmount: number;
  paymentTerms?: string;
  notes?: string;
  items: SalesInvoiceItem[];
  taxes?: SalesTaxAndCharge[];
  createdAt?: string;
  updatedAt?: string;
}

// --- Payment Entries ---
export type PaymentType = 'RECEIVE' | 'PAY';
export type PaymentMode = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHEQUE' | 'CASH' | 'UPI';

export interface PaymentEntry {
  id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  status?: 'DRAFT' | 'SUBMITTED' | 'CANCELLED';
  customerId: string;
  customerName: string;
  salesInvoiceId?: string;
  salesOrderId?: string;
  postingDate: string;
  paidAmount: number;
  inWords?: string;
  referenceNo?: string;
  referenceDate?: string;
  notes?: string;
  createdAt?: string;
}

// --- Pricing Rules & Coupons ---
export type PricingRuleApplyOn = 'ITEM_CODE' | 'ITEM_GROUP' | 'CUSTOMER' | 'CUSTOMER_GROUP';
export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface PricingRule {
  id: string;
  title: string;
  applyOn: PricingRuleApplyOn;
  applyKeyId: string;
  minQty: number;
  discountPercentage: number;
  discountAmount: number;
  isFreeItem: boolean;
  freeItemCode?: string;
  freeQty?: number;
  validFrom?: string;
  validUpto?: string;
  active: boolean;
  createdAt?: string;
}

export interface CouponCode {
  id: string;
  couponName: string;
  couponCode: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  validUpto?: string;
  usedCount: number;
  maxUses: number;
  active: boolean;
  createdAt?: string;
}

// --- Comprehensive Reports ---
export interface SalesOrderAnalysisReport {
  orderId: string;
  orderNumber: string;
  transactionDate: string;
  customerName: string;
  status: string;
  grandTotal: number;
  deliveredPercentage: number;
  billedPercentage: number;
  deliveredAmount: number;
  billedAmount: number;
  pendingDeliveryAmount: number;
  pendingBillingAmount: number;
  deliveryStatus: string;
  billingStatus: string;
}

export interface CustomerCreditAgingReport {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerGroup: string;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  currentDue: number;
  overdue31to60: number;
  overdue61to90: number;
  overdueAbove90: number;
  creditExceeded: boolean;
}

export interface QuotationWinLossReport {
  totalQuotations: number;
  wonQuotations: number;
  lostQuotations: number;
  openQuotations: number;
  expiredQuotations: number;
  winRatePercentage: number;
  totalPipelineValue: number;
  wonValue: number;
  lostValue: number;
  lostReasonsCount: Record<string, number>;
  lostReasonsValue: Record<string, number>;
}

export interface ItemSalesHistoryReport {
  itemId: string;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  totalQtyOrdered: number;
  totalQtyDelivered: number;
  totalQtyBilled: number;
  totalSalesRevenue: number;
  averageSellingRate: number;
}

export interface SalesTrendsReport {
  period: string;
  salesOrdersCount: number;
  confirmedRevenue: number;
  quotationsCount: number;
  quotationValue: number;
  winConversionRate: number;
}

export interface CustomerAcquisitionReport {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerGroup: string;
  territory: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrdersCount: number;
  lifetimeValue: number;
  loyaltySegment: string;
}

export interface GlEntry {
  id: string;
  postingDate: string;
  voucherType: string;
  voucherNo: string;
  voucherId?: string;
  account: string;
  debit: number;
  credit: number;
  customerId?: string;
  customerName?: string;
  remarks?: string;
  cancelled: boolean;
  createdAt?: string;
}

export interface QuotationTrendsReport {
  period: string;
  totalQuotations: number;
  orderedQuotations: number;
  lostQuotations: number;
  expiredQuotations: number;
  totalQuotationValue: number;
  wonQuotationValue: number;
  conversionRatePercentage: number;
  avgTurnaroundDays: number;
}

export interface InactiveCustomerReport {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerGroup: string;
  territory: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  totalHistoricalOrders: number;
  lifetimeRevenue: number;
  churnRiskLevel: string;
}

export interface SalesCommissionSummary {
  salesPersonName: string;
  totalOrdersCount: number;
  totalAllocatedAmount: number;
  avgCommissionRate: number;
  totalCommissionEarned: number;
  totalIncentivesEarned: number;
  totalPayout: number;
}


