export type RootType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";

export type InvoiceStatus = "DRAFT" | "SUBMITTED" | "PARTLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export type PaymentType = "RECEIVE" | "PAY" | "INTERNAL_TRANSFER";

export type PaymentMode = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI" | "CREDIT_CARD";

export interface CostCenter {
  id: string;
  costCenterCode: string;
  costCenterName: string;
  parentCostCenter?: CostCenter;
  isGroup: boolean;
  isActive: boolean;
}

export interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  rootType: RootType;
  accountType?: string;
  parentAccount?: Account;
  currency: string;
  isGroup: boolean;
  balance: number;
  isActive: boolean;
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode?: string;
  swiftCode?: string;
  branchName?: string;
  glAccount: Account;
  currency: string;
  currentBalance: number;
  isActive: boolean;
}

export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  assetCategory: string;
  purchaseDate: string;
  grossPurchaseAmount: number;
  usefulLifeYears: number;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: string;
}

export interface TaxTemplate {
  id: string;
  title: string;
  taxType: string;
  ratePercentage: number;
  account: Account;
  isActive: boolean;
}

export interface JournalEntryItem {
  id?: string;
  account: Account;
  partyType?: string;
  partyName?: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: CostCenter;
  remarks?: string;
}

export interface JournalEntry {
  id: string;
  voucherNumber: string;
  voucherType: string;
  postingDate: string;
  totalDebit: number;
  totalCredit: number;
  userRemarks?: string;
  status: string;
  items: JournalEntryItem[];
}

export interface GeneralLedgerEntry {
  id: string;
  postingDate: string;
  account: Account;
  voucherType: string;
  voucherNumber: string;
  voucherId: string;
  debit: number;
  credit: number;
  againstAccount?: string;
  partyType?: string;
  partyName?: string;
  costCenter?: CostCenter;
  remarks?: string;
  isCancelled: boolean;
}

export interface SalesInvoiceItem {
  id?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
  incomeAccount?: Account;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  postingDate: string;
  dueDate: string;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  roundedTotal: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  inWords?: string;
  currency: string;
  remarks?: string;
  items: SalesInvoiceItem[];
}

export interface PurchaseInvoiceItem {
  id?: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
  expenseAccount?: Account;
}

export interface PurchaseInvoice {
  id: string;
  billNumber: string;
  supplierName: string;
  supplierEmail?: string;
  supplierGstin?: string;
  postingDate: string;
  dueDate: string;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  remarks?: string;
  items: PurchaseInvoiceItem[];
}

export interface PaymentEntry {
  id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  paymentDate: string;
  partyType?: string;
  partyName?: string;
  paidFromAccount: Account;
  paidToAccount: Account;
  paidAmount: number;
  receivedAmount: number;
  modeOfPayment: PaymentMode;
  referenceNo?: string;
  referenceDate?: string;
  status: string;
  userRemarks?: string;
}

export interface AccountSummary {
  accountId: string;
  accountCode: string;
  accountName: string;
  rootType: string;
  accountType?: string;
  balance: number;
  totalDebit?: number;
  totalCredit?: number;
}

export interface ProfitAndLossReport {
  incomeAccounts: AccountSummary[];
  totalIncome: number;
  expenseAccounts: AccountSummary[];
  totalExpense: number;
  netProfit: number;
}

export interface BalanceSheetReport {
  assetAccounts: AccountSummary[];
  totalAssets: number;
  liabilityAccounts: AccountSummary[];
  totalLiabilities: number;
  equityAccounts: AccountSummary[];
  totalEquity: number;
  retainedEarnings: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface TrialBalanceReport {
  accounts: AccountSummary[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface CashFlowReport {
  netOperatingCashFlow: number;
  netInvestingCashFlow: number;
  netFinancingCashFlow: number;
  netChangeInCash: number;
  openingCashBalance: number;
  closingCashBalance: number;
}
