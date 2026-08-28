import {
  Customer,
  Quotation,
  SalesOrder,
  CatalogItem,
  ItemGroup,
  PriceList,
  ItemPrice,
  ProductBundle,
  PromotionalScheme,
  ShippingRule,
  SalesAnalyticsSummary,
  Lead,
  LeadStatus,
  Opportunity,
  OpportunityStatus,
  DeliveryNote,
  SalesInvoice,
  PaymentEntry,
  PricingRule,
  CouponCode,
  SalesOrderAnalysisReport,
  CustomerCreditAgingReport,
  QuotationWinLossReport,
  ItemSalesHistoryReport,
  SalesTrendsReport,
  CustomerAcquisitionReport,
  GlEntry,
  QuotationTrendsReport,
  InactiveCustomerReport,
  SalesCommissionSummary,
  Customer360Dashboard,
  BlanketOrder,
  SalesPartner,
  SalesPerson,
} from "@/types/sales";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Rich Mock Fallback Dataset
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "77777777-7777-7777-7777-777777777701",
    customerCode: "CUST-001",
    customerName: "Apex Global Technologies LLC",
    customerType: "COMPANY",
    customerGroupName: "Commercial Enterprise",
    territoryName: "North America - US East",
    defaultCurrency: "INR",
    creditLimit: 150000.0,
    outstandingBalance: 24500.0,
    availableCredit: 125500.0,
    bypassCreditLimitCheck: false,
    email: "procurement@apexglobal.io",
    phone: "+1 (555) 234-8800",
    website: "https://apexglobal.io",
    addresses: [
      {
        id: "addr-1",
        addressTitle: "Austin HQ",
        addressType: "Billing",
        addressLine1: "500 Congress Avenue, Suite 1400",
        city: "Austin",
        state: "Texas",
        country: "United States",
        pincode: "78701",
        isPrimaryAddress: true,
      },
    ],
    contacts: [
      {
        id: "cnt-1",
        firstName: "Eleanor",
        lastName: "Vance",
        emailId: "e.vance@apexglobal.io",
        mobileNo: "+1-512-555-0199",
        designation: "VP of Procurement",
        isPrimaryContact: true,
      },
    ],
  },
  {
    id: "77777777-7777-7777-7777-777777777702",
    customerCode: "CUST-002",
    customerName: "Vanguard Industrial Robotics Inc",
    customerType: "COMPANY",
    customerGroupName: "Commercial Enterprise",
    territoryName: "North America - US West",
    defaultCurrency: "INR",
    creditLimit: 80000.0,
    outstandingBalance: 12000.0,
    availableCredit: 68000.0,
    bypassCreditLimitCheck: false,
    email: "supplychain@vanguardrobotics.com",
    phone: "+1 (555) 891-3420",
    website: "https://vanguardrobotics.com",
    addresses: [
      {
        id: "addr-2",
        addressTitle: "San Jose Plant",
        addressType: "Billing",
        addressLine1: "220 Innovation Way",
        city: "San Jose",
        state: "California",
        country: "United States",
        pincode: "95134",
        isPrimaryAddress: true,
      },
    ],
    contacts: [
      {
        id: "cnt-2",
        firstName: "Marcus",
        lastName: "Sterling",
        emailId: "m.sterling@vanguardrobotics.com",
        mobileNo: "+1-408-555-0812",
        designation: "Chief Technology Officer",
        isPrimaryContact: true,
      },
    ],
  },
  {
    id: "77777777-7777-7777-7777-777777777703",
    customerCode: "CUST-003",
    customerName: "BlueSky Logistics Corp",
    customerType: "COMPANY",
    customerGroupName: "Small & Medium Business",
    territoryName: "North America - US East",
    defaultCurrency: "INR",
    creditLimit: 50000.0,
    outstandingBalance: 48500.0,
    availableCredit: 1500.0,
    bypassCreditLimitCheck: false,
    email: "accounts@blueskylogistics.net",
    phone: "+1 (555) 431-7711",
  },
  {
    id: "77777777-7777-7777-7777-777777777704",
    customerCode: "CUST-004",
    customerName: "Quantum Health Systems",
    customerType: "COMPANY",
    customerGroupName: "Government & Public Sector",
    territoryName: "Europe - Central",
    defaultCurrency: "INR",
    creditLimit: 200000.0,
    outstandingBalance: 0.0,
    availableCredit: 200000.0,
    bypassCreditLimitCheck: false,
    email: "operations@quantumhealth.org",
    phone: "+44 20 7946 0192",
  },
];

const MOCK_ITEMS: CatalogItem[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    itemCode: "ERP-CLOUD-ENT",
    itemName: "NextGen Cloud ERP Enterprise License",
    itemGroup: "Software Licenses",
    stockUom: "Nos",
    isStockItem: false,
    isSalesItem: true,
    standardRate: 12000.0,
    valuationRate: 2000.0,
    maxDiscount: 25.0,
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    itemCode: "ERP-IMPL-SERV",
    itemName: "ERP Implementation & Migration Services",
    itemGroup: "Services",
    stockUom: "Hours",
    isStockItem: false,
    isSalesItem: true,
    standardRate: 150.0,
    valuationRate: 50.0,
    maxDiscount: 15.0,
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    itemCode: "SRV-RACK-2U",
    itemName: "NextGen Edge Server Appliance 2U",
    itemGroup: "Hardware",
    stockUom: "Nos",
    isStockItem: true,
    isSalesItem: true,
    standardRate: 4500.0,
    valuationRate: 2800.0,
    maxDiscount: 10.0,
  },
  {
    id: "44444444-4444-4444-4444-444444444404",
    itemCode: "IOT-GW-IND",
    itemName: "Industrial IoT Telemetry Gateway",
    itemGroup: "Hardware",
    stockUom: "Nos",
    isStockItem: true,
    isSalesItem: true,
    standardRate: 850.0,
    valuationRate: 480.0,
    maxDiscount: 12.0,
  },
  {
    id: "44444444-4444-4444-4444-444444444405",
    itemCode: "SUP-SLA-247",
    itemName: "24/7 Enterprise Platinum Support",
    itemGroup: "Service SLA",
    stockUom: "Years",
    isStockItem: false,
    isSalesItem: true,
    standardRate: 6000.0,
    valuationRate: 1000.0,
    maxDiscount: 20.0,
    brand: "NextGen Cloud",
    description: "24/7 Enterprise Platinum level technical support SLA.",
    isPurchaseItem: false,
    defaultWarehouse: "Stores - NC",
    defaultIncomeAccount: "4110 - Service Revenue",
    defaultExpenseAccount: "5110 - Cost of Goods Sold",
  },
];

const MOCK_ITEM_GROUPS: ItemGroup[] = [
  { id: "ig-1", itemGroupName: "All Item Groups", parentItemGroup: "", isGroup: true, description: "Root group for all items", itemCount: 28 },
  { id: "ig-2", itemGroupName: "Products", parentItemGroup: "All Item Groups", isGroup: true, description: "All finished physical and digital products", itemCount: 18 },
  { id: "ig-3", itemGroupName: "Hardware", parentItemGroup: "Products", isGroup: false, description: "Servers, racks, switches, IoT gateways", itemCount: 8 },
  { id: "ig-4", itemGroupName: "Software Licenses", parentItemGroup: "Products", isGroup: false, description: "Cloud ERP, SaaS, On-prem licenses", itemCount: 6 },
  { id: "ig-5", itemGroupName: "Networking", parentItemGroup: "Hardware", isGroup: false, description: "Switches, routers, transceivers", itemCount: 4 },
  { id: "ig-6", itemGroupName: "Services", parentItemGroup: "All Item Groups", isGroup: true, description: "Professional implementation and support services", itemCount: 7 },
  { id: "ig-7", itemGroupName: "Service SLA", parentItemGroup: "Services", isGroup: false, description: "Support level agreements", itemCount: 3 },
  { id: "ig-8", itemGroupName: "Consumables", parentItemGroup: "All Item Groups", isGroup: false, description: "Cables, packaging, accessories", itemCount: 3 },
];

const MOCK_PRICE_LISTS: PriceList[] = [
  { id: "pl-1", priceListName: "Standard Selling", currency: "INR", buying: false, selling: true, enabled: true, country: "India" },
  { id: "pl-2", priceListName: "Wholesale Partner List", currency: "INR", buying: false, selling: true, enabled: true, country: "India" },
  { id: "pl-3", priceListName: "Export International USD", currency: "USD", buying: false, selling: true, enabled: true, country: "Global" },
  { id: "pl-4", priceListName: "Europe Euro Tier", currency: "EUR", buying: false, selling: true, enabled: true, country: "European Union" },
  { id: "pl-5", priceListName: "Standard Buying", currency: "INR", buying: true, selling: false, enabled: true, country: "India" },
];

const MOCK_ITEM_PRICES: ItemPrice[] = [
  { id: "ip-1", itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", priceListName: "Standard Selling", priceListRate: 12000.0, currency: "INR", minQty: 1 },
  { id: "ip-2", itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", priceListName: "Wholesale Partner List", priceListRate: 9800.0, currency: "INR", minQty: 5 },
  { id: "ip-3", itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", priceListName: "Export International USD", priceListRate: 150.0, currency: "USD", minQty: 1 },
  { id: "ip-4", itemCode: "SRV-RACK-2U", itemName: "NextGen Edge Server Appliance 2U", priceListName: "Standard Selling", priceListRate: 4500.0, currency: "INR", minQty: 1 },
  { id: "ip-5", itemCode: "SRV-RACK-2U", itemName: "NextGen Edge Server Appliance 2U", priceListName: "Wholesale Partner List", priceListRate: 3900.0, currency: "INR", minQty: 2 },
  { id: "ip-6", itemCode: "IOT-GW-IND", itemName: "Industrial IoT Telemetry Gateway", priceListName: "Standard Selling", priceListRate: 850.0, currency: "INR", minQty: 1 },
  { id: "ip-7", itemCode: "SUP-SLA-247", itemName: "24/7 Enterprise Platinum Support", priceListName: "Standard Selling", priceListRate: 6000.0, currency: "INR", minQty: 1 },
];

const MOCK_PRODUCT_BUNDLES: ProductBundle[] = [
  {
    id: "pb-1",
    newItemCode: "BDL-DC-EXP",
    bundleName: "Data Center Rapid Deployment Bundle",
    description: "Complete turnkey rack server, networking switches, and enterprise SaaS license pack.",
    disabled: false,
    totalRate: 23350.0,
    items: [
      { itemCode: "SRV-RACK-2U", itemName: "NextGen Edge Server Appliance 2U", qty: 2, uom: "Nos", rate: 4500.0 },
      { itemCode: "IOT-GW-IND", itemName: "Industrial IoT Telemetry Gateway", qty: 3, uom: "Nos", rate: 850.0 },
      { itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", qty: 1, uom: "Nos", rate: 12000.0 },
    ],
  },
  {
    id: "pb-2",
    newItemCode: "BDL-STARTER",
    bundleName: "SMB Digital Transformation Starter Kit",
    description: "Starter bundle with 100 hrs implementation and 1-year enterprise license.",
    disabled: false,
    totalRate: 27000.0,
    items: [
      { itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", qty: 1, uom: "Nos", rate: 12000.0 },
      { itemCode: "ERP-IMPL-SERV", itemName: "ERP Implementation & Migration Services", qty: 100, uom: "Hours", rate: 150.0 },
    ],
  },
];

const MOCK_PROMOTIONAL_SCHEMES: PromotionalScheme[] = [
  {
    id: "ps-1",
    name: "Enterprise Q3 Volume Rebate Scheme",
    applyOn: "Item Group",
    applyKeyId: "Hardware",
    validFrom: "2026-07-01",
    validUpto: "2026-09-30",
    minQty: 5,
    discountPercentage: 15.0,
    description: "Automatic 15% discount on bulk hardware orders exceeding 5 units.",
    disabled: false,
  },
  {
    id: "ps-2",
    name: "Cloud SaaS License Multi-Year Tier",
    applyOn: "Item Code",
    applyKeyId: "ERP-CLOUD-ENT",
    validFrom: "2026-01-01",
    validUpto: "2026-12-31",
    minQty: 3,
    discountPercentage: 20.0,
    description: "20% discount on 3 or more Enterprise ERP user licenses.",
    disabled: false,
  },
];

const MOCK_SHIPPING_RULES: ShippingRule[] = [
  {
    id: "sr-1",
    shippingRuleName: "Standard Express Ground Logistics",
    calculateBasedOn: "Net Total",
    shippingAmount: 500.0,
    fromValue: 0.0,
    toValue: 50000.0,
    costCenter: "Main - NC",
    disabled: false,
  },
  {
    id: "sr-2",
    shippingRuleName: "Free High-Volume Commercial Freight",
    calculateBasedOn: "Net Total",
    shippingAmount: 0.0,
    fromValue: 50000.0,
    toValue: 10000000.0,
    costCenter: "Main - NC",
    disabled: false,
  },
  {
    id: "sr-3",
    shippingRuleName: "Heavy Server Weight Freight Slab",
    calculateBasedOn: "Net Weight",
    shippingAmount: 1200.0,
    fromValue: 20.0,
    toValue: 200.0,
    costCenter: "Logistics - NC",
    disabled: false,
  },
];

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: "88888888-8888-8888-8888-888888888801",
    quotationNumber: "SAL-QTN-2026-0001",
    transactionDate: "2026-08-20",
    validTill: "2026-09-20",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    orderType: "SALES",
    status: "OPEN",
    currency: "INR",
    conversionRate: 1.0,
    totalQty: 3.0,
    netTotal: 30000.0,
    baseNetTotal: 30000.0,
    totalTaxesAndCharges: 2475.0,
    discountAmount: 0.0,
    additionalDiscountPercentage: 0.0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: 32475.0,
    baseGrandTotal: 32475.0,
    notes: "Comprehensive Cloud ERP roll-out with Platinum Support package.",
    items: [
      {
        idx: 1,
        itemId: "44444444-4444-4444-4444-444444444401",
        itemCode: "ERP-CLOUD-ENT",
        itemName: "NextGen Cloud ERP Enterprise License",
        qty: 2,
        uom: "Nos",
        priceListRate: 12000.0,
        discountPercentage: 0,
        discountAmount: 0,
        rate: 12000.0,
        amount: 24000.0,
        netRate: 12000.0,
        netAmount: 24000.0,
        grossProfit: 20000.0,
      },
      {
        idx: 2,
        itemId: "44444444-4444-4444-4444-444444444405",
        itemCode: "SUP-SLA-247",
        itemName: "24/7 Enterprise Platinum Support",
        qty: 1,
        uom: "Years",
        priceListRate: 6000.0,
        discountPercentage: 0,
        discountAmount: 0,
        rate: 6000.0,
        amount: 6000.0,
        netRate: 6000.0,
        netAmount: 6000.0,
        grossProfit: 5000.0,
      },
    ],
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "State Sales Tax (6.25%)",
        rate: 6.25,
        taxAmount: 1875.0,
        total: 31875.0,
      },
      {
        idx: 2,
        chargeType: "ON_NET_TOTAL",
        accountHead: "Municipal Surcharge (2.0%)",
        rate: 2.0,
        taxAmount: 600.0,
        total: 32475.0,
      },
    ],
  },
  {
    id: "88888888-8888-8888-8888-888888888802",
    quotationNumber: "SAL-QTN-2026-0002",
    transactionDate: "2026-08-15",
    validTill: "2026-09-15",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    orderType: "SALES",
    status: "ORDERED",
    currency: "INR",
    conversionRate: 1.0,
    totalQty: 22.0,
    netTotal: 18500.0,
    baseNetTotal: 18500.0,
    totalTaxesAndCharges: 1526.25,
    discountAmount: 0.0,
    additionalDiscountPercentage: 0.0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: 20026.25,
    baseGrandTotal: 20026.25,
    items: [],
    taxes: [],
  },
];

const MOCK_ORDERS: SalesOrder[] = [
  {
    id: "99999999-9999-9999-9999-999999999901",
    orderNumber: "SAL-ORD-2026-0001",
    transactionDate: "2026-08-22",
    deliveryDate: "2026-09-05",
    poNo: "PO-APEX-9921",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    orderType: "SALES",
    status: "TO_DELIVER_AND_BILL",
    deliveryStatus: "NOT_DELIVERED",
    billingStatus: "NOT_BILLED",
    currency: "INR",
    conversionRate: 1.0,
    totalQty: 3.0,
    netTotal: 30000.0,
    baseNetTotal: 30000.0,
    totalTaxesAndCharges: 2475.0,
    discountAmount: 0.0,
    additionalDiscountPercentage: 0.0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: 32475.0,
    baseGrandTotal: 32475.0,
    advancePaid: 0.0,
    perDelivered: 0.0,
    perBilled: 0.0,
    perPicked: 0.0,
    reserveStock: true,
    skipDeliveryNote: false,
    amountEligibleForCommission: 30000.0,
    commissionRate: 5.0,
    totalCommission: 1500.0,
    items: [
      {
        idx: 1,
        itemId: "44444444-4444-4444-4444-444444444401",
        itemCode: "ERP-CLOUD-ENT",
        itemName: "NextGen Cloud ERP Enterprise License",
        warehouse: "Digital Warehouse",
        deliveryDate: "2026-09-05",
        qty: 2,
        uom: "Nos",
        priceListRate: 12000.0,
        discountPercentage: 0,
        discountAmount: 0,
        rate: 12000.0,
        amount: 24000.0,
        netRate: 12000.0,
        netAmount: 24000.0,
        valuationRate: 2000.0,
        grossProfit: 20000.0,
        deliveredQty: 0,
        billedAmt: 0,
        pickedQty: 0,
      },
      {
        idx: 2,
        itemId: "44444444-4444-4444-4444-444444444405",
        itemCode: "SUP-SLA-247",
        itemName: "24/7 Enterprise Platinum Support",
        warehouse: "Service Warehouse",
        deliveryDate: "2026-09-05",
        qty: 1,
        uom: "Years",
        priceListRate: 6000.0,
        discountPercentage: 0,
        discountAmount: 0,
        rate: 6000.0,
        amount: 6000.0,
        netRate: 6000.0,
        netAmount: 6000.0,
        valuationRate: 1000.0,
        grossProfit: 5000.0,
        deliveredQty: 0,
        billedAmt: 0,
        pickedQty: 0,
      },
    ],
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "State Sales Tax (6.25%)",
        rate: 6.25,
        taxAmount: 1875.0,
        total: 31875.0,
      },
      {
        idx: 2,
        chargeType: "ON_NET_TOTAL",
        accountHead: "Municipal Surcharge (2.0%)",
        rate: 2.0,
        taxAmount: 600.0,
        total: 32475.0,
      },
    ],
    salesTeam: [
      {
        salesPersonName: "Sarah Jenkins (Account Lead)",
        allocatedPercentage: 70.0,
        allocatedAmount: 21000.0,
        commissionRate: 5.0,
        incentives: 1050.0,
      },
      {
        salesPersonName: "Alex Rivera (Solutions Engineer)",
        allocatedPercentage: 30.0,
        allocatedAmount: 9000.0,
        commissionRate: 5.0,
        incentives: 450.0,
      },
    ],
  },
  {
    id: "99999999-9999-9999-9999-999999999902",
    orderNumber: "SAL-ORD-2026-0002",
    transactionDate: "2026-08-24",
    deliveryDate: "2026-08-31",
    poNo: "PO-VG-7788",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    orderType: "SALES",
    status: "COMPLETED",
    deliveryStatus: "FULLY_DELIVERED",
    billingStatus: "FULLY_BILLED",
    currency: "INR",
    conversionRate: 1.0,
    totalQty: 22.0,
    netTotal: 18500.0,
    baseNetTotal: 18500.0,
    totalTaxesAndCharges: 1526.25,
    discountAmount: 0.0,
    additionalDiscountPercentage: 0.0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: 20026.25,
    baseGrandTotal: 20026.25,
    advancePaid: 0.0,
    perDelivered: 100.0,
    perBilled: 100.0,
    perPicked: 100.0,
    reserveStock: true,
    skipDeliveryNote: false,
    amountEligibleForCommission: 18500.0,
    commissionRate: 6.0,
    totalCommission: 1110.0,
    items: [],
    taxes: [],
  },
];

const MOCK_ANALYTICS: SalesAnalyticsSummary = {
  totalConfirmedRevenue: 52501.25,
  totalSalesOrders: 2,
  pendingFulfillmentOrders: 1,
  openQuotations: 1,
  averageOrderValue: 26250.62,
  totalPipelineValue: 32475.0,
  monthlyTrends: [
    { month: "Jun 2026", revenue: 14500.0, orderCount: 1 },
    { month: "Jul 2026", revenue: 28900.0, orderCount: 2 },
    { month: "Aug 2026", revenue: 52501.25, orderCount: 2 },
  ],
  topCustomers: [
    { customerName: "Apex Global Technologies LLC", totalRevenue: 32475.0, ordersCount: 1 },
    { customerName: "Vanguard Industrial Robotics Inc", totalRevenue: 20026.25, ordersCount: 1 },
  ],
  salesTeamPerformance: [
    { salesPersonName: "Sarah Jenkins (Account Lead)", totalSales: 21000.0, incentivesEarned: 1050.0 },
    { salesPersonName: "Alex Rivera (Solutions Engineer)", totalSales: 9000.0, incentivesEarned: 450.0 },
  ],
};

function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...additionalHeaders };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nextgen_auth_token");
    if (token && token !== "demo-admin-token") {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

// Authentication API Calls
export async function loginUser(credentials: { usernameOrEmail: string; password: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
      throw new Error(errorData.message || "Invalid username or password");
    }
    throw new Error(errorData.message || `Server communication error (${res.status}). Please check backend status.`);
  }

  return await res.json();
}

export async function registerUser(userData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to register user");
  }

  return await res.json();
}

export async function getAuthProfile(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
}

// API Service Functions with Graceful Fallback
export async function getCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch(`${API_BASE}/customers`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock customers", err);
  }
  return MOCK_CUSTOMERS;
}

export async function createCustomer(data: any): Promise<Customer> {
  try {
    const res = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_CUSTOMERS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing customer in local state", err);
  }

  const newCust: Customer = {
    id: `cust-${Date.now()}`,
    customerCode: data.customerCode || `CUST-2026-${Math.floor(100 + Math.random() * 900)}`,
    customerName: data.customerName,
    customerType: data.customerType || "COMPANY",
    customerGroupName: data.customerGroupName || "Commercial Enterprise",
    territoryName: data.territoryName || "North America - US East",
    defaultCurrency: data.defaultCurrency || "INR",
    taxId: data.taxId || "GSTIN-27AABCA1234F1Z5",
    taxCategory: data.taxCategory || "Standard In-State GST/VAT",
    defaultReceivableAccount: data.defaultReceivableAccount || "1310 - Debtors / Accounts Receivable",
    paymentTerms: data.paymentTerms || "Net 30 Days",
    defaultSalesPartner: data.defaultSalesPartner || "Pinnacle Alliance Systems",
    defaultCommissionRate: data.defaultCommissionRate || 5.0,
    creditLimit: Number(data.creditLimit) || 50000,
    outstandingBalance: 0,
    availableCredit: Number(data.creditLimit) || 50000,
    bypassCreditLimitCheck: Boolean(data.bypassCreditLimitCheck),
    isFrozen: false,
    disabled: false,
    email: data.email || "contact@company.com",
    phone: data.phone || "+1 (555) 123-4567",
    website: data.website || "www.company.com",
    addresses: data.addresses && data.addresses.length > 0 ? data.addresses : [
      {
        id: `addr-${Date.now()}`,
        addressTitle: "Primary Headquarters",
        addressType: "Billing",
        addressLine1: "100 Tech Enterprise Blvd",
        city: "New York",
        state: "NY",
        country: "USA",
        pincode: "10001",
        isPrimaryAddress: true,
        isShippingAddress: true,
      },
    ],
    contacts: data.contacts && data.contacts.length > 0 ? data.contacts : [
      {
        id: `ct-${Date.now()}`,
        firstName: data.customerName.split(" ")[0] || "Primary",
        lastName: "Contact",
        emailId: data.email || "contact@company.com",
        mobileNo: data.phone || "+1 555-0100",
        designation: "Procurement Officer",
        isPrimaryContact: true,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  MOCK_CUSTOMERS.unshift(newCust);
  return newCust;
}

export async function getItems(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(`${API_BASE}/items`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock items", err);
  }
  return MOCK_ITEMS;
}

export async function createItem(data: any): Promise<CatalogItem> {
  try {
    const res = await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_ITEMS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating item in local state", err);
  }

  const newItem: CatalogItem = {
    id: `item-${Date.now()}`,
    itemCode: data.itemCode || `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
    itemName: data.itemName || "New Catalog Item",
    itemGroup: data.itemGroup || "Hardware",
    stockUom: data.stockUom || "Nos",
    isStockItem: data.isStockItem !== undefined ? Boolean(data.isStockItem) : true,
    isSalesItem: data.isSalesItem !== undefined ? Boolean(data.isSalesItem) : true,
    isPurchaseItem: data.isPurchaseItem !== undefined ? Boolean(data.isPurchaseItem) : true,
    standardRate: Number(data.standardRate) || 0,
    valuationRate: Number(data.valuationRate) || 0,
    lastPurchaseRate: Number(data.lastPurchaseRate) || 0,
    maxDiscount: Number(data.maxDiscount) || 20,
    brand: data.brand || "",
    description: data.description || "",
    barcode: data.barcode || "",
    hasSerialNo: Boolean(data.hasSerialNo),
    hasBatchNo: Boolean(data.hasBatchNo),
    disabled: Boolean(data.disabled),
    defaultWarehouse: data.defaultWarehouse || "Stores - NC",
    defaultIncomeAccount: data.defaultIncomeAccount || "4110 - Sales Revenue",
    defaultExpenseAccount: data.defaultExpenseAccount || "5110 - Cost of Goods Sold",
    createdAt: new Date().toISOString(),
  };

  MOCK_ITEMS.unshift(newItem);
  return newItem;
}

export async function updateItem(id: string, data: any): Promise<CatalogItem> {
  try {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating item in local state", err);
  }

  const idx = MOCK_ITEMS.findIndex((i) => i.id === id || i.itemCode === id);
  if (idx >= 0) {
    MOCK_ITEMS[idx] = { ...MOCK_ITEMS[idx], ...data };
    return MOCK_ITEMS[idx];
  }
  return data;
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting item from local state", err);
  }
  const idx = MOCK_ITEMS.findIndex((i) => i.id === id || i.itemCode === id);
  if (idx >= 0) {
    MOCK_ITEMS.splice(idx, 1);
    return true;
  }
  return false;
}

export const getCatalogItems = getItems;

// ==========================================
// ITEM GROUPS API
// ==========================================

export async function getItemGroups(): Promise<ItemGroup[]> {
  try {
    const res = await fetch(`${API_BASE}/item-groups`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback item groups", err);
  }
  return MOCK_ITEM_GROUPS;
}

export async function createItemGroup(data: any): Promise<ItemGroup> {
  try {
    const res = await fetch(`${API_BASE}/item-groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_ITEM_GROUPS.push(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating item group in local state", err);
  }

  const newGroup: ItemGroup = {
    id: `ig-${Date.now()}`,
    itemGroupName: data.itemGroupName,
    parentItemGroup: data.parentItemGroup || "All Item Groups",
    isGroup: Boolean(data.isGroup),
    description: data.description || "",
    itemCount: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_ITEM_GROUPS.push(newGroup);
  return newGroup;
}

export async function deleteItemGroup(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/item-groups/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting item group from local state", err);
  }
  const idx = MOCK_ITEM_GROUPS.findIndex((g) => g.id === id);
  if (idx >= 0) {
    MOCK_ITEM_GROUPS.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// PRICE LISTS API
// ==========================================

export async function getPriceLists(): Promise<PriceList[]> {
  try {
    const res = await fetch(`${API_BASE}/price-lists`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback price lists", err);
  }
  return MOCK_PRICE_LISTS;
}

export async function createPriceList(data: any): Promise<PriceList> {
  try {
    const res = await fetch(`${API_BASE}/price-lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PRICE_LISTS.push(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating price list locally", err);
  }

  const newPl: PriceList = {
    id: `pl-${Date.now()}`,
    priceListName: data.priceListName,
    currency: data.currency || "INR",
    buying: Boolean(data.buying),
    selling: data.selling !== undefined ? Boolean(data.selling) : true,
    enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
    country: data.country || "Global",
  };
  MOCK_PRICE_LISTS.push(newPl);
  return newPl;
}

export async function deletePriceList(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/price-lists/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting price list locally", err);
  }
  const idx = MOCK_PRICE_LISTS.findIndex((p) => p.id === id);
  if (idx >= 0) {
    MOCK_PRICE_LISTS.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// ITEM PRICES API
// ==========================================

export async function getItemPrices(): Promise<ItemPrice[]> {
  try {
    const res = await fetch(`${API_BASE}/item-prices`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback item prices", err);
  }
  return MOCK_ITEM_PRICES;
}

export async function createItemPrice(data: any): Promise<ItemPrice> {
  try {
    const res = await fetch(`${API_BASE}/item-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_ITEM_PRICES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating item price locally", err);
  }

  const newIp: ItemPrice = {
    id: `ip-${Date.now()}`,
    itemCode: data.itemCode,
    itemName: data.itemName || data.itemCode,
    priceListName: data.priceListName || "Standard Selling",
    priceListRate: Number(data.priceListRate) || 0,
    currency: data.currency || "INR",
    minQty: Number(data.minQty) || 1,
    validFrom: data.validFrom || new Date().toISOString().split("T")[0],
    validUpto: data.validUpto,
  };
  MOCK_ITEM_PRICES.unshift(newIp);
  return newIp;
}

export async function deleteItemPrice(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/item-prices/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting item price locally", err);
  }
  const idx = MOCK_ITEM_PRICES.findIndex((ip) => ip.id === id);
  if (idx >= 0) {
    MOCK_ITEM_PRICES.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// PRODUCT BUNDLES API
// ==========================================

export async function getProductBundles(): Promise<ProductBundle[]> {
  try {
    const res = await fetch(`${API_BASE}/product-bundles`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback product bundles", err);
  }
  return MOCK_PRODUCT_BUNDLES;
}

export async function createProductBundle(data: any): Promise<ProductBundle> {
  try {
    const res = await fetch(`${API_BASE}/product-bundles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PRODUCT_BUNDLES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating product bundle locally", err);
  }

  const newPb: ProductBundle = {
    id: `pb-${Date.now()}`,
    newItemCode: data.newItemCode || `BDL-${Math.floor(100 + Math.random() * 900)}`,
    bundleName: data.bundleName || "Custom Bundle",
    description: data.description || "",
    disabled: false,
    totalRate: data.items ? data.items.reduce((acc: number, item: any) => acc + (Number(item.rate) || 0) * (Number(item.qty) || 1), 0) : 0,
    items: data.items || [],
    createdAt: new Date().toISOString(),
  };
  MOCK_PRODUCT_BUNDLES.unshift(newPb);
  return newPb;
}

export async function deleteProductBundle(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/product-bundles/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting product bundle locally", err);
  }
  const idx = MOCK_PRODUCT_BUNDLES.findIndex((pb) => pb.id === id);
  if (idx >= 0) {
    MOCK_PRODUCT_BUNDLES.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// PROMOTIONAL SCHEMES & SHIPPING RULES API
// ==========================================

export async function getPromotionalSchemes(): Promise<PromotionalScheme[]> {
  try {
    const res = await fetch(`${API_BASE}/promotional-schemes`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback promotional schemes", err);
  }
  return MOCK_PROMOTIONAL_SCHEMES;
}

export async function createPromotionalScheme(data: any): Promise<PromotionalScheme> {
  try {
    const res = await fetch(`${API_BASE}/promotional-schemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PROMOTIONAL_SCHEMES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating scheme locally", err);
  }

  const newPs: PromotionalScheme = {
    id: `ps-${Date.now()}`,
    name: data.name,
    applyOn: data.applyOn || "Item Code",
    applyKeyId: data.applyKeyId || "ALL",
    validFrom: data.validFrom || new Date().toISOString().split("T")[0],
    validUpto: data.validUpto,
    minQty: Number(data.minQty) || 1,
    discountPercentage: Number(data.discountPercentage) || 10,
    description: data.description || "",
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  MOCK_PROMOTIONAL_SCHEMES.unshift(newPs);
  return newPs;
}

export async function deletePromotionalScheme(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/promotional-schemes/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting scheme locally", err);
  }
  const idx = MOCK_PROMOTIONAL_SCHEMES.findIndex((ps) => ps.id === id);
  if (idx >= 0) {
    MOCK_PROMOTIONAL_SCHEMES.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getShippingRules(): Promise<ShippingRule[]> {
  try {
    const res = await fetch(`${API_BASE}/shipping-rules`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback shipping rules", err);
  }
  return MOCK_SHIPPING_RULES;
}

export async function createShippingRule(data: any): Promise<ShippingRule> {
  try {
    const res = await fetch(`${API_BASE}/shipping-rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_SHIPPING_RULES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating shipping rule locally", err);
  }

  const newSr: ShippingRule = {
    id: `sr-${Date.now()}`,
    shippingRuleName: data.shippingRuleName,
    calculateBasedOn: data.calculateBasedOn || "Net Total",
    shippingAmount: Number(data.shippingAmount) || 0,
    fromValue: Number(data.fromValue) || 0,
    toValue: Number(data.toValue) || 999999,
    costCenter: data.costCenter || "Main - NC",
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  MOCK_SHIPPING_RULES.unshift(newSr);
  return newSr;
}

export async function deleteShippingRule(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/shipping-rules/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting shipping rule locally", err);
  }
  const idx = MOCK_SHIPPING_RULES.findIndex((sr) => sr.id === id);
  if (idx >= 0) {
    MOCK_SHIPPING_RULES.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getQuotations(): Promise<Quotation[]> {
  try {
    const res = await fetch(`${API_BASE}/quotations`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock quotations", err);
  }
  return MOCK_QUOTATIONS;
}

export async function createQuotation(data: any): Promise<Quotation> {
  try {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, adding to mock in-memory", err);
  }
  const newQtn: Quotation = {
    id: `qtn-${Date.now()}`,
    quotationNumber: `SAL-QTN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionDate: data.transactionDate || new Date().toISOString().split("T")[0],
    validTill: data.validTill || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    customerId: data.customerId,
    customerName: MOCK_CUSTOMERS.find((c) => c.id === data.customerId)?.customerName || "Customer",
    orderType: data.orderType || "SALES",
    status: "OPEN",
    currency: data.currency || "INR",
    conversionRate: 1.0,
    totalQty: (data.items || []).reduce((acc: number, item: any) => acc + (Number(item.qty) || 1), 0),
    netTotal: 15000.0,
    baseNetTotal: 15000.0,
    totalTaxesAndCharges: 1237.5,
    discountAmount: 0,
    additionalDiscountPercentage: 0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: 16237.5,
    baseGrandTotal: 16237.5,
    items: [],
    taxes: [],
  };
  MOCK_QUOTATIONS.unshift(newQtn);
  return newQtn;
}

export async function getSalesOrders(): Promise<SalesOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-orders`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock sales orders", err);
  }
  return MOCK_ORDERS;
}

export async function createSalesOrder(data: any): Promise<SalesOrder> {
  try {
    const res = await fetch(`${API_BASE}/sales-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_ORDERS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing sales order locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const items = (data.items || []).map((i: any, idx: number) => ({
    id: `soi-${Date.now()}-${idx}`,
    itemId: i.itemId,
    itemCode: i.itemCode || "ERP-CLOUD-ENT",
    itemName: i.itemName || "NextGen Cloud ERP Enterprise License",
    qty: Number(i.qty) || 1,
    rate: Number(i.rate) || 12000,
    amount: (Number(i.qty) || 1) * (Number(i.rate) || 12000),
    netAmount: (Number(i.qty) || 1) * (Number(i.rate) || 12000),
    valuationRate: 6000,
    grossProfit: ((Number(i.qty) || 1) * (Number(i.rate) || 12000)) * 0.5,
    deliveredQty: 0,
    billedAmt: 0,
    pickedQty: 0,
    deliveredBySupplier: false,
    grantCommission: true,
  }));

  const netTotal = items.reduce((acc: number, item: any) => acc + item.amount, 0);
  const grandTotal = netTotal * 1.18;

  const newOrder: SalesOrder = {
    id: `so-${Date.now()}`,
    orderNumber: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionDate: data.transactionDate || new Date().toISOString().split("T")[0],
    deliveryDate: data.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    poNo: data.poNo || `PO-CLIENT-${Math.floor(100 + Math.random() * 900)}`,
    poDate: new Date().toISOString().split("T")[0],
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    orderType: data.orderType || "SALES",
    status: "DRAFT",
    deliveryStatus: "NOT_DELIVERED",
    billingStatus: "NOT_BILLED",
    quotationId: data.quotationId,
    currency: data.currency || "INR",
    conversionRate: 1.0,
    totalQty: items.reduce((acc: number, item: any) => acc + item.qty, 0),
    netTotal: netTotal,
    baseNetTotal: netTotal,
    totalTaxesAndCharges: netTotal * 0.18,
    discountAmount: 0,
    additionalDiscountPercentage: 0,
    applyDiscountOn: "GRAND_TOTAL",
    grandTotal: grandTotal,
    baseGrandTotal: grandTotal,
    roundedTotal: Math.round(grandTotal),
    baseRoundedTotal: Math.round(grandTotal),
    inWords: `INR ${Math.round(grandTotal).toLocaleString()} Only`,
    advancePaid: 0,
    perDelivered: 0,
    perBilled: 0,
    perPicked: 0,
    reserveStock: true,
    skipDeliveryNote: false,
    amountEligibleForCommission: netTotal,
    commissionRate: 5.0,
    totalCommission: netTotal * 0.05,
    items: items,
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "Output IGST / CGST (18%)",
        rate: 18.0,
        taxAmount: netTotal * 0.18,
        total: grandTotal,
        baseTaxAmount: netTotal * 0.18,
        baseTotal: grandTotal,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  MOCK_ORDERS.unshift(newOrder);
  return newOrder;
}

export async function submitSalesOrder(orderId: string): Promise<SalesOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/sales-orders/${orderId}/submit`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating local mock", err);
  }
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (order) {
    order.status = "TO_DELIVER_AND_BILL";
    order.deliveryStatus = "NOT_DELIVERED";
    order.billingStatus = "NOT_BILLED";
  }
  return order || null;
}

export async function cancelSalesOrder(orderId: string): Promise<SalesOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/sales-orders/${orderId}/cancel`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating local mock", err);
  }
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (order) {
    order.status = "CANCELLED";
  }
  return order || null;
}

export async function getSalesAnalytics(): Promise<SalesAnalyticsSummary> {
  try {
    const res = await fetch(`${API_BASE}/sales/analytics/summary`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock analytics", err);
  }
  return MOCK_ANALYTICS;
}

// --- CRM Leads & Opportunities ---
let MOCK_LEADS: Lead[] = [
  {
    id: "lead-001",
    leadName: "Helena Rostova",
    companyName: "Nordic Tech Logistics Oy",
    email: "h.rostova@nordictech.fi",
    phone: "+358 40 123 4567",
    status: "QUALIFIED",
    leadSource: "Direct Enterprise Inquiry",
    territoryId: "Europe - Central",
    notes: "Requires full Cloud ERP deployment with multi-currency.",
    createdAt: "2026-08-18T09:00:00Z",
  },
  {
    id: "lead-002",
    leadName: "David Sterling",
    companyName: "Sterling Aerospace Components",
    email: "dsterling@sterlingaero.com",
    phone: "+1 (555) 392-1100",
    status: "OPEN",
    leadSource: "Trade Expo 2026",
    territoryId: "North America - US West",
    notes: "Initial discovery call scheduled for next week.",
    createdAt: "2026-08-20T14:30:00Z",
  },
];

let MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    title: "Enterprise ERP 500-Seat Migration",
    opportunityFrom: "CUSTOMER",
    partyId: "77777777-7777-7777-7777-777777777701",
    partyName: "Apex Global Technologies LLC",
    opportunityType: "Sales",
    status: "PROPOSAL",
    dealSize: 48000,
    probability: 75,
    expectedClosingDate: "2026-09-30",
    salesStage: "Proposal / Price Quotation",
    contactEmail: "procurement@apexglobal.io",
    contactPhone: "+1 (555) 234-8800",
    notes: "Custom integration with on-premise telemetry.",
    createdAt: "2026-08-19T11:00:00Z",
  },
];

export async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(`${API_BASE}/leads`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock leads", err);
  }
  return MOCK_LEADS;
}

export async function createLead(data: any): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_LEADS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, saving lead locally", err);
  }

  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    leadName: data.leadName,
    companyName: data.companyName,
    email: data.email,
    phone: data.phone,
    status: (data.status as any) || "OPEN",
    leadSource: data.leadSource || "Website Inquiry",
    territoryId: data.territoryId,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  MOCK_LEADS.unshift(newLead);
  return newLead;
}

export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}/status?status=${status}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating lead status locally", err);
  }
  const lead = MOCK_LEADS.find((l) => l.id === id);
  if (lead) lead.status = status as any;
  return lead || MOCK_LEADS[0];
}

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const res = await fetch(`${API_BASE}/opportunities`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock opportunities", err);
  }
  return MOCK_OPPORTUNITIES;
}

export async function createOpportunity(data: any): Promise<Opportunity> {
  try {
    const res = await fetch(`${API_BASE}/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_OPPORTUNITIES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, saving opportunity locally", err);
  }

  const newOpp: Opportunity = {
    id: `opp-${Date.now()}`,
    title: data.title,
    opportunityFrom: data.opportunityFrom || "CUSTOMER",
    partyId: data.partyId,
    partyName: data.partyName || "Prospect Party",
    opportunityType: data.opportunityType || "Sales",
    status: (data.status as OpportunityStatus) || "QUALIFICATION",
    dealSize: Number(data.dealSize) || 10000,
    probability: Number(data.probability) || 50,
    expectedClosingDate: data.expectedClosingDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    salesStage: data.salesStage || "Qualification",
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  MOCK_OPPORTUNITIES.unshift(newOpp);
  return newOpp;
}

export async function updateOpportunityStatus(id: string, status: string, stage?: string): Promise<Opportunity> {
  try {
    let url = `${API_BASE}/opportunities/${id}/status?status=${status}`;
    if (stage) url += `&stage=${encodeURIComponent(stage)}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating opportunity locally", err);
  }
  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  if (opp) {
    opp.status = status as OpportunityStatus;
    if (stage) opp.salesStage = stage;
  }
  return opp || MOCK_OPPORTUNITIES[0];
}

// --- Fulfilment & Delivery Notes ---
let MOCK_DELIVERY_NOTES: DeliveryNote[] = [
  {
    id: "dn-001",
    deliveryNoteNumber: "DN-2026-0001",
    salesOrderId: "99999999-9999-9999-9999-999999999902",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    postingDate: "2026-08-24",
    status: "COMPLETED",
    carrier: "BlueDart Express Freight",
    trackingNumber: "TRK-IN-982341",
    shippingAddress: "220 Innovation Way, San Jose, CA 95134",
    totalQty: 4,
    totalAmount: 20026.25,
    inWords: "INR Twenty Thousand Twenty Six Only",
    items: [
      {
        id: "dni-1",
        itemCode: "SRV-RACK-2U",
        itemName: "NextGen Edge Server Appliance 2U",
        qty: 4,
        uom: "Nos",
        rate: 4500.0,
        amount: 18000.0,
        warehouse: "Main Finished Goods Warehouse",
      },
    ],
    createdAt: "2026-08-24T11:00:00Z",
  },
];

export async function getDeliveryNotes(): Promise<DeliveryNote[]> {
  try {
    const res = await fetch(`${API_BASE}/delivery-notes`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock delivery notes", err);
  }
  return MOCK_DELIVERY_NOTES;
}

export async function createDeliveryNote(data: any): Promise<DeliveryNote> {
  try {
    const res = await fetch(`${API_BASE}/delivery-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_DELIVERY_NOTES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating delivery note locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const items = (data.items || []).map((i: any, idx: number) => ({
    id: `dni-${Date.now()}-${idx}`,
    itemCode: i.itemCode,
    itemName: i.itemName,
    qty: Number(i.qty) || 1,
    uom: i.uom || "Nos",
    rate: Number(i.rate) || 0,
    amount: (Number(i.qty) || 1) * (Number(i.rate) || 0),
    warehouse: i.warehouse || "Finished Goods",
  }));

  const totalAmount = items.reduce((acc: number, item: any) => acc + item.amount, 0);

  const newDn: DeliveryNote = {
    id: `dn-${Date.now()}`,
    deliveryNoteNumber: `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    salesOrderId: data.salesOrderId,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    status: "SUBMITTED",
    carrier: data.carrier || "Standard Freight Carrier",
    trackingNumber: data.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    shippingAddress: data.shippingAddress || "Client Receiving Dock",
    totalQty: items.reduce((acc: number, item: any) => acc + item.qty, 0),
    totalAmount: totalAmount,
    notes: data.notes,
    items: items,
    createdAt: new Date().toISOString(),
  };

  MOCK_DELIVERY_NOTES.unshift(newDn);
  return newDn;
}

export async function makeDeliveryNoteFromOrder(salesOrderId: string): Promise<DeliveryNote> {
  try {
    const res = await fetch(`${API_BASE}/delivery-notes/from-order/${salesOrderId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_DELIVERY_NOTES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, generating delivery note locally from order", err);
  }

  const order = MOCK_ORDERS.find((o) => o.id === salesOrderId);
  if (!order) throw new Error("Sales Order not found");

  const newDn: DeliveryNote = {
    id: `dn-${Date.now()}`,
    deliveryNoteNumber: `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    salesOrderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    postingDate: new Date().toISOString().split("T")[0],
    status: "SUBMITTED",
    carrier: "Express Freight Line",
    trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    shippingAddress: "Main Distribution Center",
    totalQty: order.totalQty,
    totalAmount: order.grandTotal,
    items: (order.items || []).map((i, idx) => ({
      id: `dni-${Date.now()}-${idx}`,
      salesOrderItemId: i.id,
      itemCode: i.itemCode,
      itemName: i.itemName,
      qty: i.qty,
      uom: i.uom || "Nos",
      rate: i.rate,
      amount: i.amount,
      warehouse: i.warehouse || "Main Warehouse",
    })),
    createdAt: new Date().toISOString(),
  };

  order.perDelivered = 100;
  order.deliveryStatus = "FULLY_DELIVERED";
  if (order.billingStatus === "FULLY_BILLED") {
    order.status = "COMPLETED";
  } else {
    order.status = "TO_BILL";
  }

  MOCK_DELIVERY_NOTES.unshift(newDn);
  return newDn;
}

// --- Billing & Sales Invoices ---
let MOCK_INVOICES: SalesInvoice[] = [
  {
    id: "sinv-001",
    invoiceNumber: "SINV-2026-0001",
    salesOrderId: "99999999-9999-9999-9999-999999999901",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    postingDate: "2026-08-23",
    dueDate: "2026-09-22",
    status: "UNPAID",
    currency: "INR",
    conversionRate: 1.0,
    netTotal: 30000.0,
    totalTax: 2475.0,
    grandTotal: 32475.0,
    roundedTotal: 32475.0,
    inWords: "INR Thirty Two Thousand Four Hundred Seventy Five Only",
    paidAmount: 0.0,
    outstandingAmount: 32475.0,
    paymentTerms: "Net 30 Days",
    notes: "Sales invoice generated from Order SAL-ORD-2026-0001",
    items: [
      {
        id: "sii-1",
        salesOrderItemId: "soi-1",
        itemCode: "ERP-CLOUD-ENT",
        itemName: "NextGen Cloud ERP Enterprise License",
        qty: 2,
        rate: 12000.0,
        amount: 24000.0,
        incomeAccount: "4110 - Sales Revenue",
      },
      {
        id: "sii-2",
        salesOrderItemId: "soi-2",
        itemCode: "SUP-SLA-247",
        itemName: "24/7 Enterprise Platinum Support",
        qty: 1,
        rate: 6000.0,
        amount: 6000.0,
        incomeAccount: "4110 - Sales Revenue",
      },
    ],
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "State Sales Tax (6.25%)",
        rate: 6.25,
        taxAmount: 1875.0,
        total: 31875.0,
      },
      {
        idx: 2,
        chargeType: "ON_NET_TOTAL",
        accountHead: "Municipal Surcharge (2.0%)",
        rate: 2.0,
        taxAmount: 600.0,
        total: 32475.0,
      },
    ],
    createdAt: "2026-08-23T10:00:00Z",
  },
  {
    id: "sinv-002",
    invoiceNumber: "SINV-2026-0002",
    salesOrderId: "99999999-9999-9999-9999-999999999902",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    postingDate: "2026-08-24",
    dueDate: "2026-09-23",
    status: "PAID",
    currency: "INR",
    conversionRate: 1.0,
    netTotal: 18500.0,
    totalTax: 1526.25,
    grandTotal: 20026.25,
    roundedTotal: 20026.0,
    inWords: "INR Twenty Thousand Twenty Six and Twenty Five Paise Only",
    paidAmount: 20026.25,
    outstandingAmount: 0.0,
    paymentTerms: "Net 30 Days",
    notes: "Direct fulfillment invoice",
    items: [
      {
        id: "sii-3",
        itemCode: "SRV-RACK-2U",
        itemName: "NextGen Edge Server Appliance 2U",
        qty: 4,
        rate: 4500.0,
        amount: 18000.0,
        incomeAccount: "4110 - Sales Revenue",
      },
    ],
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "Output Tax IGST (8.25%)",
        rate: 8.25,
        taxAmount: 1526.25,
        total: 20026.25,
      },
    ],
    createdAt: "2026-08-24T14:30:00Z",
  },
];

let MOCK_GL_ENTRIES: GlEntry[] = [
  {
    id: "gl-001",
    postingDate: "2026-08-23",
    voucherType: "Sales Invoice",
    voucherNo: "SINV-2026-0001",
    voucherId: "sinv-001",
    account: "1310 - Debtors (Accounts Receivable)",
    debit: 32475.0,
    credit: 0,
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    remarks: "Sales Invoice created for Apex Global Technologies LLC",
    cancelled: false,
    createdAt: "2026-08-23T10:00:00Z",
  },
  {
    id: "gl-002",
    postingDate: "2026-08-23",
    voucherType: "Sales Invoice",
    voucherNo: "SINV-2026-0001",
    voucherId: "sinv-001",
    account: "4110 - Sales Revenue",
    debit: 0,
    credit: 30000.0,
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    remarks: "Sales Revenue earned on SINV-2026-0001",
    cancelled: false,
    createdAt: "2026-08-23T10:00:00Z",
  },
  {
    id: "gl-003",
    postingDate: "2026-08-23",
    voucherType: "Sales Invoice",
    voucherNo: "SINV-2026-0001",
    voucherId: "sinv-001",
    account: "2210 - Sales Output Tax Liability",
    debit: 0,
    credit: 2475.0,
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    remarks: "GST / Sales Tax payable on SINV-2026-0001",
    cancelled: false,
    createdAt: "2026-08-23T10:00:00Z",
  },
  {
    id: "gl-004",
    postingDate: "2026-08-25",
    voucherType: "Payment Entry",
    voucherNo: "PAY-2026-0001",
    voucherId: "pay-001",
    account: "1110 - HDFC Bank Operational Current A/C",
    debit: 20026.25,
    credit: 0,
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    remarks: "Customer Receipt via BANK_TRANSFER Ref: UTR-HDFC-9918239",
    cancelled: false,
    createdAt: "2026-08-25T16:00:00Z",
  },
  {
    id: "gl-005",
    postingDate: "2026-08-25",
    voucherType: "Payment Entry",
    voucherNo: "PAY-2026-0001",
    voucherId: "pay-001",
    account: "1310 - Debtors (Accounts Receivable)",
    debit: 0,
    credit: 20026.25,
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    remarks: "AR Settlement from Vanguard Industrial Robotics Inc",
    cancelled: false,
    createdAt: "2026-08-25T16:00:00Z",
  },
];

let MOCK_PAYMENTS: PaymentEntry[] = [
  {
    id: "pay-001",
    paymentNumber: "PAY-2026-0001",
    paymentType: "RECEIVE",
    paymentMode: "BANK_TRANSFER",
    status: "SUBMITTED",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics Inc",
    salesInvoiceId: "sinv-002",
    salesOrderId: "99999999-9999-9999-9999-999999999902",
    postingDate: "2026-08-25",
    paidAmount: 20026.25,
    referenceNo: "UTR-HDFC-9918239",
    notes: "Full settlement for invoice SINV-2026-0002",
    createdAt: "2026-08-25T16:00:00Z",
  },
];

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock sales invoices", err);
  }
  return MOCK_INVOICES;
}

export async function createSalesInvoice(data: any): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_INVOICES.unshift(created);
      return created;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || "Failed to create sales invoice");
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("network") && !err.message.includes("Failed to fetch") && !err.message.includes("communication")) {
      throw err;
    }
    console.warn("Backend unavailable, creating sales invoice locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const items = (data.items || []).map((i: any, idx: number) => ({
    id: `sii-${Date.now()}-${idx}`,
    salesOrderItemId: i.salesOrderItemId,
    itemCode: i.itemCode || "ERP-CLOUD-ENT",
    itemName: i.itemName || "NextGen Enterprise Cloud License",
    qty: Number(i.qty) || 1,
    rate: Number(i.rate) || 12000,
    amount: (Number(i.qty) || 1) * (Number(i.rate) || 12000),
    incomeAccount: i.incomeAccount || "4110 - Sales Revenue",
  }));

  const netTotal = items.reduce((acc: number, item: any) => acc + item.amount, 0);
  const totalTax = netTotal * 0.18;
  const grandTotal = netTotal + totalTax;
  const invNumber = `SINV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInv: SalesInvoice = {
    id: `sinv-${Date.now()}`,
    invoiceNumber: invNumber,
    salesOrderId: data.salesOrderId,
    deliveryNoteId: data.deliveryNoteId,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: "UNPAID",
    currency: data.currency || "INR",
    conversionRate: 1.0,
    netTotal: netTotal,
    totalTax: totalTax,
    grandTotal: grandTotal,
    roundedTotal: Math.round(grandTotal),
    inWords: `INR ${Math.round(grandTotal).toLocaleString()} Only`,
    paidAmount: 0,
    outstandingAmount: grandTotal,
    paymentTerms: data.paymentTerms || "Net 30 Days",
    notes: data.notes,
    items: items,
    taxes: [
      {
        idx: 1,
        chargeType: "ON_NET_TOTAL",
        accountHead: "2210 - Sales Output Tax Liability",
        rate: 18.0,
        taxAmount: totalTax,
        total: grandTotal,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  if (cust) {
    cust.outstandingBalance = (cust.outstandingBalance || 0) + grandTotal;
    cust.availableCredit = Math.max(0, (cust.creditLimit || 0) - cust.outstandingBalance);
  }

  // Double-entry GL Posting
  const today = new Date().toISOString().split("T")[0];
  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-1`,
    postingDate: today,
    voucherType: "Sales Invoice",
    voucherNo: invNumber,
    voucherId: newInv.id,
    account: "1310 - Debtors (Accounts Receivable)",
    debit: grandTotal,
    credit: 0,
    customerId: newInv.customerId,
    customerName: newInv.customerName,
    remarks: `Sales Invoice created for ${newInv.customerName}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });
  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-2`,
    postingDate: today,
    voucherType: "Sales Invoice",
    voucherNo: invNumber,
    voucherId: newInv.id,
    account: "4110 - Sales Revenue",
    debit: 0,
    credit: netTotal,
    customerId: newInv.customerId,
    customerName: newInv.customerName,
    remarks: `Sales Revenue earned on ${invNumber}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });
  if (totalTax > 0) {
    MOCK_GL_ENTRIES.unshift({
      id: `gl-${Date.now()}-3`,
      postingDate: today,
      voucherType: "Sales Invoice",
      voucherNo: invNumber,
      voucherId: newInv.id,
      account: "2210 - Sales Output Tax Liability",
      debit: 0,
      credit: totalTax,
      customerId: newInv.customerId,
      customerName: newInv.customerName,
      remarks: `Output GST payable on ${invNumber}`,
      cancelled: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (data.salesOrderId) {
    const order = MOCK_ORDERS.find((o) => o.id === data.salesOrderId);
    if (order) {
      order.perBilled = 100;
      order.billingStatus = "FULLY_BILLED";
      if (order.deliveryStatus === "FULLY_DELIVERED") {
        order.status = "COMPLETED";
      } else {
        order.status = "TO_DELIVER";
      }
    }
  }

  MOCK_INVOICES.unshift(newInv);
  return newInv;
}

export async function makeInvoiceFromOrder(salesOrderId: string): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices/from-order/${salesOrderId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_INVOICES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, generating invoice locally from sales order", err);
  }

  const order = MOCK_ORDERS.find((o) => o.id === salesOrderId);
  if (!order) throw new Error("Sales Order not found");

  return await createSalesInvoice({
    salesOrderId: order.id,
    customerId: order.customerId,
    paymentTerms: order.paymentTermsTemplate || "Net 30 Days",
    notes: `Generated from Sales Order: ${order.orderNumber}`,
    items: (order.items || []).map((i) => ({
      salesOrderItemId: i.id,
      itemCode: i.itemCode,
      itemName: i.itemName,
      qty: i.qty,
      rate: i.rate,
      incomeAccount: "4110 - Sales Revenue",
    })),
  });
}

export async function makeInvoiceFromDelivery(deliveryNoteId: string): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices/from-delivery/${deliveryNoteId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_INVOICES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, generating invoice locally from delivery note", err);
  }

  const dn = MOCK_DELIVERY_NOTES.find((d) => d.id === deliveryNoteId);
  if (!dn) throw new Error("Delivery Note not found");

  return await createSalesInvoice({
    salesOrderId: dn.salesOrderId,
    deliveryNoteId: dn.id,
    customerId: dn.customerId,
    paymentTerms: "Net 30 Days",
    notes: `Generated from Delivery Note: ${dn.deliveryNoteNumber}`,
    items: (dn.items || []).map((i) => ({
      itemCode: i.itemCode,
      itemName: i.itemName,
      qty: i.qty,
      rate: i.rate,
      incomeAccount: "4110 - Sales Revenue",
    })),
  });
}

// --- Invoice & Payment Cancellations with GL Contra Reversals ---
export async function cancelSalesInvoice(id: string): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const cancelled = await res.json();
      const idx = MOCK_INVOICES.findIndex((inv) => inv.id === id);
      if (idx !== -1) {
        MOCK_INVOICES[idx] = cancelled;
      }
      return cancelled;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || `Failed to cancel sales invoice (${res.status})`);
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("network") && !err.message.includes("Failed to fetch") && !err.message.includes("communication")) {
      throw err;
    }
    console.warn("Backend unavailable, executing fallback invoice cancellation locally", err);
  }

  const invoice = MOCK_INVOICES.find((inv) => inv.id === id);
  if (!invoice) {
    throw new Error(`Sales Invoice not found with id: ${id}`);
  }

  if (invoice.status === "CANCELLED") {
    throw new Error(`Sales Invoice ${invoice.invoiceNumber} is already cancelled`);
  }

  if (invoice.paidAmount && invoice.paidAmount > 0) {
    throw new Error(`Cannot cancel invoice ${invoice.invoiceNumber} with active payments. Cancel payments first.`);
  }

  // 1. Revert customer outstanding balance
  const customer = MOCK_CUSTOMERS.find((c) => c.id === invoice.customerId);
  if (customer && invoice.outstandingAmount) {
    customer.outstandingBalance = Math.max(0, (customer.outstandingBalance || 0) - invoice.outstandingAmount);
    customer.availableCredit = (customer.creditLimit || 0) - customer.outstandingBalance;
  }

  // 2. Mark existing GL entries cancelled and post Contra Reversal GL Entries
  MOCK_GL_ENTRIES.forEach((g) => {
    if (g.voucherId === invoice.id || g.voucherNo === invoice.invoiceNumber) {
      g.cancelled = true;
    }
  });

  const today = new Date().toISOString().split("T")[0];
  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-1`,
    postingDate: today,
    voucherType: "Sales Invoice Reversal",
    voucherNo: invoice.invoiceNumber,
    voucherId: invoice.id,
    account: "4110 - Sales Revenue",
    debit: invoice.netTotal,
    credit: 0,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    remarks: `Reversal of Sales Revenue on Cancelled Invoice: ${invoice.invoiceNumber}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });

  if (invoice.totalTax && invoice.totalTax > 0) {
    MOCK_GL_ENTRIES.unshift({
      id: `gl-${Date.now()}-2`,
      postingDate: today,
      voucherType: "Sales Invoice Reversal",
      voucherNo: invoice.invoiceNumber,
      voucherId: invoice.id,
      account: "2210 - Sales Output Tax Liability",
      debit: invoice.totalTax,
      credit: 0,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      remarks: `Reversal of Output Tax on Cancelled Invoice: ${invoice.invoiceNumber}`,
      cancelled: false,
      createdAt: new Date().toISOString(),
    });
  }

  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-3`,
    postingDate: today,
    voucherType: "Sales Invoice Reversal",
    voucherNo: invoice.invoiceNumber,
    voucherId: invoice.id,
    account: "1310 - Debtors (Accounts Receivable)",
    debit: 0,
    credit: invoice.grandTotal,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    remarks: `Reversal of Debtors receivable on Cancelled Invoice: ${invoice.invoiceNumber}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });

  // 3. Mark status cancelled
  invoice.status = "CANCELLED";
  invoice.outstandingAmount = 0;

  // 4. Update Parent Sales Order billing status if linked
  if (invoice.salesOrderId) {
    const order = MOCK_ORDERS.find((o) => o.id === invoice.salesOrderId);
    if (order) {
      const activeInvoices = MOCK_INVOICES.filter((inv) => inv.salesOrderId === order.id && inv.status !== "CANCELLED");
      const totalBilled = activeInvoices.reduce((acc, inv) => acc + (inv.netTotal || inv.grandTotal), 0);
      const orderTotal = order.netTotal || order.grandTotal || 1;
      const perBilled = Math.min(100, Math.round((totalBilled / orderTotal) * 100));
      order.perBilled = perBilled;
      order.billingStatus = perBilled === 0 ? "NOT_BILLED" : perBilled >= 100 ? "FULLY_BILLED" : "PARTLY_BILLED";
      if (order.deliveryStatus === "FULLY_DELIVERED" && order.billingStatus === "FULLY_BILLED") {
        order.status = "COMPLETED";
      } else if (order.deliveryStatus === "FULLY_DELIVERED") {
        order.status = "TO_BILL";
      } else if (order.billingStatus === "FULLY_BILLED") {
        order.status = "TO_DELIVER";
      }
    }
  }

  return invoice;
}

// --- Payment Entries ---
export async function getPayments(): Promise<PaymentEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/payments`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock payments", err);
  }
  return MOCK_PAYMENTS;
}

export async function recordPayment(data: any): Promise<PaymentEntry> {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PAYMENTS.unshift(created);
      return created;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || "Failed to record payment");
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("network") && !err.message.includes("Failed to fetch") && !err.message.includes("communication")) {
      throw err;
    }
    console.warn("Backend unavailable, recording payment locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const paidAmt = Number(data.paidAmount) || 0;
  const payNumber = `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPay: PaymentEntry = {
    id: `pay-${Date.now()}`,
    paymentNumber: payNumber,
    paymentType: "RECEIVE",
    paymentMode: data.paymentMode || "BANK_TRANSFER",
    status: "SUBMITTED",
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    salesInvoiceId: data.salesInvoiceId,
    salesOrderId: data.salesOrderId,
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    paidAmount: paidAmt,
    referenceNo: data.referenceNo || `UTR-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  // Update target Invoice
  if (data.salesInvoiceId) {
    const inv = MOCK_INVOICES.find((i) => i.id === data.salesInvoiceId);
    if (inv) {
      inv.paidAmount = (inv.paidAmount || 0) + paidAmt;
      inv.outstandingAmount = Math.max(0, inv.grandTotal - inv.paidAmount);
      inv.status = inv.outstandingAmount <= 0 ? "PAID" : "PARTLY_PAID";
    }
  }

  // Update Customer Outstanding Balance
  if (cust) {
    cust.outstandingBalance = Math.max(0, (cust.outstandingBalance || 0) - paidAmt);
    cust.availableCredit = (cust.creditLimit || 0) - cust.outstandingBalance;
  }

  // Double-entry GL Posting for Payment
  const today = new Date().toISOString().split("T")[0];
  const bankOrCashAccount = data.paymentMode === "CASH" ? "1120 - Petty Cash Account" : "1110 - HDFC Bank Operational Current A/C";

  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-1`,
    postingDate: today,
    voucherType: "Payment Entry",
    voucherNo: payNumber,
    voucherId: newPay.id,
    account: bankOrCashAccount,
    debit: paidAmt,
    credit: 0,
    customerId: newPay.customerId,
    customerName: newPay.customerName,
    remarks: `Customer Receipt via ${data.paymentMode} Ref: ${newPay.referenceNo}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });

  MOCK_GL_ENTRIES.unshift({
    id: `gl-${Date.now()}-2`,
    postingDate: today,
    voucherType: "Payment Entry",
    voucherNo: payNumber,
    voucherId: newPay.id,
    account: "1310 - Debtors (Accounts Receivable)",
    debit: 0,
    credit: paidAmt,
    customerId: newPay.customerId,
    customerName: newPay.customerName,
    remarks: `AR Settlement from ${newPay.customerName}`,
    cancelled: false,
    createdAt: new Date().toISOString(),
  });

  MOCK_PAYMENTS.unshift(newPay);
  return newPay;
}
export async function cancelPaymentEntry(id: string): Promise<PaymentEntry> {
  try {
    const res = await fetch(`${API_BASE}/payments/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const cancelled = await res.json();
      const idx = MOCK_PAYMENTS.findIndex((p) => p.id === id);
      if (idx !== -1) {
        MOCK_PAYMENTS[idx] = cancelled;
      }
      return cancelled;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || "Failed to cancel payment entry");
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("network") && !err.message.includes("Failed to fetch") && !err.message.includes("communication")) {
      throw err;
    }
    console.warn("Backend unavailable, cancelling payment locally", err);
  }

  const payment = MOCK_PAYMENTS.find((p) => p.id === id);
  if (!payment) throw new Error("Payment Entry not found");

  if (payment.status === "CANCELLED") {
    throw new Error(`Payment Entry ${payment.paymentNumber} is already cancelled`);
  }

  // Restore invoice outstanding
  if (payment.salesInvoiceId) {
    const inv = MOCK_INVOICES.find((i) => i.id === payment.salesInvoiceId);
    if (inv) {
      inv.paidAmount = Math.max(0, (inv.paidAmount || 0) - payment.paidAmount);
      inv.outstandingAmount = inv.grandTotal - inv.paidAmount;
      inv.status = inv.outstandingAmount <= 0 ? "PAID" : inv.paidAmount > 0 ? "PARTLY_PAID" : "UNPAID";
    }
  }

  // Restore customer outstanding
  const customer = MOCK_CUSTOMERS.find((c) => c.id === payment.customerId);
  if (customer) {
    customer.outstandingBalance = (customer.outstandingBalance || 0) + payment.paidAmount;
    customer.availableCredit = (customer.creditLimit || 0) - customer.outstandingBalance;
  }

  // Cancel GL entries
  MOCK_GL_ENTRIES.forEach((g) => {
    if (g.voucherId === payment.id || g.voucherNo === payment.paymentNumber) {
      g.cancelled = true;
    }
  });

  payment.status = "CANCELLED";
  return payment;
}

// --- Pricing Rules & Coupons ---
let MOCK_PRICING_RULES: PricingRule[] = [
  {
    id: "pr-001",
    title: "Bulk Enterprise License Discount (10+ Units)",
    applyOn: "ITEM_CODE",
    applyKeyId: "ERP-CLOUD-ENT",
    minQty: 10,
    discountPercentage: 15.0,
    discountAmount: 0,
    isFreeItem: false,
    active: true,
    createdAt: "2026-01-15T00:00:00Z",
  },
];

let MOCK_COUPONS: CouponCode[] = [
  {
    id: "cp-001",
    couponName: "Q3 Enterprise Kickoff 10% Off",
    couponCode: "SUMMER10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 10000,
    usedCount: 3,
    maxUses: 100,
    active: true,
    createdAt: "2026-07-01T00:00:00Z",
  },
];

export async function getPricingRules(): Promise<PricingRule[]> {
  try {
    const res = await fetch(`${API_BASE}/pricing-rules`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock pricing rules", err);
  }
  return MOCK_PRICING_RULES;
}

export async function createPricingRule(data: any): Promise<PricingRule> {
  try {
    const res = await fetch(`${API_BASE}/pricing-rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PRICING_RULES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating pricing rule locally", err);
  }

  const newPr: PricingRule = {
    id: `pr-${Date.now()}`,
    title: data.title,
    applyOn: data.applyOn || "ITEM_CODE",
    applyKeyId: data.applyKeyId || "ALL",
    minQty: Number(data.minQty) || 1,
    discountPercentage: Number(data.discountPercentage) || 0,
    discountAmount: Number(data.discountAmount) || 0,
    isFreeItem: Boolean(data.isFreeItem),
    freeItemCode: data.freeItemCode,
    freeQty: Number(data.freeQty) || 0,
    active: true,
    createdAt: new Date().toISOString(),
  };

  MOCK_PRICING_RULES.unshift(newPr);
  return newPr;
}

export async function deletePricingRule(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/pricing-rules/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting pricing rule locally", err);
  }
  const idx = MOCK_PRICING_RULES.findIndex((r) => r.id === id);
  if (idx >= 0) {
    MOCK_PRICING_RULES.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getCoupons(): Promise<CouponCode[]> {
  try {
    const res = await fetch(`${API_BASE}/coupons`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback coupons", err);
  }
  return MOCK_COUPONS;
}

export async function createCoupon(data: any): Promise<CouponCode> {
  try {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_COUPONS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating coupon locally", err);
  }

  const newCp: CouponCode = {
    id: `cp-${Date.now()}`,
    couponName: data.couponName,
    couponCode: (data.couponCode || `SAVE${Math.floor(10 + Math.random() * 90)}`).toUpperCase(),
    discountType: data.discountType || "PERCENTAGE",
    discountValue: Number(data.discountValue) || 10,
    minOrderAmount: Number(data.minOrderAmount) || 0,
    usedCount: 0,
    maxUses: Number(data.maxUses) || 100,
    active: true,
    createdAt: new Date().toISOString(),
  };

  MOCK_COUPONS.unshift(newCp);
  return newCp;
}

export async function applyCoupon(couponCode: string, orderAmount: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ couponCode, orderAmount }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, applying coupon locally", err);
  }

  const cp = MOCK_COUPONS.find((c) => c.couponCode.toUpperCase() === couponCode.toUpperCase() && c.active);
  if (!cp) throw new Error("Invalid or expired coupon code");
  if (orderAmount < cp.minOrderAmount) throw new Error(`Minimum order amount of ₹${cp.minOrderAmount} required`);

  const discountAmount = cp.discountType === "PERCENTAGE" ? (orderAmount * cp.discountValue) / 100 : cp.discountValue;
  cp.usedCount += 1;
  return {
    valid: true,
    discountAmount: Math.min(discountAmount, orderAmount),
    discountType: cp.discountType,
    couponCode: cp.couponCode,
  };
}

// --- Comprehensive Reports ---
export async function getSalesOrderAnalysisReport(): Promise<SalesOrderAnalysisReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/sales-order-analysis`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback sales order analysis", err);
  }

  return MOCK_ORDERS.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber,
    transactionDate: o.transactionDate,
    customerName: o.customerName,
    status: o.status,
    grandTotal: o.grandTotal,
    deliveredPercentage: o.perDelivered || 0,
    billedPercentage: o.perBilled || 0,
    deliveredAmount: (o.grandTotal * (o.perDelivered || 0)) / 100,
    billedAmount: (o.grandTotal * (o.perBilled || 0)) / 100,
    pendingDeliveryAmount: (o.grandTotal * (100 - (o.perDelivered || 0))) / 100,
    pendingBillingAmount: (o.grandTotal * (100 - (o.perBilled || 0))) / 100,
    deliveryStatus: o.deliveryStatus,
    billingStatus: o.billingStatus,
  }));
}

export async function getCustomerCreditAgingReport(): Promise<CustomerCreditAgingReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/customer-credit-aging`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback credit aging", err);
  }

  return MOCK_CUSTOMERS.map((c) => ({
    customerId: c.id,
    customerCode: c.customerCode,
    customerName: c.customerName,
    customerGroup: c.customerGroupName || "Enterprise",
    creditLimit: c.creditLimit,
    outstandingBalance: c.outstandingBalance,
    availableCredit: c.availableCredit,
    currentDue: c.outstandingBalance * 0.6,
    overdue31to60: c.outstandingBalance * 0.3,
    overdue61to90: c.outstandingBalance * 0.1,
    overdueAbove90: 0,
    creditExceeded: c.outstandingBalance > c.creditLimit,
  }));
}

export async function getQuotationWinLossReport(): Promise<QuotationWinLossReport> {
  try {
    const res = await fetch(`${API_BASE}/reports/win-loss-funnel`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback win-loss report", err);
  }

  return {
    totalQuotations: MOCK_QUOTATIONS.length,
    wonQuotations: MOCK_QUOTATIONS.filter((q) => q.status === "ORDERED").length,
    lostQuotations: MOCK_QUOTATIONS.filter((q) => q.status === "LOST").length,
    openQuotations: MOCK_QUOTATIONS.filter((q) => q.status === "OPEN" || q.status === "DRAFT").length,
    expiredQuotations: MOCK_QUOTATIONS.filter((q) => q.status === "EXPIRED").length,
    winRatePercentage: 66.7,
    totalPipelineValue: 52501.25,
    wonValue: 20026.25,
    lostValue: 0,
    lostReasonsCount: { "Price Competition": 1, "Budget Constraints": 1 },
    lostReasonsValue: { "Price Competition": 12000, "Budget Constraints": 8000 },
  };
}

export async function convertLeadToOpportunity(leadId: string): Promise<Opportunity> {
  try {
    const res = await fetch(`${API_BASE}/leads/${leadId}/convert-to-opportunity`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, converting lead locally", err);
  }

  const lead = MOCK_LEADS.find((l) => l.id === leadId);
  if (!lead) throw new Error("Lead not found");

  lead.status = "QUALIFIED";
  const newOpp: Opportunity = {
    id: `opp-${Date.now()}`,
    title: `Opportunity from ${lead.leadName} (${lead.companyName || "Company"})`,
    opportunityFrom: "LEAD",
    partyId: lead.id,
    partyName: lead.companyName || lead.leadName,
    opportunityType: "Sales",
    status: "QUALIFICATION",
    dealSize: 25000,
    probability: 60,
    expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    salesStage: "Qualification Stage",
    contactEmail: lead.email,
    contactPhone: lead.phone,
    notes: lead.notes,
    createdAt: new Date().toISOString(),
  };

  MOCK_OPPORTUNITIES.unshift(newOpp);
  return newOpp;
}

export async function convertOpportunityToQuotation(oppId: string, customerId?: string): Promise<Quotation> {
  try {
    const url = customerId 
      ? `${API_BASE}/opportunities/${oppId}/convert-to-quotation?customerId=${customerId}` 
      : `${API_BASE}/opportunities/${oppId}/convert-to-quotation`;
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, converting opportunity to quotation locally", err);
  }

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === oppId);
  const targetCust = (customerId ? MOCK_CUSTOMERS.find((c) => c.id === customerId) : null) || MOCK_CUSTOMERS[0];

  const qtn = await createQuotation({
    customerId: targetCust.id,
    notes: opp ? `Converted from Opportunity: ${opp.title}` : "Converted Opportunity Quotation",
    items: [
      {
        itemId: "44444444-4444-4444-4444-444444444401",
        itemCode: "ERP-CLOUD-ENT",
        itemName: "NextGen Cloud ERP Enterprise License",
        qty: 2,
        rate: 12000,
      },
    ],
  });

  if (opp) opp.status = "WON";
  return qtn;
}

export async function getItemSalesHistoryReport(): Promise<ItemSalesHistoryReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/item-sales-history`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback item history", err);
  }

  return MOCK_ITEMS.map((item) => ({
    itemId: item.id,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemGroup: item.itemGroup,
    totalQtyOrdered: 6,
    totalQtyDelivered: 4,
    totalQtyBilled: 4,
    totalSalesRevenue: item.standardRate * 4,
    averageSellingRate: item.standardRate,
  }));
}

export async function getSalesTrendsReport(): Promise<SalesTrendsReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/sales-trends`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback sales trends", err);
  }

  return [
    { period: "2026-06", salesOrdersCount: 4, confirmedRevenue: 68000, quotationsCount: 6, quotationValue: 95000, winConversionRate: 66.7 },
    { period: "2026-07", salesOrdersCount: 7, confirmedRevenue: 124000, quotationsCount: 10, quotationValue: 180000, winConversionRate: 70.0 },
    { period: "2026-08", salesOrdersCount: 9, confirmedRevenue: 175000, quotationsCount: 12, quotationValue: 240000, winConversionRate: 75.0 },
  ];
}

export async function getCustomerAcquisitionReport(): Promise<CustomerAcquisitionReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/customer-acquisition`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback acquisition report", err);
  }

  return MOCK_CUSTOMERS.map((c) => ({
    customerId: c.id,
    customerCode: c.customerCode,
    customerName: c.customerName,
    customerGroup: c.customerGroupName || "Enterprise",
    territory: c.territoryName || "North America",
    firstOrderDate: "2026-01-15",
    lastOrderDate: "2026-08-24",
    totalOrdersCount: 3,
    lifetimeValue: 85000,
    loyaltySegment: "VIP Tier-1",
  }));
}

// --- General Ledger & Accounting ---
export async function getGlEntries(): Promise<GlEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/accounts/gl-entries`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback GL entries", err);
  }
  return MOCK_GL_ENTRIES;
}

export async function getCustomerLedger(customerId: string): Promise<GlEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/accounts/customer-ledger/${customerId}`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, filtering customer GL entries locally", err);
  }
  return MOCK_GL_ENTRIES.filter((g) => g.customerId === customerId);
}

export async function markQuotationLost(id: string, reason: string, competitorName?: string): Promise<Quotation> {
  try {
    const params = new URLSearchParams({ reason });
    if (competitorName) params.append("competitorName", competitorName);
    const res = await fetch(`${API_BASE}/quotations/${id}/lost?${params.toString()}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, marking quotation lost locally", err);
  }

  const qtn = MOCK_QUOTATIONS.find((q) => q.id === id);
  if (qtn) {
    qtn.status = "LOST";
    qtn.lostReason = reason;
    qtn.competitorName = competitorName;
  }
  return qtn || MOCK_QUOTATIONS[0];
}

// --- Additional Analytical Reports ---
export async function getQuotationTrendsDetailedReport(): Promise<QuotationTrendsReport[]> {
  const res = await fetch(`${API_BASE}/reports/quotation-trends`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) {
    return [
      { period: "2026-08", totalQuotations: 12, orderedQuotations: 8, lostQuotations: 2, expiredQuotations: 2, totalQuotationValue: 520000, wonQuotationValue: 395000, conversionRatePercentage: 66.67, avgTurnaroundDays: 3.8 },
      { period: "2026-07", totalQuotations: 15, orderedQuotations: 9, lostQuotations: 4, expiredQuotations: 2, totalQuotationValue: 680000, wonQuotationValue: 460000, conversionRatePercentage: 60.00, avgTurnaroundDays: 4.2 },
      { period: "2026-06", totalQuotations: 10, orderedQuotations: 6, lostQuotations: 3, expiredQuotations: 1, totalQuotationValue: 410000, wonQuotationValue: 275000, conversionRatePercentage: 60.00, avgTurnaroundDays: 5.1 },
    ];
  }
  return await res.json();
}

export async function getInactiveCustomersReport(): Promise<InactiveCustomerReport[]> {
  const res = await fetch(`${API_BASE}/reports/inactive-customers`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) {
    return [
      { customerId: "cust-004", customerCode: "CUST-004", customerName: "Quantum Health Systems", customerGroup: "Government", territory: "Europe - Central", lastOrderDate: "2026-04-10", daysSinceLastOrder: 139, totalHistoricalOrders: 1, lifetimeRevenue: 45000, churnRiskLevel: "CRITICAL" },
      { customerId: "cust-003", customerCode: "CUST-003", customerName: "BlueSky Logistics Corp", customerGroup: "SMB", territory: "North America", lastOrderDate: "2026-06-25", daysSinceLastOrder: 63, totalHistoricalOrders: 2, lifetimeRevenue: 48500, churnRiskLevel: "HIGH" },
      { customerId: "cust-002", customerCode: "CUST-002", customerName: "Vanguard Industrial Robotics", customerGroup: "Enterprise", territory: "North America", lastOrderDate: "2026-07-20", daysSinceLastOrder: 38, totalHistoricalOrders: 3, lifetimeRevenue: 142000, churnRiskLevel: "MODERATE" },
    ];
  }
  return await res.json();
}

export async function getSalesCommissionSummaryReport(): Promise<SalesCommissionSummary[]> {
  const res = await fetch(`${API_BASE}/reports/sales-commission-summary`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) {
    return [
      { salesPersonName: "Alexander Wright", totalOrdersCount: 8, totalAllocatedAmount: 485000, avgCommissionRate: 5.0, totalCommissionEarned: 24250, totalIncentivesEarned: 5000, totalPayout: 29250 },
      { salesPersonName: "Sophia Patel", totalOrdersCount: 6, totalAllocatedAmount: 320000, avgCommissionRate: 4.5, totalCommissionEarned: 14400, totalIncentivesEarned: 3500, totalPayout: 17900 },
      { salesPersonName: "David Kim", totalOrdersCount: 4, totalAllocatedAmount: 190000, avgCommissionRate: 4.0, totalCommissionEarned: 7600, totalIncentivesEarned: 1500, totalPayout: 9100 },
    ];
  }
  return await res.json();
}

// --- Customer 360 Dashboard ---
export async function getCustomer360Dashboard(customerId: string): Promise<Customer360Dashboard> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/dashboard`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) {
    const cust = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];
    return {
      customer: cust,
      totalQuotationsCount: 3,
      totalQuotationsValue: 145000,
      totalSalesOrdersCount: 4,
      totalSalesOrdersValue: 320000,
      totalDeliveryNotesCount: 3,
      totalDeliveredQty: 45,
      totalInvoicesCount: 3,
      totalInvoicedValue: 285000,
      totalPaidValue: 240000,
      totalOutstandingValue: 45000,
      totalPaymentsCount: 3,
      totalCollectedAmount: 240000,
      recentQuotations: [],
      recentSalesOrders: [],
      recentDeliveryNotes: [],
      recentSalesInvoices: [],
      recentPaymentEntries: [],
      customerLedger: [],
    };
  }
  return await res.json();
}

// In-memory collections for active sessions
let MOCK_BLANKET_ORDERS: BlanketOrder[] = [
  {
    id: "bo-001",
    blanketOrderNumber: "BO-2026-0001",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    fromDate: "2026-01-01",
    toDate: "2026-12-31",
    company: "NextGen ERP Corp",
    status: "ACTIVE",
    termsAndConditions: "Annual contract with quarterly releases. Rate locked for 12 months.",
    items: [
      { id: "boi-1", itemCode: "ERP-CLOUD-ENT", itemName: "NextGen Cloud ERP Enterprise License", qty: 50, rate: 12000, orderedQty: 20, remainingQty: 30 },
      { id: "boi-2", itemCode: "CONS-IMPL-SR", itemName: "Senior Solution Architect Consulting", qty: 200, rate: 250, orderedQty: 80, remainingQty: 120 },
    ],
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "bo-002",
    blanketOrderNumber: "BO-2026-0002",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "Vanguard Industrial Robotics",
    fromDate: "2026-03-01",
    toDate: "2026-11-30",
    company: "NextGen ERP Corp",
    status: "ACTIVE",
    termsAndConditions: "Tier-1 Industrial supply agreement with standard 30-day fulfillment terms.",
    items: [
      { id: "boi-3", itemCode: "SRV-SLA-247", itemName: "24/7 Platinum Enterprise Support SLA", qty: 12, rate: 4500, orderedQty: 6, remainingQty: 6 },
    ],
    createdAt: "2026-03-01T10:30:00Z",
  },
];

let MOCK_SALES_PARTNERS: SalesPartner[] = [
  {
    id: "sp-001",
    partnerName: "Pinnacle Alliance Systems",
    partnerType: "Channel Partner",
    commissionRate: 7.5,
    currency: "INR",
    contactPerson: "Marcus Vance",
    email: "partners@pinnaclealliance.com",
    phone: "+1 (555) 489-3200",
    territory: "North America",
    totalAllocatedAmount: 680000,
    totalCommissionEarned: 51000,
    disabled: false,
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "sp-002",
    partnerName: "Nexus Tech Distribution APAC",
    partnerType: "Distributor",
    commissionRate: 6.0,
    currency: "INR",
    contactPerson: "Eileen Chen",
    email: "distribution@nexustech.sg",
    phone: "+65 6789 0123",
    territory: "Asia Pacific",
    totalAllocatedAmount: 420000,
    totalCommissionEarned: 25200,
    disabled: false,
    createdAt: "2026-03-15T11:00:00Z",
  },
  {
    id: "sp-003",
    partnerName: "EuroCommerce Solutions BV",
    partnerType: "Agent",
    commissionRate: 5.0,
    currency: "INR",
    contactPerson: "Lukas Weber",
    email: "lukas@eurocommerce.nl",
    phone: "+31 20 555 1234",
    territory: "Europe - Central",
    totalAllocatedAmount: 290000,
    totalCommissionEarned: 14500,
    disabled: false,
    createdAt: "2026-04-01T09:30:00Z",
  },
];

let MOCK_SALES_PERSONS: SalesPerson[] = [
  {
    id: "sper-001",
    salesPersonName: "Alexander Wright",
    employeeId: "EMP-0101",
    email: "a.wright@nextgen.erp",
    phone: "+1 (555) 789-0111",
    parentSalesPerson: "Global VP Sales",
    commissionRate: 5.0,
    targetAmount: 600000,
    allocatedAmount: 485000,
    incentivesEarned: 5000,
    disabled: false,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "sper-002",
    salesPersonName: "Sophia Patel",
    employeeId: "EMP-0102",
    email: "s.patel@nextgen.erp",
    phone: "+1 (555) 789-0122",
    parentSalesPerson: "Alexander Wright",
    commissionRate: 4.5,
    targetAmount: 450000,
    allocatedAmount: 320000,
    incentivesEarned: 3500,
    disabled: false,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "sper-003",
    salesPersonName: "David Kim",
    employeeId: "EMP-0103",
    email: "d.kim@nextgen.erp",
    phone: "+1 (555) 789-0133",
    parentSalesPerson: "Alexander Wright",
    commissionRate: 4.0,
    targetAmount: 350000,
    allocatedAmount: 190000,
    incentivesEarned: 1500,
    disabled: false,
    createdAt: "2026-02-01T11:30:00Z",
  },
];

// --- Blanket Orders ---
export async function getBlanketOrders(): Promise<BlanketOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/blanket-orders`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local blanket orders", err);
  }
  return MOCK_BLANKET_ORDERS;
}

export async function createBlanketOrder(data: any): Promise<BlanketOrder> {
  try {
    const res = await fetch(`${API_BASE}/blanket-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_BLANKET_ORDERS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing blanket order locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const newBo: BlanketOrder = {
    id: `bo-${Date.now()}`,
    blanketOrderNumber: `BO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    fromDate: data.fromDate || new Date().toISOString().split("T")[0],
    toDate: data.toDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    company: "NextGen ERP Corp",
    status: "ACTIVE",
    termsAndConditions: data.termsAndConditions || "Standard annual blanket agreement.",
    items: (data.items || []).map((i: any, idx: number) => ({
      id: `boi-${Date.now()}-${idx}`,
      itemCode: i.itemCode,
      itemName: i.itemName,
      qty: Number(i.qty) || 1,
      rate: Number(i.rate) || 0,
      orderedQty: 0,
      remainingQty: Number(i.qty) || 1,
    })),
    createdAt: new Date().toISOString(),
  };

  MOCK_BLANKET_ORDERS.unshift(newBo);
  return newBo;
}

export async function closeBlanketOrder(id: string): Promise<BlanketOrder> {
  try {
    const res = await fetch(`${API_BASE}/blanket-orders/${id}/close`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, closing blanket order locally", err);
  }
  const bo = MOCK_BLANKET_ORDERS.find((b) => b.id === id);
  if (bo) bo.status = "CLOSED";
  return bo || MOCK_BLANKET_ORDERS[0];
}

// --- Sales Partners ---
export async function getSalesPartners(): Promise<SalesPartner[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-partners`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local sales partners", err);
  }
  return MOCK_SALES_PARTNERS;
}

export async function createSalesPartner(data: any): Promise<SalesPartner> {
  try {
    const res = await fetch(`${API_BASE}/sales-partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_SALES_PARTNERS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing sales partner locally", err);
  }

  const newPartner: SalesPartner = {
    id: `sp-${Date.now()}`,
    partnerName: data.partnerName,
    partnerType: data.partnerType || "Channel Partner",
    commissionRate: Number(data.commissionRate) || 5.0,
    currency: data.currency || "INR",
    contactPerson: data.contactPerson || "Primary Partner Rep",
    email: data.email || "partners@agency.com",
    phone: data.phone || "+1 (555) 000-1111",
    territory: data.territory || "Global",
    totalAllocatedAmount: 0,
    totalCommissionEarned: 0,
    disabled: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_SALES_PARTNERS.unshift(newPartner);
  return newPartner;
}

export async function toggleSalesPartnerStatus(id: string): Promise<SalesPartner> {
  try {
    const res = await fetch(`${API_BASE}/sales-partners/${id}/toggle-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, toggling sales partner locally", err);
  }
  const sp = MOCK_SALES_PARTNERS.find((p) => p.id === id);
  if (sp) sp.disabled = !sp.disabled;
  return sp || MOCK_SALES_PARTNERS[0];
}

// --- Sales Persons ---
export async function getSalesPersons(): Promise<SalesPerson[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-persons`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local sales persons", err);
  }
  return MOCK_SALES_PERSONS;
}

export async function createSalesPerson(data: any): Promise<SalesPerson> {
  try {
    const res = await fetch(`${API_BASE}/sales-persons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_SALES_PERSONS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing sales person locally", err);
  }

  const newPerson: SalesPerson = {
    id: `sper-${Date.now()}`,
    salesPersonName: data.salesPersonName,
    employeeId: data.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    email: data.email || "rep@nextgen.erp",
    phone: data.phone || "+1 (555) 789-0199",
    parentSalesPerson: data.parentSalesPerson || "Alexander Wright",
    commissionRate: Number(data.commissionRate) || 4.5,
    targetAmount: Number(data.targetAmount) || 500000,
    allocatedAmount: 0,
    incentivesEarned: 0,
    disabled: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_SALES_PERSONS.unshift(newPerson);
  return newPerson;
}

export async function toggleSalesPersonStatus(id: string): Promise<SalesPerson> {
  try {
    const res = await fetch(`${API_BASE}/sales-persons/${id}/toggle-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, toggling sales person locally", err);
  }
  const sp = MOCK_SALES_PERSONS.find((p) => p.id === id);
  if (sp) sp.disabled = !sp.disabled;
  return sp || MOCK_SALES_PERSONS[0];
}


