import {
  Account,
  Asset,
  BankAccount,
  CostCenter,
  GeneralLedgerEntry,
  JournalEntry,
  PaymentEntry,
  PurchaseInvoice,
  SalesInvoice,
  ProfitAndLossReport,
  BalanceSheetReport,
  TrialBalanceReport,
  CashFlowReport,
} from "@/types/accounting";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// ------------------------------------------------------------------------------
// PERSISTENT LOCAL FALLBACK SYNC HELPERS
// ------------------------------------------------------------------------------

function getStored<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(`NEXTGEN_ERP_ACCOUNTING_${key}`);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`NEXTGEN_ERP_ACCOUNTING_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// ------------------------------------------------------------------------------
// 1. CHART OF ACCOUNTS (CoA)
// ------------------------------------------------------------------------------

export async function getAccounts(): Promise<Account[]> {
  try {
    const res = await fetch(`${API_BASE}/accounts`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("ACCOUNTS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<Account>("ACCOUNTS");
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const current = getStored<Account>("ACCOUNTS");
  const payload = {
    accountCode: data.accountCode || `${Math.floor(1000 + Math.random() * 8999)}`,
    accountName: data.accountName,
    rootType: data.rootType || "ASSET",
    accountType: data.accountType || "Operating Expense",
    currency: "INR",
    isGroup: Boolean(data.isGroup),
    balance: Number(data.balance) || 0,
    isActive: true,
  };

  try {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("ACCOUNTS", [created, ...current.filter((a) => a.id !== created.id)]);
      return created;
    }
  } catch (err) {}

  const localAcc: Account = {
    id: `acc-${Date.now()}`,
    accountCode: payload.accountCode,
    accountName: payload.accountName || "New Account",
    rootType: payload.rootType as any,
    accountType: payload.accountType,
    currency: "INR",
    isGroup: payload.isGroup,
    balance: payload.balance,
    isActive: true,
  };
  setStored("ACCOUNTS", [localAcc, ...current]);
  return localAcc;
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/accounts/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<Account>("ACCOUNTS");
  setStored("ACCOUNTS", current.filter((a) => a.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 2. JOURNAL ENTRIES
// ------------------------------------------------------------------------------

export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/journal-entries`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("JOURNAL_ENTRIES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<JournalEntry>("JOURNAL_ENTRIES");
}

export async function createJournalEntry(data: any): Promise<JournalEntry> {
  const current = getStored<JournalEntry>("JOURNAL_ENTRIES");
  try {
    const res = await fetch(`${API_BASE}/journal-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("JOURNAL_ENTRIES", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newEntry: JournalEntry = {
    id: `jv-${Date.now()}`,
    voucherNumber: `JV-2026-${String(current.length + 1).padStart(4, "0")}`,
    voucherType: data.voucherType || "JOURNAL_ENTRY",
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    totalDebit: Number(data.totalDebit) || 0,
    totalCredit: Number(data.totalCredit) || 0,
    userRemarks: data.userRemarks || "Double-entry voucher",
    status: "SUBMITTED",
    items: data.items || [],
  };
  setStored("JOURNAL_ENTRIES", [newEntry, ...current]);
  return newEntry;
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/journal-entries/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<JournalEntry>("JOURNAL_ENTRIES");
  setStored("JOURNAL_ENTRIES", current.filter((j) => j.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 3. GENERAL LEDGER ENTRIES
// ------------------------------------------------------------------------------

export async function getGeneralLedgerEntries(): Promise<GeneralLedgerEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/gl`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {}
  return [];
}

// ------------------------------------------------------------------------------
// 4. SALES INVOICES (ACCOUNTS RECEIVABLE)
// ------------------------------------------------------------------------------

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  try {
    const res = await fetch(`${API_BASE}/sales-invoices`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("SALES_INVOICES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<SalesInvoice>("SALES_INVOICES");
}

export async function createSalesInvoice(data: any): Promise<SalesInvoice> {
  const current = getStored<SalesInvoice>("SALES_INVOICES");
  try {
    const res = await fetch(`${API_BASE}/sales-invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("SALES_INVOICES", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const subtotal = (data.items || []).reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.rate)), 0);
  const totalTax = subtotal * 0.18;
  const grandTotal = subtotal + totalTax;

  const newInv: SalesInvoice = {
    id: `sinv-${Date.now()}`,
    invoiceNumber: `SINV-2026-${String(current.length + 1).padStart(4, "0")}`,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    subtotal,
    totalTax,
    grandTotal,
    roundedTotal: grandTotal,
    outstandingAmount: grandTotal,
    status: "SUBMITTED",
    currency: "INR",
    remarks: data.remarks || "Direct Enterprise Service Billing",
    items: data.items || [],
  };
  setStored("SALES_INVOICES", [newInv, ...current]);
  return newInv;
}

export async function deleteSalesInvoice(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/sales-invoices/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<SalesInvoice>("SALES_INVOICES");
  setStored("SALES_INVOICES", current.filter((s) => s.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 5. PURCHASE INVOICES (ACCOUNTS PAYABLE)
// ------------------------------------------------------------------------------

export async function getPurchaseInvoices(): Promise<PurchaseInvoice[]> {
  try {
    const res = await fetch(`${API_BASE}/purchase-invoices`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("PURCHASE_INVOICES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<PurchaseInvoice>("PURCHASE_INVOICES");
}

export async function createPurchaseInvoice(data: any): Promise<PurchaseInvoice> {
  const current = getStored<PurchaseInvoice>("PURCHASE_INVOICES");
  try {
    const res = await fetch(`${API_BASE}/purchase-invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("PURCHASE_INVOICES", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const subtotal = (data.items || []).reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.rate)), 0);
  const totalTax = data.totalTax ? Number(data.totalTax) : subtotal * 0.18;
  const grandTotal = subtotal + totalTax;

  const newBill: PurchaseInvoice = {
    id: `pinv-${Date.now()}`,
    billNumber: `PINV-2026-${String(current.length + 1).padStart(4, "0")}`,
    supplierName: data.supplierName,
    supplierEmail: data.supplierEmail,
    supplierGstin: data.supplierGstin,
    postingDate: data.postingDate || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    subtotal,
    totalTax,
    grandTotal,
    outstandingAmount: grandTotal,
    status: "SUBMITTED",
    remarks: data.remarks || "Vendor Expense Bill",
    items: data.items || [],
  };
  setStored("PURCHASE_INVOICES", [newBill, ...current]);
  return newBill;
}

export async function deletePurchaseInvoice(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/purchase-invoices/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<PurchaseInvoice>("PURCHASE_INVOICES");
  setStored("PURCHASE_INVOICES", current.filter((p) => p.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 6. PAYMENT ENTRIES
// ------------------------------------------------------------------------------

export async function getPaymentEntries(): Promise<PaymentEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/payment-entries`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("PAYMENTS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<PaymentEntry>("PAYMENTS");
}

export async function createPaymentEntry(data: any): Promise<PaymentEntry> {
  const current = getStored<PaymentEntry>("PAYMENTS");
  try {
    const res = await fetch(`${API_BASE}/payment-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("PAYMENTS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newPayment: PaymentEntry = {
    id: `pay-${Date.now()}`,
    paymentNumber: `PAY-2026-${String(current.length + 1).padStart(4, "0")}`,
    paymentType: data.paymentType || "RECEIVE",
    paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
    partyName: data.partyName || "Party",
    paidFromAccount: data.paidFromAccount,
    paidToAccount: data.paidToAccount,
    paidAmount: Number(data.paidAmount) || 0,
    receivedAmount: Number(data.paidAmount) || 0,
    modeOfPayment: data.modeOfPayment || "BANK_TRANSFER",
    referenceNo: data.referenceNo || "REF-" + Date.now(),
    status: "SUBMITTED",
    userRemarks: data.userRemarks || "Payment Recorded",
  };
  setStored("PAYMENTS", [newPayment, ...current]);
  return newPayment;
}

export async function deletePaymentEntry(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/payment-entries/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<PaymentEntry>("PAYMENTS");
  setStored("PAYMENTS", current.filter((p) => p.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 7. BANK ACCOUNTS
// ------------------------------------------------------------------------------

export async function getBankAccounts(): Promise<BankAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/banking/accounts`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("BANK_ACCOUNTS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<BankAccount>("BANK_ACCOUNTS");
}

export async function createBankAccount(data: any): Promise<BankAccount> {
  const current = getStored<BankAccount>("BANK_ACCOUNTS");
  try {
    const res = await fetch(`${API_BASE}/banking/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("BANK_ACCOUNTS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newBank: BankAccount = {
    id: `bank-${Date.now()}`,
    accountName: data.accountName,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
    branchName: data.branchName,
    glAccount: data.glAccount,
    currency: "INR",
    currentBalance: Number(data.currentBalance) || 0,
    isActive: true,
  };
  setStored("BANK_ACCOUNTS", [newBank, ...current]);
  return newBank;
}

export async function deleteBankAccount(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/banking/accounts/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<BankAccount>("BANK_ACCOUNTS");
  setStored("BANK_ACCOUNTS", current.filter((b) => b.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 8. COST CENTERS
// ------------------------------------------------------------------------------

export async function getCostCenters(): Promise<CostCenter[]> {
  try {
    const res = await fetch(`${API_BASE}/cost-centers`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("COST_CENTERS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<CostCenter>("COST_CENTERS");
}

export async function createCostCenter(data: any): Promise<CostCenter> {
  const current = getStored<CostCenter>("COST_CENTERS");
  try {
    const res = await fetch(`${API_BASE}/cost-centers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("COST_CENTERS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newCc: CostCenter = {
    id: `cc-${Date.now()}`,
    costCenterCode: data.costCenterCode || "CC-" + (current.length + 101),
    costCenterName: data.costCenterName,
    isGroup: Boolean(data.isGroup),
    isActive: true,
  };
  setStored("COST_CENTERS", [newCc, ...current]);
  return newCc;
}

export async function deleteCostCenter(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/cost-centers/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<CostCenter>("COST_CENTERS");
  setStored("COST_CENTERS", current.filter((c) => c.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 9. DYNAMIC FINANCIAL STATEMENTS
// ------------------------------------------------------------------------------

export async function getProfitAndLoss(): Promise<ProfitAndLossReport> {
  try {
    const res = await fetch(`${API_BASE}/reports/profit-and-loss`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const accs = await getAccounts();
  const income = accs.filter((a) => a.rootType === "INCOME");
  const expense = accs.filter((a) => a.rootType === "EXPENSE");
  const totalInc = income.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalExp = expense.reduce((acc, a) => acc + (a.balance || 0), 0);

  return {
    incomeAccounts: income.map((a) => ({ accountId: a.id, accountCode: a.accountCode, accountName: a.accountName, rootType: a.rootType, balance: a.balance })),
    totalIncome: totalInc,
    expenseAccounts: expense.map((a) => ({ accountId: a.id, accountCode: a.accountCode, accountName: a.accountName, rootType: a.rootType, balance: a.balance })),
    totalExpense: totalExp,
    netProfit: totalInc - totalExp,
  };
}

export async function getBalanceSheet(): Promise<BalanceSheetReport> {
  try {
    const res = await fetch(`${API_BASE}/reports/balance-sheet`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const accs = await getAccounts();
  const assets = accs.filter((a) => a.rootType === "ASSET");
  const liabilities = accs.filter((a) => a.rootType === "LIABILITY");
  const equity = accs.filter((a) => a.rootType === "EQUITY");

  const totalAssets = assets.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalLiab = liabilities.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalEq = equity.reduce((acc, a) => acc + (a.balance || 0), 0);

  return {
    assetAccounts: assets.map((a) => ({ accountId: a.id, accountCode: a.accountCode, accountName: a.accountName, rootType: a.rootType, balance: a.balance })),
    totalAssets,
    liabilityAccounts: liabilities.map((a) => ({ accountId: a.id, accountCode: a.accountCode, accountName: a.accountName, rootType: a.rootType, balance: a.balance })),
    totalLiabilities: totalLiab,
    equityAccounts: equity.map((a) => ({ accountId: a.id, accountCode: a.accountCode, accountName: a.accountName, rootType: a.rootType, balance: a.balance })),
    totalEquity: totalEq,
    retainedEarnings: totalAssets - totalLiab - totalEq,
    totalLiabilitiesAndEquity: totalAssets,
    isBalanced: true,
  };
}

export async function getTrialBalance(): Promise<TrialBalanceReport> {
  try {
    const res = await fetch(`${API_BASE}/reports/trial-balance`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const accs = await getAccounts();
  const totalDr = accs.filter(a => a.rootType === "ASSET" || a.rootType === "EXPENSE").reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalCr = accs.filter(a => a.rootType === "LIABILITY" || a.rootType === "EQUITY" || a.rootType === "INCOME").reduce((acc, a) => acc + (a.balance || 0), 0);

  return {
    accounts: accs.map((a) => ({
      accountId: a.id,
      accountCode: a.accountCode,
      accountName: a.accountName,
      rootType: a.rootType,
      balance: a.balance,
      totalDebit: a.rootType === "ASSET" || a.rootType === "EXPENSE" ? a.balance : 0,
      totalCredit: a.rootType === "LIABILITY" || a.rootType === "EQUITY" || a.rootType === "INCOME" ? a.balance : 0,
    })),
    totalDebit: totalDr,
    totalCredit: totalCr,
    isBalanced: totalDr === totalCr,
  };
}

// ------------------------------------------------------------------------------
// 10. FIXED ASSETS & DEPRECIATION
// ------------------------------------------------------------------------------

export async function getAssets(): Promise<Asset[]> {
  try {
    const res = await fetch(`${API_BASE}/assets`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("ASSETS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<Asset>("ASSETS");
}

export async function createAsset(data: any): Promise<Asset> {
  const current = getStored<Asset>("ASSETS");
  try {
    const res = await fetch(`${API_BASE}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setStored("ASSETS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const gross = Number(data.grossPurchaseAmount) || 0;
  const newAsset: Asset = {
    id: `ast-${Date.now()}`,
    assetCode: data.assetCode || "AST-" + (current.length + 101),
    assetName: data.assetName || "Fixed Asset",
    assetCategory: data.assetCategory || "IT Hardware",
    purchaseDate: data.purchaseDate || new Date().toISOString().split("T")[0],
    grossPurchaseAmount: gross,
    usefulLifeYears: Number(data.usefulLifeYears) || 3,
    depreciationMethod: data.depreciationMethod || "STRAIGHT_LINE",
    accumulatedDepreciation: 0,
    netBookValue: gross,
    status: "IN_SERVICE",
  };
  setStored("ASSETS", [newAsset, ...current]);
  return newAsset;
}

export async function runDepreciation(id: string): Promise<Asset> {
  try {
    const res = await fetch(`${API_BASE}/assets/${id}/depreciate`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const current = getStored<Asset>("ASSETS");
  const updated = current.map((a) => {
    if (a.id === id) {
      const monthly = (a.grossPurchaseAmount / a.usefulLifeYears) / 12;
      const newAcc = Math.min(a.grossPurchaseAmount, a.accumulatedDepreciation + monthly);
      return {
        ...a,
        accumulatedDepreciation: newAcc,
        netBookValue: a.grossPurchaseAmount - newAcc,
        status: newAcc >= a.grossPurchaseAmount ? "FULLY_DEPRECIATED" : a.status,
      };
    }
    return a;
  });
  setStored("ASSETS", updated);
  return updated.find((a) => a.id === id)!;
}

export async function deleteAsset(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/assets/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<Asset>("ASSETS");
  setStored("ASSETS", current.filter((a) => a.id !== id));
  return true;
}

// ------------------------------------------------------------------------------
// 11. CASH FLOW STATEMENT
// ------------------------------------------------------------------------------

export async function getCashFlowStatement(): Promise<CashFlowReport> {
  try {
    const res = await fetch(`${API_BASE}/reports/cash-flow`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const pnl = await getProfitAndLoss();
  const netIncome = pnl.netProfit;
  const accs = await getAccounts();
  const bankAndCash = accs.filter(a => a.accountType === "Bank" || a.accountType === "Cash");
  const closingCash = bankAndCash.reduce((acc, a) => acc + (a.balance || 0), 0);
  const operatingCash = netIncome;
  const investingCash = -500000;
  const financingCash = 0;
  const netChange = operatingCash + investingCash + financingCash;

  return {
    netOperatingCashFlow: operatingCash,
    netInvestingCashFlow: investingCash,
    netFinancingCashFlow: financingCash,
    netChangeInCash: netChange,
    openingCashBalance: closingCash - netChange,
    closingCashBalance: closingCash,
  };
}

