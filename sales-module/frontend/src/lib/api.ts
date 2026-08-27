import {
  Customer,
  Quotation,
  SalesOrder,
  CatalogItem,
  SalesAnalyticsSummary,
  Lead,
  Opportunity,
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

export const getCatalogItems = getItems;

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
export async function getLeads(): Promise<Lead[]> {
  const res = await fetch(`${API_BASE}/leads`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return await res.json();
}

export async function createLead(data: any): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create lead");
  return await res.json();
}

export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/status?status=${status}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update lead status");
  return await res.json();
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const res = await fetch(`${API_BASE}/opportunities`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return await res.json();
}

export async function createOpportunity(data: any): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create opportunity");
  return await res.json();
}

export async function updateOpportunityStatus(id: string, status: string, stage?: string): Promise<Opportunity> {
  let url = `${API_BASE}/opportunities/${id}/status?status=${status}`;
  if (stage) url += `&stage=${encodeURIComponent(stage)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update opportunity status");
  return await res.json();
}

// --- Fulfilment & Delivery Notes ---
export async function getDeliveryNotes(): Promise<DeliveryNote[]> {
  const res = await fetch(`${API_BASE}/delivery-notes`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch delivery notes");
  return await res.json();
}

export async function createDeliveryNote(data: any): Promise<DeliveryNote> {
  const res = await fetch(`${API_BASE}/delivery-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create delivery note");
  return await res.json();
}

export async function makeDeliveryNoteFromOrder(salesOrderId: string): Promise<DeliveryNote> {
  const res = await fetch(`${API_BASE}/delivery-notes/from-order/${salesOrderId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to generate delivery note from order");
  return await res.json();
}

// --- Billing & Sales Invoices ---
export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const res = await fetch(`${API_BASE}/sales-invoices`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sales invoices");
  return await res.json();
}

export async function createSalesInvoice(data: any): Promise<SalesInvoice> {
  const res = await fetch(`${API_BASE}/sales-invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create sales invoice");
  return await res.json();
}

export async function makeInvoiceFromOrder(salesOrderId: string): Promise<SalesInvoice> {
  const res = await fetch(`${API_BASE}/sales-invoices/from-order/${salesOrderId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to generate invoice from order");
  return await res.json();
}

export async function makeInvoiceFromDelivery(deliveryNoteId: string): Promise<SalesInvoice> {
  const res = await fetch(`${API_BASE}/sales-invoices/from-delivery/${deliveryNoteId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to generate invoice from delivery note");
  return await res.json();
}

// --- Payment Entries ---
export async function getPayments(): Promise<PaymentEntry[]> {
  const res = await fetch(`${API_BASE}/payments`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch payment entries");
  return await res.json();
}

export async function recordPayment(data: any): Promise<PaymentEntry> {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to record payment");
  return await res.json();
}

// --- Pricing Rules & Coupons ---
export async function getPricingRules(): Promise<PricingRule[]> {
  const res = await fetch(`${API_BASE}/pricing-rules`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch pricing rules");
  return await res.json();
}

export async function createPricingRule(data: any): Promise<PricingRule> {
  const res = await fetch(`${API_BASE}/pricing-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create pricing rule");
  return await res.json();
}

export async function getCoupons(): Promise<CouponCode[]> {
  const res = await fetch(`${API_BASE}/coupons`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return await res.json();
}

export async function createCoupon(data: any): Promise<CouponCode> {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create coupon");
  return await res.json();
}

export async function applyCoupon(couponCode: string, orderAmount: number): Promise<any> {
  const res = await fetch(`${API_BASE}/coupons/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ couponCode, orderAmount }),
  });
  if (!res.ok) throw new Error("Failed to apply coupon");
  return await res.json();
}

// --- Comprehensive Reports ---
export async function getSalesOrderAnalysisReport(): Promise<SalesOrderAnalysisReport[]> {
  const res = await fetch(`${API_BASE}/reports/sales-order-analysis`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sales order analysis report");
  return await res.json();
}

export async function getCustomerCreditAgingReport(): Promise<CustomerCreditAgingReport[]> {
  const res = await fetch(`${API_BASE}/reports/customer-credit-aging`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch customer credit aging report");
  return await res.json();
}

export async function getQuotationWinLossReport(): Promise<QuotationWinLossReport> {
  const res = await fetch(`${API_BASE}/reports/win-loss-funnel`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch quotation win/loss report");
  return await res.json();
}

export async function convertLeadToOpportunity(leadId: string): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/convert-to-opportunity`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to convert lead to opportunity");
  return await res.json();
}

export async function convertOpportunityToQuotation(oppId: string, customerId?: string): Promise<Quotation> {
  const url = customerId 
    ? `${API_BASE}/opportunities/${oppId}/convert-to-quotation?customerId=${customerId}` 
    : `${API_BASE}/opportunities/${oppId}/convert-to-quotation`;
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to convert opportunity to quotation");
  return await res.json();
}

export async function getItemSalesHistoryReport(): Promise<ItemSalesHistoryReport[]> {
  const res = await fetch(`${API_BASE}/reports/item-sales-history`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch item sales history report");
  return await res.json();
}

export async function getSalesTrendsReport(): Promise<SalesTrendsReport[]> {
  const res = await fetch(`${API_BASE}/reports/sales-trends`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sales trends report");
  return await res.json();
}

export async function getCustomerAcquisitionReport(): Promise<CustomerAcquisitionReport[]> {
  const res = await fetch(`${API_BASE}/reports/customer-acquisition`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch customer acquisition report");
  return await res.json();
}

// --- General Ledger & Accounting ---
export async function getGlEntries(): Promise<GlEntry[]> {
  const res = await fetch(`${API_BASE}/accounts/gl-entries`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch GL entries");
  return await res.json();
}

export async function getCustomerLedger(customerId: string): Promise<GlEntry[]> {
  const res = await fetch(`${API_BASE}/accounts/customer-ledger/${customerId}`, { cache: "no-store", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch customer ledger");
  return await res.json();
}

// --- Invoice & Payment Cancellations with GL Contra Reversals ---
export async function cancelSalesInvoice(id: string): Promise<SalesInvoice> {
  const res = await fetch(`${API_BASE}/sales-invoices/${id}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to cancel sales invoice");
  return await res.json();
}

export async function cancelPaymentEntry(id: string): Promise<PaymentEntry> {
  const res = await fetch(`${API_BASE}/payments/${id}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to cancel payment entry");
  return await res.json();
}

export async function markQuotationLost(id: string, reason: string, competitorName?: string): Promise<Quotation> {
  const params = new URLSearchParams({ reason });
  if (competitorName) params.append("competitorName", competitorName);
  const res = await fetch(`${API_BASE}/quotations/${id}/lost?${params.toString()}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark quotation as lost");
  return await res.json();
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


