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
  paymentTermsTemplate?: string;
  termsAndConditions?: string;
  notes?: string;
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
