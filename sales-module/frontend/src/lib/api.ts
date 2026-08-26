import {
  Customer,
  Quotation,
  SalesOrder,
  CatalogItem,
  SalesAnalyticsSummary,
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
    throw new Error(errorData.message || "Invalid username or password");
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

export async function getItems(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(`${API_BASE}/items`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock items", err);
  }
  return MOCK_ITEMS;
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
