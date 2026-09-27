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
  SalesPartnerPayout,
  SalesPerson,
  PurchaseRequisition,
  PurchaseRequisitionItem,
  MaintenanceContract,
  MaintenanceVisit,
  WarrantyClaim,
  PaymentTermsTemplate,
  PaymentTermsTemplateCreateRequest,
  PaymentSchedule,
  PackingSlip,
  PackingSlipCreateRequest,
  SalesTeamMember,
  SalesTeamSaveRequest,
  TargetType,
  SalesTarget,
  SalesTargetCreateRequest,
  TargetVarianceReport,
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
  {
    id: "44444444-4444-4444-4444-444444444410",
    itemCode: "SKU010",
    itemName: "Camera",
    itemGroup: "Hardware",
    stockUom: "Nos",
    imageUrl: "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg",
    isStockItem: true,
    isSalesItem: true,
    isPurchaseItem: true,
    isFixedAsset: false,
    allowAlternativeItem: false,
    hasVariants: false,
    standardRate: 750.0,
    valuationRate: 500.0,
    lastPurchaseRate: 500.0,
    valuationMethod: "FIFO",
    maxDiscount: 15.0,
    hasSerialNo: true,
    hasBatchNo: false,
    hasExpiryDate: false,
    shelfLifeInDays: 730,
    warrantyPeriod: "24 Months Manufacturer",
    weightPerUnit: 0.65,
    weightUom: "Kg",
    minOrderQty: 5.0,
    safetyStock: 10.0,
    leadTimeDays: 7,
    brand: "OptiView Imaging",
    description: "Professional high-definition industrial inspection and optical sensor camera system.",
    barcode: "8901234567890",
    disabled: false,
    defaultWarehouse: "Main Warehouse",
    defaultIncomeAccount: "4110 - Sales Revenue",
    defaultExpenseAccount: "5110 - Cost of Goods Sold",
    defaultSupplier: "Global Vision Optics Inc.",
    deliveredBySupplier: false,
    grantCommission: true,
    includeItemInManufacturing: true,
    isSubContractedItem: false,
    uoms: [
      { uom: "Nos", conversionFactor: 1.0 },
      { uom: "Box (10 Units)", conversionFactor: 10.0 },
      { uom: "Master Carton (50 Units)", conversionFactor: 50.0 }
    ],
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
    deliveredBySupplier: Boolean(i.deliveredBySupplier),
    supplier: i.supplier || undefined,
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
    blanketOrderId: data.blanketOrderId,
    blanketOrderNumber: data.blanketOrderId
      ? MOCK_BLANKET_ORDERS.find((b) => b.id === data.blanketOrderId)?.blanketOrderNumber
      : undefined,
    salesPartnerId: data.salesPartnerId,
    salesPartnerName: data.salesPartnerName || (data.salesPartnerId ? MOCK_SALES_PARTNERS.find((p) => p.id === data.salesPartnerId)?.partnerName : undefined),
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
    commissionRate: data.commissionRate !== undefined ? Number(data.commissionRate) : (data.salesPartnerId ? (MOCK_SALES_PARTNERS.find(p => p.id === data.salesPartnerId)?.commissionRate || 5.0) : 0),
    totalCommission: netTotal * ((data.commissionRate !== undefined ? Number(data.commissionRate) : (data.salesPartnerId ? (MOCK_SALES_PARTNERS.find(p => p.id === data.salesPartnerId)?.commissionRate || 5.0) : 0)) / 100),
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

    if (order.blanketOrderId) {
      const bo = MOCK_BLANKET_ORDERS.find((b) => b.id === order.blanketOrderId);
      if (bo && bo.items) {
        for (const item of order.items || []) {
          const boItem = bo.items.find((bi) => bi.itemCode === item.itemCode);
          if (boItem) {
            boItem.orderedQty = (boItem.orderedQty || 0) + item.qty;
            boItem.remainingQty = Math.max(0, boItem.qty - boItem.orderedQty);
          }
        }
        const allCompleted = bo.items.every((bi) => (bi.remainingQty || 0) <= 0);
        const anyOrdered = bo.items.some((bi) => (bi.orderedQty || 0) > 0);
        bo.status = allCompleted ? "COMPLETED" : anyOrdered ? "PARTIALLY_ORDERED" : "ACTIVE";
      }
    }

    if (order.salesPartnerId && order.totalCommission) {
      const sp = MOCK_SALES_PARTNERS.find((p) => p.id === order.salesPartnerId);
      if (sp) {
        sp.totalAllocatedAmount = (sp.totalAllocatedAmount || 0) + order.netTotal;
        sp.totalCommissionEarned = (sp.totalCommissionEarned || 0) + order.totalCommission;
        sp.balanceOutstanding = Math.max(0, (sp.totalCommissionEarned || 0) - (sp.totalCommissionPaid || 0));
      }
    }
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
    const wasSubmitted = order.status !== "DRAFT";
    order.status = "CANCELLED";

    if (order.blanketOrderId && wasSubmitted) {
      const bo = MOCK_BLANKET_ORDERS.find((b) => b.id === order.blanketOrderId);
      if (bo && bo.items) {
        for (const item of order.items || []) {
          const boItem = bo.items.find((bi) => bi.itemCode === item.itemCode);
          if (boItem) {
            boItem.orderedQty = Math.max(0, (boItem.orderedQty || 0) - item.qty);
            boItem.remainingQty = Math.max(0, boItem.qty - boItem.orderedQty);
          }
        }
        const allCompleted = bo.items.every((bi) => (bi.remainingQty || 0) <= 0);
        const anyOrdered = bo.items.some((bi) => (bi.orderedQty || 0) > 0);
        bo.status = allCompleted ? "COMPLETED" : anyOrdered ? "PARTIALLY_ORDERED" : "ACTIVE";
      }
    }

    if (order.salesPartnerId && wasSubmitted && order.totalCommission) {
      const sp = MOCK_SALES_PARTNERS.find((p) => p.id === order.salesPartnerId);
      if (sp) {
        sp.totalAllocatedAmount = Math.max(0, (sp.totalAllocatedAmount || 0) - order.netTotal);
        sp.totalCommissionEarned = Math.max(0, (sp.totalCommissionEarned || 0) - order.totalCommission);
        sp.balanceOutstanding = Math.max(0, (sp.totalCommissionEarned || 0) - (sp.totalCommissionPaid || 0));
      }
    }
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
    probability: 60,
    expectedClosingDate: "2026-10-15",
    salesStage: "Proposal / Price Quotation",
    salesPerson: "Priya Sharma",
    contactEmail: "procurement@apexglobal.io",
    contactPhone: "+1 (555) 234-8800",
    notes: "Custom integration with on-premise telemetry and multi-company setup.",
    createdAt: "2026-08-19T11:00:00Z",
  },
  {
    id: "opp-002",
    title: "Supply Chain WMS Barcode Terminal Fleet",
    opportunityFrom: "CUSTOMER",
    partyId: "77777777-7777-7777-7777-777777777703",
    partyName: "Zenith Logistics Pvt Ltd",
    opportunityType: "Sales",
    status: "QUALIFICATION",
    dealSize: 32000,
    probability: 30,
    expectedClosingDate: "2026-10-31",
    salesStage: "Technical Qualification",
    salesPerson: "Rahul Verma",
    contactEmail: "ops@zenithlogistics.in",
    contactPhone: "+91 98200 12345",
    notes: "Evaluating Android-based rugged handheld scanners and printer integration.",
    createdAt: "2026-09-02T09:30:00Z",
  },
  {
    id: "opp-003",
    title: "Automated POS Terminal Rollout - 12 Retail Outlets",
    opportunityFrom: "CUSTOMER",
    partyId: "77777777-7777-7777-7777-777777777702",
    partyName: "BlueFin Dynamics International",
    opportunityType: "Sales",
    status: "NEGOTIATION",
    dealSize: 75000,
    probability: 80,
    expectedClosingDate: "2026-10-05",
    salesStage: "Commercial Negotiation",
    salesPerson: "Priya Sharma",
    contactEmail: "finance@bluefindynamics.com",
    contactPhone: "+44 20 7946 0912",
    notes: "Reviewing payment gateway SLA terms and hardware deployment schedule.",
    createdAt: "2026-08-25T14:15:00Z",
  },
  {
    id: "opp-004",
    title: "Multi-Branch Cloud MRP Implementation",
    opportunityFrom: "LEAD",
    partyName: "NovaTech Industrial Corp",
    opportunityType: "Manufacturing ERP",
    status: "PROSPECTING",
    dealSize: 120000,
    probability: 15,
    expectedClosingDate: "2026-11-20",
    salesStage: "Discovery & Needs Assessment",
    salesPerson: "Siddharth Rao",
    contactEmail: "director@novatechind.com",
    contactPhone: "+1 (555) 789-2233",
    notes: "Requires multi-level BOM explosion and shop-floor capacity planning.",
    createdAt: "2026-09-12T16:00:00Z",
  },
  {
    id: "opp-005",
    title: "Annual Maintenance Contract Upgrade (24/7 SLA)",
    opportunityFrom: "CUSTOMER",
    partyId: "77777777-7777-7777-7777-777777777701",
    partyName: "Apex Global Technologies LLC",
    opportunityType: "Support AMC",
    status: "WON",
    dealSize: 45000,
    probability: 100,
    expectedClosingDate: "2026-09-15",
    salesStage: "Closed Won",
    salesPerson: "Priya Sharma",
    contactEmail: "support-contracts@apexglobal.io",
    notes: "Executed 1-year premium enterprise hardware & support agreement.",
    createdAt: "2026-07-10T10:00:00Z",
  },
  {
    id: "opp-006",
    title: "Legacy Accounting System Replacement",
    opportunityFrom: "LEAD",
    partyName: "Vanguard Aerospace Systems",
    opportunityType: "Sales",
    status: "LOST",
    dealSize: 90000,
    probability: 0,
    expectedClosingDate: "2026-08-30",
    salesStage: "Closed Lost",
    salesPerson: "Rahul Verma",
    lostReason: "Competitor offered multi-year pre-paid discount that customer prioritized.",
    contactEmail: "it@vanguardaero.com",
    notes: "Stay in touch for Q1 next fiscal year review.",
    createdAt: "2026-06-15T08:45:00Z",
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
    salesPerson: data.salesPerson || "Priya Sharma",
    lostReason: data.lostReason,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  MOCK_OPPORTUNITIES.unshift(newOpp);
  return newOpp;
}

export async function updateOpportunityStatus(
  id: string,
  status: string,
  stage?: string,
  lostReason?: string
): Promise<Opportunity> {
  try {
    let url = `${API_BASE}/opportunities/${id}/status?status=${status}`;
    if (stage) url += `&stage=${encodeURIComponent(stage)}`;
    if (lostReason) url += `&lostReason=${encodeURIComponent(lostReason)}`;
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
    if (lostReason) opp.lostReason = lostReason;
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

  const isReturn = Boolean(data.isReturn);
  const dnNumber = isReturn
    ? `DN-RET-2026-${Math.floor(1000 + Math.random() * 9000)}`
    : `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newDn: DeliveryNote = {
    id: `dn-${Date.now()}`,
    deliveryNoteNumber: dnNumber,
    salesOrderId: data.salesOrderId,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    status: "SUBMITTED",
    isReturn: isReturn,
    returnAgainstId: data.returnAgainstId,
    returnAgainstNumber: data.returnAgainstNumber,
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

export async function createDeliveryReturn(deliveryNoteId: string, data?: any): Promise<DeliveryNote> {
  try {
    const res = await fetch(`${API_BASE}/delivery-notes/${deliveryNoteId}/create-return`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data || {}),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_DELIVERY_NOTES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating delivery return locally", err);
  }

  const orig = MOCK_DELIVERY_NOTES.find((d) => d.id === deliveryNoteId);
  return await createDeliveryNote({
    salesOrderId: orig?.salesOrderId,
    customerId: orig?.customerId,
    postingDate: data?.postingDate || new Date().toISOString().split("T")[0],
    isReturn: true,
    returnAgainstId: deliveryNoteId,
    returnAgainstNumber: orig?.deliveryNoteNumber,
    carrier: orig?.carrier,
    shippingAddress: orig?.shippingAddress,
    notes: data?.notes || `Sales Return against ${orig?.deliveryNoteNumber}`,
    items: data?.items || orig?.items || [],
  });
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
  const isReturn = Boolean(data.isReturn);
  const invNumber = isReturn
    ? `CRN-2026-${Math.floor(1000 + Math.random() * 9000)}`
    : `SINV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let allocatedAdvance = 0;
  let paidAmt = 0;
  let outstandingAmt = grandTotal;
  let invStatus: SalesInvoice["status"] = "UNPAID";

  if (isReturn) {
    paidAmt = grandTotal;
    outstandingAmt = 0;
    invStatus = "PAID";
  } else if (data.salesOrderId) {
    const advances = MOCK_PAYMENTS.filter((p) => p.salesOrderId === data.salesOrderId);
    const totalAdv = advances.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const prevAlloc = MOCK_INVOICES.filter(
      (i) => i.salesOrderId === data.salesOrderId && i.status !== "CANCELLED"
    ).reduce((s, i) => s + (i.allocatedAdvanceAmount || 0), 0);
    const avail = Math.max(0, totalAdv - prevAlloc);
    allocatedAdvance = Math.min(grandTotal, avail);
    paidAmt = allocatedAdvance;
    outstandingAmt = grandTotal - allocatedAdvance;
    invStatus = outstandingAmt <= 0 ? "PAID" : allocatedAdvance > 0 ? "PARTLY_PAID" : "UNPAID";
  }

  const newInv: SalesInvoice = {
    id: `sinv-${Date.now()}`,
    invoiceNumber: invNumber,
    salesOrderId: data.salesOrderId,
    deliveryNoteId: data.deliveryNoteId,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: invStatus,
    isReturn: isReturn,
    returnAgainstId: data.returnAgainstId,
    returnAgainstNumber: data.returnAgainstNumber,
    allocatedAdvanceAmount: allocatedAdvance,
    currency: data.currency || "INR",
    conversionRate: 1.0,
    netTotal: netTotal,
    totalTax: totalTax,
    grandTotal: grandTotal,
    roundedTotal: Math.round(grandTotal),
    inWords: `INR ${Math.round(grandTotal).toLocaleString()} Only`,
    paidAmount: paidAmt,
    outstandingAmount: outstandingAmt,
    paymentTerms: data.paymentTerms || (isReturn ? "Credit Adjustment" : "Net 30 Days"),
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
    if (isReturn) {
      cust.outstandingBalance = Math.max(0, (cust.outstandingBalance || 0) - grandTotal);
    } else {
      cust.outstandingBalance = (cust.outstandingBalance || 0) + outstandingAmt;
    }
    cust.availableCredit = Math.max(0, (cust.creditLimit || 0) - cust.outstandingBalance);
  }

  if (isReturn && data.returnAgainstId) {
    const orig = MOCK_INVOICES.find((i) => i.id === data.returnAgainstId);
    if (orig) {
      orig.outstandingAmount = Math.max(0, (orig.outstandingAmount || 0) - grandTotal);
      if (orig.outstandingAmount <= 0) {
        orig.status = "PAID";
      }
    }
  }

  // Double-entry GL Posting
  const today = new Date().toISOString().split("T")[0];
  if (isReturn) {
    MOCK_GL_ENTRIES.unshift({
      id: `gl-${Date.now()}-1`,
      postingDate: today,
      voucherType: "Credit Note",
      voucherNo: invNumber,
      voucherId: newInv.id,
      account: "4120 - Sales Returns & Allowances",
      debit: netTotal,
      credit: 0,
      customerId: newInv.customerId,
      customerName: newInv.customerName,
      remarks: `Sales Return on Credit Note ${invNumber}`,
      cancelled: false,
      createdAt: new Date().toISOString(),
    });
    if (totalTax > 0) {
      MOCK_GL_ENTRIES.unshift({
        id: `gl-${Date.now()}-2`,
        postingDate: today,
        voucherType: "Credit Note",
        voucherNo: invNumber,
        voucherId: newInv.id,
        account: "2210 - Sales Output Tax Liability",
        debit: totalTax,
        credit: 0,
        customerId: newInv.customerId,
        customerName: newInv.customerName,
        remarks: `Output GST reversal on Credit Note ${invNumber}`,
        cancelled: false,
        createdAt: new Date().toISOString(),
      });
    }
    MOCK_GL_ENTRIES.unshift({
      id: `gl-${Date.now()}-3`,
      postingDate: today,
      voucherType: "Credit Note",
      voucherNo: invNumber,
      voucherId: newInv.id,
      account: "1310 - Debtors (Accounts Receivable)",
      debit: 0,
      credit: grandTotal,
      customerId: newInv.customerId,
      customerName: newInv.customerName,
      remarks: `Customer credit adjustment on Credit Note ${invNumber}`,
      cancelled: false,
      createdAt: new Date().toISOString(),
    });
  } else {
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
  }

  if (data.salesOrderId) {
    const order = MOCK_ORDERS.find((o) => o.id === data.salesOrderId);
    if (order) {
      if (isReturn) {
        order.perBilled = Math.max(0, (order.perBilled || 100) - 50);
        order.billingStatus = order.perBilled <= 0 ? "NOT_BILLED" : "PARTLY_BILLED";
      } else {
        order.perBilled = 100;
        order.billingStatus = "FULLY_BILLED";
      }
      if (order.deliveryStatus === "FULLY_DELIVERED" && order.billingStatus === "FULLY_BILLED") {
        order.status = "COMPLETED";
      } else if (order.deliveryStatus === "FULLY_DELIVERED") {
        order.status = "TO_BILL";
      } else if (order.billingStatus === "FULLY_BILLED") {
        order.status = "TO_DELIVER";
      } else {
        order.status = "TO_DELIVER_AND_BILL";
      }
    }
  }

  MOCK_INVOICES.unshift(newInv);
  return newInv;
}

export async function createCreditNote(invoiceId: string, data?: any): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices/${invoiceId}/create-credit-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data || {}),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_INVOICES.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating credit note locally", err);
  }

  const orig = MOCK_INVOICES.find((i) => i.id === invoiceId);
  return await createSalesInvoice({
    salesOrderId: orig?.salesOrderId,
    customerId: orig?.customerId,
    postingDate: data?.postingDate || new Date().toISOString().split("T")[0],
    isReturn: true,
    returnAgainstId: invoiceId,
    returnAgainstNumber: orig?.invoiceNumber,
    notes: data?.notes || `Credit Note for return against ${orig?.invoiceNumber}`,
    items: data?.items || orig?.items || [],
  });
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

export async function getPaymentsBySalesOrderId(salesOrderId: string): Promise<PaymentEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/payments/order/${salesOrderId}`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback mock payments by order", err);
  }
  return MOCK_PAYMENTS.filter((p) => p.salesOrderId === salesOrderId);
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
  const isAdvance = Boolean(data.salesOrderId && !data.salesInvoiceId);

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
    isAdvance: isAdvance,
    allocatedAmount: 0,
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

  // Update Sales Order advance if applicable
  if (data.salesOrderId) {
    const order = MOCK_ORDERS.find((o) => o.id === data.salesOrderId);
    if (order) {
      order.advancePaid = (order.advancePaid || 0) + paidAmt;
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
    totalCommissionPaid: 35000,
    balanceOutstanding: 16000,
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
    totalCommissionPaid: 20000,
    balanceOutstanding: 5200,
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
    totalCommissionPaid: 10000,
    balanceOutstanding: 4500,
    disabled: false,
    createdAt: "2026-04-01T09:30:00Z",
  },
];

let MOCK_PARTNER_PAYOUTS: SalesPartnerPayout[] = [
  {
    id: "payout-001",
    payoutNumber: "PAYOUT-2026-001",
    salesPartnerId: "sp-001",
    salesPartnerName: "Pinnacle Alliance Systems",
    postingDate: "2026-03-01",
    amount: 35000,
    referenceNote: "Q1 Advance Commission Settlement",
    paymentMode: "Bank Transfer",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "payout-002",
    payoutNumber: "PAYOUT-2026-002",
    salesPartnerId: "sp-002",
    salesPartnerName: "Nexus Tech Distribution APAC",
    postingDate: "2026-03-10",
    amount: 20000,
    referenceNote: "Feb Commission Disbursement",
    paymentMode: "Bank Transfer",
    createdAt: "2026-03-10T14:30:00Z",
  },
  {
    id: "payout-003",
    payoutNumber: "PAYOUT-2026-003",
    salesPartnerId: "sp-003",
    salesPartnerName: "EuroCommerce Solutions BV",
    postingDate: "2026-03-20",
    amount: 10000,
    referenceNote: "March Retainer / Commission settlement",
    paymentMode: "Bank Transfer",
    createdAt: "2026-03-20T16:00:00Z",
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

export async function createReleaseOrderFromBlanket(id: string): Promise<SalesOrder> {
  try {
    const res = await fetch(`${API_BASE}/blanket-orders/${id}/create-release-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_ORDERS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, generating release order locally", err);
  }

  const bo = MOCK_BLANKET_ORDERS.find((b) => b.id === id);
  if (!bo) throw new Error("Blanket Order agreement not found");

  const unfulfilledItems = bo.items.filter((i) => (i.remainingQty || 0) > 0);
  if (unfulfilledItems.length === 0) {
    throw new Error(`All contractual quantities for ${bo.blanketOrderNumber} have already been fully ordered.`);
  }

  const payloadItems = unfulfilledItems.map((bi) => ({
    itemCode: bi.itemCode,
    itemName: bi.itemName,
    qty: bi.remainingQty,
    rate: bi.rate,
  }));

  const releaseOrder = await createSalesOrder({
    customerId: bo.customerId,
    blanketOrderId: bo.id,
    deliveryDate: bo.toDate,
    poNo: `REL-${bo.blanketOrderNumber}`,
    items: payloadItems,
  });

  await submitSalesOrder(releaseOrder.id);
  return releaseOrder;
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

// --- Sales Partner Commission Payouts ---
export async function getSalesPartnerPayouts(partnerId?: string): Promise<SalesPartnerPayout[]> {
  try {
    const url = partnerId
      ? `${API_BASE}/sales-partners/${partnerId}/payouts`
      : `${API_BASE}/sales-partners/payouts`;
    const res = await fetch(url, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local partner payouts", err);
  }
  if (partnerId) {
    return MOCK_PARTNER_PAYOUTS.filter((p) => p.salesPartnerId === partnerId);
  }
  return MOCK_PARTNER_PAYOUTS;
}

export async function createSalesPartnerPayout(data: {
  salesPartnerId: string;
  amount: number;
  postingDate?: string;
  referenceNote?: string;
  paymentMode?: string;
}): Promise<SalesPartnerPayout> {
  try {
    const res = await fetch(`${API_BASE}/sales-partners/${data.salesPartnerId}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_PARTNER_PAYOUTS.unshift(created);
      const sp = MOCK_SALES_PARTNERS.find((p) => p.id === data.salesPartnerId);
      if (sp) {
        sp.totalCommissionPaid = (sp.totalCommissionPaid || 0) + Number(data.amount);
        sp.balanceOutstanding = Math.max(0, (sp.totalCommissionEarned || 0) - sp.totalCommissionPaid);
      }
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, creating local partner payout", err);
  }

  const sp = MOCK_SALES_PARTNERS.find((p) => p.id === data.salesPartnerId);
  const payout: SalesPartnerPayout = {
    id: `payout-${Date.now()}`,
    payoutNumber: `PAYOUT-${Date.now() % 100000}`,
    salesPartnerId: data.salesPartnerId,
    salesPartnerName: sp ? sp.partnerName : "Unknown Partner",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    amount: Number(data.amount),
    referenceNote: data.referenceNote || "Commission settlement",
    paymentMode: data.paymentMode || "Bank Transfer",
    createdAt: new Date().toISOString(),
  };

  MOCK_PARTNER_PAYOUTS.unshift(payout);
  if (sp) {
    sp.totalCommissionPaid = (sp.totalCommissionPaid || 0) + Number(data.amount);
    sp.balanceOutstanding = Math.max(0, (sp.totalCommissionEarned || 0) - sp.totalCommissionPaid);
  }
  return payout;
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

// ------------------------------------------------------------------------------
// SALES <-> HRM INTEGRATION CLIENT METHODS
// ------------------------------------------------------------------------------

export async function getHrmSalesEmployees(): Promise<any[]> {
  try {
    const res = await fetch(`http://localhost:8081/api/v1/hrm-integration/sales-employees`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  // Fallback to local storage or unified seed
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("NEXTGEN_HRM_EMPLOYEES");
      if (stored) {
        const emps = JSON.parse(stored);
        if (Array.isArray(emps) && emps.length > 0) {
          return emps.map((e: any) => ({
            id: e.id,
            employeeCode: e.employeeCode,
            fullName: `${e.firstName} ${e.lastName}`,
            workEmail: e.workEmail,
            cellNumber: e.cellNumber,
            departmentName: e.department?.departmentName || "Sales & Business Dev",
            designationName: e.designation?.designationName || "Sales Representative",
            status: e.status || "ACTIVE",
          }));
        }
      }
    } catch (e) {}
  }

  return [
    {
      id: "44444444-1111-1111-1111-111111111101",
      employeeCode: "EMP-001",
      fullName: "Alexander Wright",
      workEmail: "a.wright@nextgenerp.io",
      cellNumber: "+91 98111 22334",
      departmentName: "Global Sales & Business Dev",
      designationName: "Enterprise Sales Director",
      status: "ACTIVE",
    },
    {
      id: "44444444-1111-1111-1111-111111111102",
      employeeCode: "EMP-002",
      fullName: "Sarah Jenkins",
      workEmail: "s.jenkins@nextgenerp.io",
      cellNumber: "+91 98222 33445",
      departmentName: "Global Sales & Business Dev",
      designationName: "Senior Account Executive",
      status: "ACTIVE",
    },
    {
      id: "44444444-1111-1111-1111-111111111103",
      employeeCode: "EMP-005",
      fullName: "Alex Rivera",
      workEmail: "a.rivera@nextgenerp.io",
      cellNumber: "+91 98555 66778",
      departmentName: "Global Sales & Business Dev",
      designationName: "Solutions Engineer & Sales",
      status: "ACTIVE",
    },
  ];
}

export async function getClientExpenseClaims(customerName?: string): Promise<any[]> {
  try {
    const res = await fetch(`http://localhost:8081/api/v1/hrm-integration/customer-expenses?customerName=${encodeURIComponent(customerName || "")}`);
    if (res.ok) {
      const data = await res.json();
      return data.claims || [];
    }
  } catch (err) {}

  // Fallback to local storage or sample dataset
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("NEXTGEN_HRM_EXPENSES");
      if (stored) {
        const claims = JSON.parse(stored);
        if (Array.isArray(claims)) {
          return claims.filter((c: any) => !customerName || (c.customerName && c.customerName.toLowerCase().includes(customerName.toLowerCase())));
        }
      }
    } catch (e) {}
  }

  return [
    {
      id: "exp-001",
      claimNumber: "EXP-2026-0001",
      employeeName: "Sarah Jenkins",
      expenseType: "Client Travel & Accommodation",
      totalAmount: 1850.0,
      claimDate: "2026-08-20",
      status: "APPROVED",
      customerName: "Apex Global Technologies LLC",
      salesOrderId: "SAL-ORD-2026-0001",
      isBillable: true,
    },
    {
      id: "exp-002",
      claimNumber: "EXP-2026-0002",
      employeeName: "Alexander Wright",
      expenseType: "Customer Dinner & Entertainment",
      totalAmount: 640.0,
      claimDate: "2026-08-18",
      status: "PAID",
      customerName: "Apex Global Technologies LLC",
      salesOrderId: "SAL-ORD-2026-0001",
      isBillable: true,
    },
  ].filter((c) => !customerName || c.customerName.toLowerCase().includes(customerName.toLowerCase()));
}

// --- Drop Shipping & Purchase Requisitions ---
let MOCK_PURCHASE_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: "preq-001",
    requisitionNumber: "PREQ-2026-001",
    salesOrderId: "11111111-1111-1111-1111-111111111101",
    salesOrderNumber: "SAL-ORD-2026-001",
    customerId: "cust-001",
    customerName: "Acme Industrial Technologies Ltd",
    shippingAddress: "100 Tech Enterprise Blvd, Suite 400, New York, NY 10001",
    supplierName: "OmniTech Hardware Supplies",
    requisitionType: "DROP_SHIP",
    status: "ORDERED",
    transactionDate: "2026-09-01",
    requiredDate: "2026-09-15",
    totalQty: 5,
    netTotal: 125000,
    notes: "Direct supplier delivery to customer factory site",
    items: [
      {
        id: "preq-item-001",
        itemCode: "IND-ROUTER-X1",
        itemName: "Industrial Edge IoT Gateway Router",
        qty: 5,
        rate: 25000,
        amount: 125000,
        uom: "Nos",
        supplierName: "OmniTech Hardware Supplies",
      },
    ],
    createdAt: "2026-09-01T10:00:00Z",
  },
];

export async function getPurchaseRequisitions(salesOrderId?: string): Promise<PurchaseRequisition[]> {
  try {
    const url = salesOrderId
      ? `${API_BASE}/purchase-requisitions/by-order/${salesOrderId}`
      : `${API_BASE}/purchase-requisitions`;
    const res = await fetch(url, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local mock purchase requisitions", err);
  }
  if (salesOrderId) {
    return MOCK_PURCHASE_REQUISITIONS.filter((r) => r.salesOrderId === salesOrderId);
  }
  return MOCK_PURCHASE_REQUISITIONS;
}

export async function createDropShipRequisitionFromSalesOrder(salesOrderId: string): Promise<PurchaseRequisition[]> {
  try {
    const res = await fetch(`${API_BASE}/purchase-requisitions/from-sales-order/${salesOrderId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const created = await res.json();
      if (Array.isArray(created)) {
        created.forEach((r) => MOCK_PURCHASE_REQUISITIONS.unshift(r));
      }
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, generating local drop-ship requisitions", err);
  }

  const order = MOCK_ORDERS.find((o) => o.id === salesOrderId);
  if (!order) throw new Error("Sales order not found");

  const dropShipItems = (order.items || []).filter((i) => Boolean(i.deliveredBySupplier));
  if (dropShipItems.length === 0) {
    // If none explicitly flagged, create one for demonstration
    dropShipItems.push(order.items[0]);
  }

  const newReq: PurchaseRequisition = {
    id: `preq-${Date.now()}`,
    requisitionNumber: `PREQ-${Date.now() % 100000}`,
    salesOrderId: order.id,
    salesOrderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    shippingAddress: "Customer Primary Receiving Dock, Main Hub",
    supplierName: dropShipItems[0].supplier || "OmniTech Hardware Supplies",
    requisitionType: "DROP_SHIP",
    status: "DRAFT",
    transactionDate: new Date().toISOString().split("T")[0],
    requiredDate: order.deliveryDate,
    totalQty: dropShipItems.reduce((acc, i) => acc + i.qty, 0),
    netTotal: dropShipItems.reduce((acc, i) => acc + i.qty * i.rate, 0),
    notes: `Drop Ship Requisition generated for Sales Order ${order.orderNumber}`,
    items: dropShipItems.map((i, idx) => ({
      id: `preq-item-${Date.now()}-${idx}`,
      salesOrderItemId: i.id,
      itemCode: i.itemCode,
      itemName: i.itemName,
      qty: i.qty,
      rate: i.rate,
      amount: i.qty * i.rate,
      uom: i.uom || "Nos",
      supplierName: i.supplier || "OmniTech Hardware Supplies",
    })),
    createdAt: new Date().toISOString(),
  };

  MOCK_PURCHASE_REQUISITIONS.unshift(newReq);
  return [newReq];
}

export async function submitPurchaseRequisition(id: string): Promise<PurchaseRequisition> {
  try {
    const res = await fetch(`${API_BASE}/purchase-requisitions/${id}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating local requisition status", err);
  }
  const req = MOCK_PURCHASE_REQUISITIONS.find((r) => r.id === id);
  if (req) req.status = "SUBMITTED";
  return req || MOCK_PURCHASE_REQUISITIONS[0];
}

export async function orderPurchaseRequisition(id: string): Promise<PurchaseRequisition> {
  try {
    const res = await fetch(`${API_BASE}/purchase-requisitions/${id}/order-from-supplier`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating local requisition status", err);
  }
  const req = MOCK_PURCHASE_REQUISITIONS.find((r) => r.id === id);
  if (req) req.status = "ORDERED";
  return req || MOCK_PURCHASE_REQUISITIONS[0];
}

export async function confirmPurchaseRequisitionDelivery(id: string): Promise<PurchaseRequisition> {
  try {
    const res = await fetch(`${API_BASE}/purchase-requisitions/${id}/confirm-delivery`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, confirming local delivery", err);
  }
  const req = MOCK_PURCHASE_REQUISITIONS.find((r) => r.id === id);
  if (req) {
    req.status = "DELIVERED";
    if (req.salesOrderId) {
      const order = MOCK_ORDERS.find((o) => o.id === req.salesOrderId);
      if (order) {
        order.perDelivered = 100;
        order.deliveryStatus = "FULLY_DELIVERED";
        if (order.perBilled && order.perBilled >= 100) {
          order.status = "COMPLETED";
        }
      }
    }
  }
  return req || MOCK_PURCHASE_REQUISITIONS[0];
}

export async function cancelPurchaseRequisition(id: string): Promise<PurchaseRequisition> {
  try {
    const res = await fetch(`${API_BASE}/purchase-requisitions/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, cancelling local requisition", err);
  }
  const req = MOCK_PURCHASE_REQUISITIONS.find((r) => r.id === id);
  if (req) req.status = "CANCELLED";
  return req || MOCK_PURCHASE_REQUISITIONS[0];
}

// =============================================================
// Maintenance & Warranty Contracts (AMC) API & Mock Data
// =============================================================

export const MOCK_MAINTENANCE_CONTRACTS: MaintenanceContract[] = [
  {
    id: "mc-001",
    contractNumber: "MC-2026-0001",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    contractType: "AMC",
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    totalAmount: 45000,
    invoicedAmount: 45000,
    termsAndConditions: "Standard 24x7 4-hour SLA on-site hardware support with quarterly preventive health checkups.",
    items: [
      {
        id: "mci-001",
        itemCode: "ERP-SRV-9000",
        itemName: "NextGen Cloud ERP Enterprise Rack Server",
        serialNo: "SRV-2026-081",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        periodicity: "QUARTERLY",
        noOfVisits: 4,
        rate: 45000,
        amount: 45000,
      },
    ],
    createdAt: "2026-01-01T10:00:00Z",
  },
  {
    id: "mc-002",
    contractNumber: "MC-2026-0002",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "BlueFin Dynamics International",
    contractType: "AMC",
    status: "ACTIVE",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    totalAmount: 32000,
    invoicedAmount: 16000,
    termsAndConditions: "Semi-annual print-head calibration and optical cleaning. Spare parts billed separately if out of warranty.",
    items: [
      {
        id: "mci-002",
        itemCode: "PRN-IND-500",
        itemName: "Industrial Thermal Label Printer",
        serialNo: "PRN-8821",
        startDate: "2026-03-01",
        endDate: "2027-02-28",
        periodicity: "HALF_YEARLY",
        noOfVisits: 2,
        rate: 32000,
        amount: 32000,
      },
    ],
    createdAt: "2026-03-01T11:30:00Z",
  },
  {
    id: "mc-003",
    contractNumber: "MC-2026-0003",
    customerId: "77777777-7777-7777-7777-777777777703",
    customerName: "Zenith Logistics Pvt Ltd",
    contractType: "COMPREHENSIVE_AMC",
    status: "DRAFT",
    startDate: "2026-06-01",
    endDate: "2027-05-31",
    totalAmount: 18000,
    invoicedAmount: 0,
    termsAndConditions: "Monthly inspection of 10 handheld scan terminals including lithium battery health checks.",
    items: [
      {
        id: "mci-003",
        itemCode: "BC-SCAN-X1",
        itemName: "Barcode Handheld Scanner Terminal",
        serialNo: "SCN-4410",
        startDate: "2026-06-01",
        endDate: "2027-05-31",
        periodicity: "MONTHLY",
        noOfVisits: 12,
        rate: 18000,
        amount: 18000,
      },
    ],
    createdAt: "2026-05-25T14:15:00Z",
  },
];

export const MOCK_MAINTENANCE_VISITS: MaintenanceVisit[] = [
  {
    id: "mv-001",
    visitNumber: "MV-2026-0001",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    maintenanceContractId: "mc-001",
    maintenanceType: "PREVENTIVE_MAINTENANCE",
    visitDate: "2026-09-15",
    servicePerson: "Vikram Patel",
    status: "COMPLETED",
    customerFeedback: "Highly Satisfied",
    completionNotes: "Performed Q3 preventive maintenance checkup. Replaced CPU thermal paste, inspected fan bearings, diagnostic memory test passed 100%.",
    items: [
      {
        id: "mvi-001",
        itemCode: "ERP-SRV-9000",
        itemName: "NextGen Cloud ERP Enterprise Rack Server",
        serialNo: "SRV-2026-081",
        workDone: "Full chassis dust blow-out, BIOS firmware patched to v2.4, diagnostics run.",
        actionTaken: "Cleaned and verified normal operating temperature.",
      },
    ],
    createdAt: "2026-09-15T09:00:00Z",
  },
  {
    id: "mv-002",
    visitNumber: "MV-2026-0002",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "BlueFin Dynamics International",
    maintenanceContractId: "mc-002",
    maintenanceType: "PREVENTIVE_MAINTENANCE",
    visitDate: "2026-09-28",
    servicePerson: "Anand Sharma",
    status: "SCHEDULED",
    customerFeedback: undefined,
    completionNotes: undefined,
    items: [
      {
        id: "mvi-002",
        itemCode: "PRN-IND-500",
        itemName: "Industrial Thermal Label Printer",
        serialNo: "PRN-8821",
        workDone: "Scheduled semi-annual print-head calibration and feed roller check.",
      },
    ],
    createdAt: "2026-09-20T10:30:00Z",
  },
  {
    id: "mv-003",
    visitNumber: "MV-2026-0003",
    customerId: "77777777-7777-7777-7777-777777777701",
    customerName: "Apex Global Technologies LLC",
    maintenanceContractId: "mc-001",
    maintenanceType: "BREAKDOWN",
    visitDate: "2026-09-24",
    servicePerson: "Suresh Mehta",
    status: "IN_PROGRESS",
    customerFeedback: undefined,
    completionNotes: "Dual redundant power supply unit PSU-2 showing voltage fluctuation alarms. Investigating field replacement.",
    items: [
      {
        id: "mvi-003",
        itemCode: "ERP-SRV-9000",
        itemName: "NextGen Cloud ERP Enterprise Rack Server",
        serialNo: "SRV-2026-081",
        workDone: "Voltage diagnostics on 850W titanium power rails.",
        actionTaken: "Bypassed to primary PSU-1; awaiting replacement hot-swap PSU module.",
      },
    ],
    createdAt: "2026-09-24T08:15:00Z",
  },
];

export const MOCK_WARRANTY_CLAIMS: WarrantyClaim[] = [
  {
    id: "wc-001",
    claimNumber: "WC-2026-0001",
    customerId: "77777777-7777-7777-7777-777777777703",
    customerName: "Zenith Logistics Pvt Ltd",
    itemCode: "BC-SCAN-X1",
    itemName: "Barcode Handheld Scanner Terminal",
    serialNo: "SCN-4410",
    complaintDescription: "Laser optic scanning engine fails to read Code128 barcodes at distances beyond 2 meters. Unit is 4 months old.",
    status: "IN_INSPECTION",
    resolutionType: "REPAIR",
    resolutionNotes: "Dispatched to regional service bench for optical diode recalibration.",
    reportedDate: "2026-09-18",
    createdAt: "2026-09-18T11:00:00Z",
  },
  {
    id: "wc-002",
    claimNumber: "WC-2026-0002",
    customerId: "77777777-7777-7777-7777-777777777702",
    customerName: "BlueFin Dynamics International",
    itemCode: "PRN-IND-500",
    itemName: "Industrial Thermal Label Printer",
    serialNo: "PRN-8821",
    complaintDescription: "Label feed gear teeth chipped after 2 weeks of operation, causing continuous feed jams.",
    status: "RESOLVED",
    resolutionType: "REPLACEMENT",
    resolutionNotes: "Replaced complete drive-gear assembly free of charge under warranty. Print tests run cleanly.",
    reportedDate: "2026-09-10",
    resolvedDate: "2026-09-14",
    createdAt: "2026-09-10T14:30:00Z",
  },
];

// Contracts API
export async function getMaintenanceContracts(): Promise<MaintenanceContract[]> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/contracts`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock maintenance contracts", err);
  }
  return MOCK_MAINTENANCE_CONTRACTS;
}

export async function createMaintenanceContract(data: any): Promise<MaintenanceContract> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_MAINTENANCE_CONTRACTS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, storing maintenance contract locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const items = (data.items || []).map((i: any, idx: number) => ({
    id: `mci-${Date.now()}-${idx}`,
    itemCode: i.itemCode,
    itemName: i.itemName,
    serialNo: i.serialNo || "",
    startDate: i.startDate || data.startDate,
    endDate: i.endDate || data.endDate,
    periodicity: i.periodicity || "QUARTERLY",
    noOfVisits: Number(i.noOfVisits) || 4,
    rate: Number(i.rate) || 0,
    amount: Number(i.rate) || 0,
  }));
  const totalAmount = items.reduce((acc: number, item: any) => acc + item.amount, 0);

  const newContract: MaintenanceContract = {
    id: `mc-${Date.now()}`,
    contractNumber: `MC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    contractType: data.contractType || "AMC",
    status: "DRAFT",
    startDate: data.startDate,
    endDate: data.endDate,
    totalAmount,
    invoicedAmount: 0,
    termsAndConditions: data.termsAndConditions || "Standard maintenance agreement.",
    items,
    createdAt: new Date().toISOString(),
  };

  MOCK_MAINTENANCE_CONTRACTS.unshift(newContract);
  return newContract;
}

export async function activateMaintenanceContract(id: string): Promise<MaintenanceContract> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/contracts/${id}/activate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, activating local contract", err);
  }
  const c = MOCK_MAINTENANCE_CONTRACTS.find((item) => item.id === id);
  if (c) c.status = "ACTIVE";
  return c || MOCK_MAINTENANCE_CONTRACTS[0];
}

export async function cancelMaintenanceContract(id: string): Promise<MaintenanceContract> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/contracts/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, cancelling local contract", err);
  }
  const c = MOCK_MAINTENANCE_CONTRACTS.find((item) => item.id === id);
  if (c) c.status = "CANCELLED";
  return c || MOCK_MAINTENANCE_CONTRACTS[0];
}

// Visits API
export async function getMaintenanceVisits(): Promise<MaintenanceVisit[]> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/visits`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock maintenance visits", err);
  }
  return MOCK_MAINTENANCE_VISITS;
}

export async function createMaintenanceVisit(data: any): Promise<MaintenanceVisit> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_MAINTENANCE_VISITS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, scheduling visit locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const items = (data.items || []).map((i: any, idx: number) => ({
    id: `mvi-${Date.now()}-${idx}`,
    itemCode: i.itemCode,
    itemName: i.itemName,
    serialNo: i.serialNo || "",
    workDone: i.workDone || "",
    actionTaken: i.actionTaken || "",
    partsReplaced: i.partsReplaced || "",
  }));

  const newVisit: MaintenanceVisit = {
    id: `mv-${Date.now()}`,
    visitNumber: `MV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    maintenanceContractId: data.maintenanceContractId || undefined,
    maintenanceType: data.maintenanceType || "PREVENTIVE_MAINTENANCE",
    visitDate: data.visitDate || new Date().toISOString().split("T")[0],
    servicePerson: data.servicePerson || "Field Technician",
    status: "SCHEDULED",
    customerFeedback: undefined,
    completionNotes: data.completionNotes || "",
    items,
    createdAt: new Date().toISOString(),
  };

  MOCK_MAINTENANCE_VISITS.unshift(newVisit);
  return newVisit;
}

export async function startMaintenanceVisit(id: string): Promise<MaintenanceVisit> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/visits/${id}/start`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, updating local visit status", err);
  }
  const v = MOCK_MAINTENANCE_VISITS.find((item) => item.id === id);
  if (v) v.status = "IN_PROGRESS";
  return v || MOCK_MAINTENANCE_VISITS[0];
}

export async function completeMaintenanceVisit(id: string, feedback?: string, notes?: string): Promise<MaintenanceVisit> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/visits/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ feedback, notes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, completing local visit", err);
  }
  const v = MOCK_MAINTENANCE_VISITS.find((item) => item.id === id);
  if (v) {
    v.status = "COMPLETED";
    if (feedback) v.customerFeedback = feedback;
    if (notes) v.completionNotes = notes;
  }
  return v || MOCK_MAINTENANCE_VISITS[0];
}

export async function cancelMaintenanceVisit(id: string): Promise<MaintenanceVisit> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/visits/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, cancelling local visit", err);
  }
  const v = MOCK_MAINTENANCE_VISITS.find((item) => item.id === id);
  if (v) v.status = "CANCELLED";
  return v || MOCK_MAINTENANCE_VISITS[0];
}

// Warranty Claims API
export async function getWarrantyClaims(): Promise<WarrantyClaim[]> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/claims`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock warranty claims", err);
  }
  return MOCK_WARRANTY_CLAIMS;
}

export async function createWarrantyClaim(data: any): Promise<WarrantyClaim> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      MOCK_WARRANTY_CLAIMS.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, filing claim locally", err);
  }

  const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
  const newClaim: WarrantyClaim = {
    id: `wc-${Date.now()}`,
    claimNumber: `WC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: data.customerId,
    customerName: cust ? cust.customerName : "Customer Account",
    itemCode: data.itemCode,
    itemName: data.itemName,
    serialNo: data.serialNo || "",
    complaintDescription: data.complaintDescription,
    status: "OPEN",
    resolutionType: data.resolutionType || "REPAIR",
    reportedDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  };

  MOCK_WARRANTY_CLAIMS.unshift(newClaim);
  return newClaim;
}

export async function resolveWarrantyClaim(id: string, resolutionType: string, notes?: string): Promise<WarrantyClaim> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/claims/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ resolutionType, notes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, resolving claim locally", err);
  }
  const c = MOCK_WARRANTY_CLAIMS.find((item) => item.id === id);
  if (c) {
    c.status = "RESOLVED";
    c.resolutionType = resolutionType;
    c.resolutionNotes = notes;
    c.resolvedDate = new Date().toISOString().split("T")[0];
  }
  return c || MOCK_WARRANTY_CLAIMS[0];
}

export async function closeWarrantyClaim(id: string): Promise<WarrantyClaim> {
  try {
    const res = await fetch(`${API_BASE}/maintenance/claims/${id}/close`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, closing claim locally", err);
  }
  const c = MOCK_WARRANTY_CLAIMS.find((item) => item.id === id);
  if (c) c.status = "CLOSED";
  return c || MOCK_WARRANTY_CLAIMS[0];
}

// ==========================================
// PAYMENT TERMS TEMPLATES & MILESTONE SCHEDULES
// ==========================================

const MOCK_PAYMENT_TERMS_TEMPLATES: PaymentTermsTemplate[] = [
  {
    id: "ptt-001",
    templateName: "30-50-20 Milestone Schedule",
    description: "30% Advance on order, 50% on delivery note, 20% Net 30 Days",
    isActive: true,
    items: [
      { id: "ptti-001", paymentTermName: "30% Advance Deposit", invoicePortion: 30.0, creditDays: 0, creditMonths: 0 },
      { id: "ptti-002", paymentTermName: "50% Dispatch & Delivery", invoicePortion: 50.0, creditDays: 14, creditMonths: 0 },
      { id: "ptti-003", paymentTermName: "20% Final Settlement (Net 30)", invoicePortion: 20.0, creditDays: 44, creditMonths: 0 },
    ],
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "ptt-002",
    templateName: "50-50 Advance & Delivery",
    description: "50% Advance on contract, 50% on product delivery",
    isActive: true,
    items: [
      { id: "ptti-004", paymentTermName: "50% Advance Booking", invoicePortion: 50.0, creditDays: 0, creditMonths: 0 },
      { id: "ptti-005", paymentTermName: "50% Upon Delivery (Net 15)", invoicePortion: 50.0, creditDays: 15, creditMonths: 0 },
    ],
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "ptt-003",
    templateName: "100% Advance",
    description: "100% payment required prior to dispatch or order fulfillment",
    isActive: true,
    items: [
      { id: "ptti-006", paymentTermName: "Full Advance Payment", invoicePortion: 100.0, creditDays: 0, creditMonths: 0 },
    ],
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "ptt-004",
    templateName: "Net 30 Days",
    description: "Standard 30-day post-delivery commercial credit terms",
    isActive: true,
    items: [
      { id: "ptti-007", paymentTermName: "Net 30 Days", invoicePortion: 100.0, creditDays: 30, creditMonths: 0 },
    ],
    createdAt: "2026-08-01T10:00:00Z",
  },
];

const MOCK_PAYMENT_SCHEDULES: PaymentSchedule[] = [
  {
    id: "ps-001",
    voucherType: "SALES_ORDER",
    voucherId: "99999999-9999-9999-9999-999999999901",
    paymentTerm: "30% Advance Deposit",
    description: "Milestone portion (30.00%) for SAL-ORD-2026-0001",
    dueDate: "2026-08-22",
    invoicePortion: 30.0,
    paymentAmount: 9742.50,
    paidAmount: 9742.50,
    outstandingAmount: 0.0,
    status: "PAID",
    salesInvoiceId: "inv-9901",
    salesInvoiceNumber: "ACC-SINV-2026-0001",
  },
  {
    id: "ps-002",
    voucherType: "SALES_ORDER",
    voucherId: "99999999-9999-9999-9999-999999999901",
    paymentTerm: "50% Dispatch & Delivery",
    description: "Milestone portion (50.00%) for SAL-ORD-2026-0001",
    dueDate: "2026-09-05",
    invoicePortion: 50.0,
    paymentAmount: 16237.50,
    paidAmount: 0.0,
    outstandingAmount: 16237.50,
    status: "UNPAID",
  },
  {
    id: "ps-003",
    voucherType: "SALES_ORDER",
    voucherId: "99999999-9999-9999-9999-999999999901",
    paymentTerm: "20% Final Settlement (Net 30)",
    description: "Milestone portion (20.00%) for SAL-ORD-2026-0001",
    dueDate: "2026-10-05",
    invoicePortion: 20.0,
    paymentAmount: 6495.00,
    paidAmount: 0.0,
    outstandingAmount: 6495.00,
    status: "UNPAID",
  },
];

export async function getPaymentTermsTemplates(): Promise<PaymentTermsTemplate[]> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/templates`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock payment terms templates", err);
  }
  return MOCK_PAYMENT_TERMS_TEMPLATES;
}

export async function getPaymentTermsTemplateById(id: string): Promise<PaymentTermsTemplate | null> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/templates/${id}`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock template", err);
  }
  return MOCK_PAYMENT_TERMS_TEMPLATES.find((t) => t.id === id) || null;
}

export async function createPaymentTermsTemplate(data: PaymentTermsTemplateCreateRequest): Promise<PaymentTermsTemplate> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, creating template locally", err);
  }
  const newTemplate: PaymentTermsTemplate = {
    id: `ptt-${Date.now()}`,
    templateName: data.templateName,
    description: data.description,
    isActive: true,
    items: data.items.map((it, idx) => ({
      id: `ptti-${Date.now()}-${idx}`,
      paymentTermName: it.paymentTermName,
      invoicePortion: Number(it.invoicePortion),
      creditDays: it.creditDays || 0,
      creditMonths: it.creditMonths || 0,
    })),
    createdAt: new Date().toISOString(),
  };
  MOCK_PAYMENT_TERMS_TEMPLATES.push(newTemplate);
  return newTemplate;
}

export async function getPaymentSchedulesForVoucher(voucherType: string, voucherId: string): Promise<PaymentSchedule[]> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/schedules/${voucherType}/${voucherId}`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, fetching mock payment schedule", err);
  }
  return MOCK_PAYMENT_SCHEDULES.filter((s) => s.voucherType === voucherType && s.voucherId === voucherId);
}

export async function generateOrderPaymentSchedule(salesOrderId: string): Promise<PaymentSchedule[]> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/schedules/generate/sales-order/${salesOrderId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, generating payment schedule locally", err);
  }

  const order = MOCK_ORDERS.find((o) => o.id === salesOrderId);
  const templateName = order?.paymentTermsTemplate || "30-50-20 Milestone Schedule";
  const template = MOCK_PAYMENT_TERMS_TEMPLATES.find((t) => t.templateName === templateName) || MOCK_PAYMENT_TERMS_TEMPLATES[0];

  for (let i = MOCK_PAYMENT_SCHEDULES.length - 1; i >= 0; i--) {
    if (MOCK_PAYMENT_SCHEDULES[i].voucherType === "SALES_ORDER" && MOCK_PAYMENT_SCHEDULES[i].voucherId === salesOrderId) {
      MOCK_PAYMENT_SCHEDULES.splice(i, 1);
    }
  }

  const grandTotal = order?.grandTotal || 10000;
  const baseDate = order?.transactionDate ? new Date(order.transactionDate) : new Date();
  let allocated = 0;
  const newSchedules: PaymentSchedule[] = [];

  for (let idx = 0; idx < template.items.length; idx++) {
    const item = template.items[idx];
    let amount: number;
    if (idx === template.items.length - 1) {
      amount = Math.round((grandTotal - allocated) * 100) / 100;
    } else {
      amount = Math.round(((grandTotal * item.invoicePortion) / 100) * 100) / 100;
      allocated += amount;
    }

    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + (item.creditDays || 0) + (item.creditMonths || 0) * 30);

    const s: PaymentSchedule = {
      id: `ps-${Date.now()}-${idx}`,
      voucherType: "SALES_ORDER",
      voucherId: salesOrderId,
      paymentTerm: item.paymentTermName,
      description: `Milestone portion (${item.invoicePortion}%) for ${order?.orderNumber || "Order"}`,
      dueDate: dueDate.toISOString().split("T")[0],
      invoicePortion: item.invoicePortion,
      paymentAmount: amount,
      paidAmount: 0,
      outstandingAmount: amount,
      status: "UNPAID",
      createdAt: new Date().toISOString(),
    };
    newSchedules.push(s);
    MOCK_PAYMENT_SCHEDULES.push(s);
  }

  return newSchedules;
}

export async function invoicePaymentMilestone(salesOrderId: string, scheduleId: string): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE}/payment-terms/schedules/${salesOrderId}/milestone/${scheduleId}/invoice`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, invoicing milestone locally", err);
  }

  const schedule = MOCK_PAYMENT_SCHEDULES.find((s) => s.id === scheduleId);
  const order = MOCK_ORDERS.find((o) => o.id === salesOrderId);

  const invoiceNumber = `ACC-SINV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const invId = `inv-${Date.now()}`;

  const newInvoice: SalesInvoice = {
    id: invId,
    invoiceNumber,
    customerId: order?.customerId || "77777777-7777-7777-7777-777777777701",
    customerName: order?.customerName || "Customer Account",
    postingDate: new Date().toISOString().split("T")[0],
    dueDate: schedule?.dueDate || new Date().toISOString().split("T")[0],
    salesOrderId: salesOrderId,
    salesOrderNumber: order?.orderNumber,
    status: "UNPAID",
    currency: order?.currency || "INR",
    conversionRate: 1.0,
    netTotal: schedule?.paymentAmount || 5000,
    totalTax: 0,
    grandTotal: schedule?.paymentAmount || 5000,
    paidAmount: 0,
    outstandingAmount: schedule?.paymentAmount || 5000,
    items: [
      {
        id: `sii-${Date.now()}`,
        itemId: "44444444-4444-4444-4444-444444444401",
        itemCode: "MILESTONE-BILL",
        itemName: `${schedule?.paymentTerm || "Milestone"} (${schedule?.invoicePortion || 0}%) - ${order?.orderNumber || ""}`,
        qty: 1,
        rate: schedule?.paymentAmount || 5000,
        amount: schedule?.paymentAmount || 5000,
        incomeAccount: "Sales - Rev",
      },
    ],
    taxes: [],
    createdAt: new Date().toISOString(),
  };

  MOCK_INVOICES.unshift(newInvoice);

  if (schedule) {
    schedule.status = "INVOICED";
    schedule.salesInvoiceId = invId;
    schedule.salesInvoiceNumber = invoiceNumber;
  }

  if (order) {
    const milestones = MOCK_PAYMENT_SCHEDULES.filter((s) => s.voucherType === "SALES_ORDER" && s.voucherId === salesOrderId);
    const invoicedSum = milestones
      .filter((m) => m.status === "INVOICED" || m.status === "PAID")
      .reduce((sum, m) => sum + m.invoicePortion, 0);
    order.perBilled = Math.min(100, invoicedSum);
    if (order.perBilled >= 100) {
      order.billingStatus = "FULLY_BILLED";
      if (order.perDelivered >= 100) order.status = "COMPLETED";
    } else if (order.perBilled > 0) {
      order.billingStatus = "PARTLY_BILLED";
    }
  }

  return newInvoice;
}

// ==========================================
// PACKING SLIPS & SHIPMENT PACKAGING (SPRINT 8)
// ==========================================

let MOCK_PACKING_SLIPS: PackingSlip[] = [
  {
    id: "ps-001",
    packingSlipNumber: "PS-2026-0001",
    deliveryNoteId: "dn-001",
    deliveryNoteNumber: "DN-2026-0001",
    fromPackageNo: 1,
    toPackageNo: 2,
    totalPackages: 2,
    packageType: "Carton",
    netWeightPkg: 24.500,
    grossWeightPkg: 27.200,
    weightUom: "Kg",
    letterOfCredit: "LC-VANGUARD-2026",
    shippingMark: "VANGUARD / SAN JOSE / PKG 1-2 / FRAGILE / HANDLE WITH CARE",
    status: "PACKED",
    notes: "Cartons 1-2 packed with 4x 2U Edge Server units and foam corner protection inserts.",
    items: [
      {
        id: "psi-001",
        deliveryNoteItemId: "dni-1",
        itemCode: "SRV-RACK-2U",
        itemName: "NextGen Edge Server Appliance 2U",
        qty: 4,
        netWeight: 24.500,
        weightUom: "Kg",
      },
    ],
    createdAt: "2026-08-24T12:30:00Z",
  },
];

export async function getPackingSlips(deliveryNoteId?: string): Promise<PackingSlip[]> {
  try {
    const url = deliveryNoteId
      ? `${API_BASE}/packing-slips/delivery-note/${deliveryNoteId}`
      : `${API_BASE}/packing-slips`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock packing slips", err);
  }
  if (deliveryNoteId) {
    return MOCK_PACKING_SLIPS.filter((p) => p.deliveryNoteId === deliveryNoteId);
  }
  return MOCK_PACKING_SLIPS;
}

export async function getPackingSlipById(id: string): Promise<PackingSlip | null> {
  try {
    const res = await fetch(`${API_BASE}/packing-slips/${id}`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, finding mock packing slip", err);
  }
  return MOCK_PACKING_SLIPS.find((p) => p.id === id) || null;
}

export async function createPackingSlip(data: PackingSlipCreateRequest): Promise<PackingSlip> {
  try {
    const res = await fetch(`${API_BASE}/packing-slips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, creating packing slip locally", err);
  }

  const dn = MOCK_DELIVERY_NOTES.find((d) => d.id === data.deliveryNoteId);
  const fromPkg = data.fromPackageNo || 1;
  const toPkg = data.toPackageNo || fromPkg;
  const totalPkgs = toPkg - fromPkg + 1;

  let calculatedNet = 0;
  for (const it of data.items) {
    calculatedNet += it.netWeight || 0;
  }
  const netWeight = data.netWeightPkg || calculatedNet;
  const grossWeight = data.grossWeightPkg || Math.round(netWeight * 1.1 * 100) / 100;

  const newSlip: PackingSlip = {
    id: `ps-${Date.now()}`,
    packingSlipNumber: `PS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    deliveryNoteId: data.deliveryNoteId,
    deliveryNoteNumber: dn?.deliveryNoteNumber || "DN-2026-XXXX",
    fromPackageNo: fromPkg,
    toPackageNo: toPkg,
    totalPackages: totalPkgs,
    packageType: data.packageType || "Carton",
    netWeightPkg: netWeight,
    grossWeightPkg: grossWeight,
    weightUom: data.weightUom || "Kg",
    letterOfCredit: data.letterOfCredit,
    shippingMark: data.shippingMark,
    status: "PACKED",
    notes: data.notes,
    items: data.items.map((it, idx) => ({
      id: `psi-${Date.now()}-${idx}`,
      deliveryNoteItemId: it.deliveryNoteItemId,
      itemCode: it.itemCode,
      itemName: it.itemName,
      qty: it.qty,
      netWeight: it.netWeight || 0,
      weightUom: it.weightUom || "Kg",
      productBundleItemCode: it.productBundleItemCode,
    })),
    createdAt: new Date().toISOString(),
  };

  MOCK_PACKING_SLIPS.unshift(newSlip);
  return newSlip;
}

export async function shipPackingSlip(id: string): Promise<PackingSlip> {
  try {
    const res = await fetch(`${API_BASE}/packing-slips/${id}/ship`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, marking packing slip shipped locally", err);
  }

  const ps = MOCK_PACKING_SLIPS.find((p) => p.id === id);
  if (ps) {
    ps.status = "SHIPPED";
    ps.updatedAt = new Date().toISOString();
  }
  return ps || MOCK_PACKING_SLIPS[0];
}

export async function deletePackingSlip(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/packing-slips/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Backend unavailable, deleting packing slip locally", err);
  }

  MOCK_PACKING_SLIPS = MOCK_PACKING_SLIPS.filter((p) => p.id !== id);
  return true;
}

// ==========================================
// SALES TEAM MULTI-ALLOCATIONS (SPRINT 9)
// ==========================================

let MOCK_SALES_TEAM_MEMBERS: SalesTeamMember[] = [
  {
    id: "stm-001",
    voucherType: "SALES_ORDER",
    voucherId: "99999999-9999-9999-9999-999999999901",
    salesPersonId: "sp-001",
    salesPersonName: "Alexander Wright",
    allocatedPercentage: 70.0,
    allocatedAmount: 22732.50,
    commissionRate: 5.0,
    incentives: 1136.63,
    createdAt: "2026-08-22T10:00:00Z",
  },
  {
    id: "stm-002",
    voucherType: "SALES_ORDER",
    voucherId: "99999999-9999-9999-9999-999999999901",
    salesPersonId: "sp-002",
    salesPersonName: "Sophia Martinez",
    allocatedPercentage: 30.0,
    allocatedAmount: 9742.50,
    commissionRate: 3.5,
    incentives: 340.99,
    createdAt: "2026-08-22T10:00:00Z",
  },
];

export async function getSalesTeamForVoucher(
  voucherType: string,
  voucherId: string
): Promise<SalesTeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-team/${voucherType}/${voucherId}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, fetching mock sales team", err);
  }
  return MOCK_SALES_TEAM_MEMBERS.filter(
    (m) => m.voucherType === voucherType && m.voucherId === voucherId
  );
}

export async function saveSalesTeamForVoucher(
  voucherType: string,
  voucherId: string,
  grandTotal: number,
  members: {
    salesPersonId: string;
    salesPersonName?: string;
    allocatedPercentage: number;
    commissionRate?: number;
  }[]
): Promise<SalesTeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-team/${voucherType}/${voucherId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ grandTotal, members }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, saving sales team locally", err);
  }

  // Remove existing
  MOCK_SALES_TEAM_MEMBERS = MOCK_SALES_TEAM_MEMBERS.filter(
    (m) => !(m.voucherType === voucherType && m.voucherId === voucherId)
  );

  const newMembers: SalesTeamMember[] = members.map((m, idx) => {
    const allocatedAmt = Math.round((grandTotal * m.allocatedPercentage) / 100 * 100) / 100;
    const commRate = m.commissionRate || 5.0;
    const incentives = Math.round((allocatedAmt * commRate) / 100 * 100) / 100;

    return {
      id: `stm-${Date.now()}-${idx}`,
      voucherType,
      voucherId,
      salesPersonId: m.salesPersonId,
      salesPersonName: m.salesPersonName || "Sales Representative",
      allocatedPercentage: m.allocatedPercentage,
      allocatedAmount: allocatedAmt,
      commissionRate: commRate,
      incentives,
      createdAt: new Date().toISOString(),
    };
  });

  MOCK_SALES_TEAM_MEMBERS.push(...newMembers);
  return newMembers;
}

// ==========================================
// SALES TARGETS & VARIANCE ANALYTICS (SPRINT 10)
// ==========================================

let MOCK_SALES_TARGETS: SalesTarget[] = [
  {
    id: "st-001",
    targetType: "SALES_PERSON",
    targetRefId: "sp-001",
    targetRefName: "Alexander Wright",
    fiscalYear: "2026",
    period: "ANNUAL",
    targetAmount: 500000.0,
    targetQty: 50.0,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-002",
    targetType: "SALES_PERSON",
    targetRefId: "sp-002",
    targetRefName: "Sophia Martinez",
    fiscalYear: "2026",
    period: "ANNUAL",
    targetAmount: 450000.0,
    targetQty: 40.0,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-003",
    targetType: "SALES_PERSON",
    targetRefId: "sp-003",
    targetRefName: "Liam Johnson",
    fiscalYear: "2026",
    period: "ANNUAL",
    targetAmount: 350000.0,
    targetQty: 30.0,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-004",
    targetType: "TERRITORY",
    targetRefId: "terr-001",
    targetRefName: "North America - US East",
    fiscalYear: "2026",
    period: "ANNUAL",
    targetAmount: 1200000.0,
    targetQty: 100.0,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-005",
    targetType: "TERRITORY",
    targetRefId: "terr-002",
    targetRefName: "North America - US West",
    fiscalYear: "2026",
    period: "ANNUAL",
    targetAmount: 950000.0,
    targetQty: 80.0,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export async function getSalesTargets(fiscalYear: string = "2026"): Promise<SalesTarget[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-targets?fiscalYear=${fiscalYear}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using mock sales targets", err);
  }
  return MOCK_SALES_TARGETS.filter((t) => t.fiscalYear === fiscalYear);
}

export async function createSalesTarget(data: SalesTargetCreateRequest): Promise<SalesTarget> {
  try {
    const res = await fetch(`${API_BASE}/sales-targets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, saving target locally", err);
  }

  const existingIdx = MOCK_SALES_TARGETS.findIndex(
    (t) =>
      t.targetType === data.targetType &&
      t.targetRefId === data.targetRefId &&
      t.fiscalYear === (data.fiscalYear || "2026")
  );

  const newTarget: SalesTarget = {
    id: `st-${Date.now()}`,
    targetType: data.targetType,
    targetRefId: data.targetRefId,
    targetRefName: data.targetRefName || "Target Entity",
    fiscalYear: data.fiscalYear || "2026",
    period: data.period || "ANNUAL",
    itemGroupId: data.itemGroupId,
    itemGroupName: data.itemGroupName,
    targetAmount: data.targetAmount,
    targetQty: data.targetQty || 0,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    MOCK_SALES_TARGETS[existingIdx] = newTarget;
  } else {
    MOCK_SALES_TARGETS.push(newTarget);
  }

  return newTarget;
}

export async function getSalesPersonTargetVariance(
  fiscalYear: string = "2026"
): Promise<TargetVarianceReport[]> {
  try {
    const res = await fetch(
      `${API_BASE}/sales-targets/variance/sales-persons?fiscalYear=${fiscalYear}`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, computing mock rep target variance", err);
  }

  // Fallback variance calculation
  const reps = MOCK_SALES_PERSONS;
  return reps.map((rep) => {
    const targetObj = MOCK_SALES_TARGETS.find(
      (t) => t.targetType === "SALES_PERSON" && t.targetRefId === rep.id && t.fiscalYear === fiscalYear
    );
    const targetAmt = targetObj ? targetObj.targetAmount : rep.targetAmount || 500000;
    const achievedAmt = rep.allocatedAmount || 320000;
    const variance = achievedAmt - targetAmt;
    const percentage = targetAmt > 0 ? Math.round((achievedAmt / targetAmt) * 10000) / 100 : 0;

    let pacing: "EXCEEDED" | "ON_TRACK" | "AT_RISK" | "BEHIND" = "BEHIND";
    if (percentage >= 100) pacing = "EXCEEDED";
    else if (percentage >= 75) pacing = "ON_TRACK";
    else if (percentage >= 50) pacing = "AT_RISK";

    return {
      targetRefId: rep.id,
      targetRefName: rep.salesPersonName,
      targetType: "SALES_PERSON",
      fiscalYear,
      period: "ANNUAL",
      targetAmount: targetAmt,
      achievedAmount: achievedAmt,
      varianceAmount: variance,
      percentageAchieved: percentage,
      pacingStatus: pacing,
      totalDealsBooked: rep.allocatedAmount > 0 ? 5 : 1,
    };
  });
}

export async function getTerritoryTargetVariance(
  fiscalYear: string = "2026"
): Promise<TargetVarianceReport[]> {
  try {
    const res = await fetch(
      `${API_BASE}/sales-targets/variance/territories?fiscalYear=${fiscalYear}`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, computing mock territory target variance", err);
  }

  const territories = [
    { id: "terr-001", name: "North America - US East", target: 1200000, achieved: 1050000, deals: 14 },
    { id: "terr-002", name: "North America - US West", target: 950000, achieved: 980000, deals: 11 },
    { id: "terr-003", name: "Europe & UK Commercial", target: 800000, achieved: 560000, deals: 7 },
    { id: "terr-004", name: "Asia-Pacific & India", target: 750000, achieved: 820000, deals: 12 },
  ];

  return territories.map((t) => {
    const variance = t.achieved - t.target;
    const percentage = Math.round((t.achieved / t.target) * 10000) / 100;
    let pacing: "EXCEEDED" | "ON_TRACK" | "AT_RISK" | "BEHIND" = "BEHIND";
    if (percentage >= 100) pacing = "EXCEEDED";
    else if (percentage >= 75) pacing = "ON_TRACK";
    else if (percentage >= 50) pacing = "AT_RISK";

    return {
      targetRefId: t.id,
      targetRefName: t.name,
      targetType: "TERRITORY",
      fiscalYear,
      period: "ANNUAL",
      targetAmount: t.target,
      achievedAmount: t.achieved,
      varianceAmount: variance,
      percentageAchieved: percentage,
      pacingStatus: pacing,
      totalDealsBooked: t.deals,
    };
  });
}

export * from "./workflowApi";

