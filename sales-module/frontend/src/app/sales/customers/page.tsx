"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Plus,
  FileText,
  ShoppingBag,
  Receipt,
  Truck,
  DollarSign,
  TrendingUp,
  Tag,
  Clock,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Handshake,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCustomers, createCustomer, getCustomer360Dashboard } from "@/lib/api";
import { Customer, Customer360Dashboard } from "@/types/sales";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dashboardData, setDashboardData] = useState<Customer360Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "credit" | "salesTeam" | "connections">("overview");

  // Create Customer Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState<"basic" | "contact" | "credit" | "salesTeam">("basic");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerType, setCustomerType] = useState<any>("COMPANY");
  const [customerGroupName, setCustomerGroupName] = useState("Commercial Enterprise");
  const [territoryName, setTerritoryName] = useState("North America - US East");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [creditLimit, setCreditLimit] = useState("50000");
  const [bypassCreditLimit, setBypassCreditLimit] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [taxCategory, setTaxCategory] = useState("Standard In-State GST/VAT");
  const [defaultReceivableAccount, setDefaultReceivableAccount] = useState("1310 - Debtors / Accounts Receivable");
  const [defaultSalesPartner, setDefaultSalesPartner] = useState("Pinnacle Alliance Systems");
  const [defaultCommissionRate, setDefaultCommissionRate] = useState("5.0");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  
  // Address & Contact
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [pincode, setPincode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactDesignation, setContactDesignation] = useState("Procurement Officer");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data || []);
      if (data && data.length > 0) {
        const first = data[0];
        setSelectedCustomer(first);
        loadDashboard(first.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (customerId: string) => {
    try {
      const d = await getCustomer360Dashboard(customerId);
      setDashboardData(d);
    } catch (err) {
      console.error("Failed to load customer dashboard", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    loadDashboard(cust.id);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    try {
      const addressesPayload = addressLine1 ? [
        {
          addressTitle: "Primary Headquarters",
          addressType: "Billing",
          addressLine1,
          city: city || "Metropolis",
          state: state || "NY",
          country: country || "USA",
          pincode: pincode || "10001",
          isPrimaryAddress: true,
          isShippingAddress: true,
        }
      ] : [];

      const contactsPayload = contactName ? [
        {
          firstName: contactName,
          emailId: contactEmail || email,
          mobileNo: contactPhone || phone,
          designation: contactDesignation,
          isPrimaryContact: true,
        }
      ] : [];

      await createCustomer({
        customerName,
        customerCode: customerCode || undefined,
        customerType,
        defaultCurrency,
        taxId,
        taxCategory,
        defaultReceivableAccount,
        paymentTerms,
        defaultSalesPartner,
        defaultCommissionRate: Number(defaultCommissionRate) || 0,
        creditLimit: Number(creditLimit) || 50000,
        bypassCreditLimitCheck: bypassCreditLimit,
        email,
        phone,
        website,
        addresses: addressesPayload,
        contacts: contactsPayload,
      });

      setIsCreateOpen(false);
      setActionSuccess("Customer created successfully in ERPNext Selling Master!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadCustomers();
    } catch (err: any) {
      alert("Failed to create customer: " + (err.message || err));
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customerGroupName && c.customerGroupName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const utilization = selectedCustomer
    ? ((selectedCustomer.outstandingBalance || 0) / (selectedCustomer.creditLimit || 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Customer Master & 360 Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ERPNext-aligned Buyer of Goods and Services directory, Credit Limits, Sales Partner Allocation, and Transaction Connections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCustomers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Customer List (4 cols) & Customer 360 View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading customer masters...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No customers found.</div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const custUtil = ((cust.outstandingBalance || 0) / (cust.creditLimit || 1)) * 100;
                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-slate-900">{cust.customerName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{cust.customerCode}</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {cust.customerType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 text-[10px]">{cust.customerGroupName || "Enterprise"}</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{Number(cust.outstandingBalance || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Credit usage meter */}
                    <div className="space-y-1 text-[10px]">
                      <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            custUtil > 80 ? "bg-rose-500" : custUtil > 50 ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, custUtil)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer 360 View on Right (8 cols) */}
        {selectedCustomer ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-5 p-6">
            {/* Customer Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-semibold text-[11px]">
                    {selectedCustomer.customerCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {selectedCustomer.customerType}
                  </span>
                  {selectedCustomer.isFrozen && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-medium text-[11px]">
                      FROZEN / HOLD
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedCustomer.customerName}</h2>
                <div className="text-xs text-slate-500 flex items-center gap-4">
                  <span>Group: <b className="text-slate-700">{selectedCustomer.customerGroupName || "Commercial"}</b></span>
                  <span>Territory: <b className="text-slate-700">{selectedCustomer.territoryName || "Global"}</b></span>
                </div>
              </div>

              {/* Quick Actions Dropdown / Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/sales/quotations?customerId=${selectedCustomer.id}`}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-blue-200"
                >
                  <FileText className="h-3 w-3" />
                  <span>+ Quotation</span>
                </Link>
                <Link
                  href={`/sales/orders?customerId=${selectedCustomer.id}`}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-purple-200"
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span>+ Order</span>
                </Link>
                <Link
                  href={`/sales/invoices?customerId=${selectedCustomer.id}`}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-amber-200"
                >
                  <Receipt className="h-3 w-3" />
                  <span>+ Invoice</span>
                </Link>
              </div>
            </div>

            {/* Quick KPI Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Billed</div>
                <div className="text-sm font-bold font-mono text-slate-900">
                  ₹{Number(dashboardData?.totalInvoicedValue || selectedCustomer.outstandingBalance).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Collected</div>
                <div className="text-sm font-bold font-mono text-emerald-600">
                  ₹{Number(dashboardData?.totalCollectedAmount || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Outstanding AR</div>
                <div className="text-sm font-bold font-mono text-amber-600">
                  ₹{Number(selectedCustomer.outstandingBalance || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Available Credit</div>
                <div className="text-sm font-bold font-mono text-blue-600">
                  ₹{Number(selectedCustomer.availableCredit || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* ERPNext Customer Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Basic Info & Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("contacts")}
                className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "contacts" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Address & Contacts ({selectedCustomer.addresses?.length || 1})</span>
              </button>
              <button
                onClick={() => setActiveTab("credit")}
                className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "credit" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Credit & Accounting</span>
              </button>
              <button
                onClick={() => setActiveTab("salesTeam")}
                className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "salesTeam" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Handshake className="h-3.5 w-3.5" />
                <span>Sales Team & Partner</span>
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "connections" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>ERPNext 360 Connections</span>
              </button>
            </div>

            {/* TAB 1: Basic Info & Profile */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 bg-slate-50/75 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
                    Account Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Customer Series:</span>
                    <span className="font-mono text-slate-800">{selectedCustomer.customerCode}</span>
                    <span className="text-slate-500">Default Currency:</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.defaultCurrency || "INR"}</span>
                    <span className="text-slate-500">Payment Terms:</span>
                    <span className="text-slate-800">{selectedCustomer.paymentTerms || "Net 30 Days"}</span>
                    <span className="text-slate-500">Default Price List:</span>
                    <span className="text-slate-800">Standard Selling (USD/INR)</span>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50/75 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
                    Tax & Statutory Details
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Tax ID / GSTIN / VAT:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedCustomer.taxId || "GSTIN-27AABCA1234F1Z5"}</span>
                    <span className="text-slate-500">Tax Category:</span>
                    <span className="text-slate-800">{selectedCustomer.taxCategory || "Standard In-State Tax"}</span>
                    <span className="text-slate-500">Receivable Account:</span>
                    <span className="text-slate-800">{selectedCustomer.defaultReceivableAccount || "1310 - Debtors"}</span>
                    <span className="text-slate-500">Internal Customer:</span>
                    <span className="text-slate-800">{selectedCustomer.isInternalCustomer ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Address & Contacts */}
            {activeTab === "contacts" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      <span>Primary Billing & Shipping Address</span>
                    </div>
                    <div className="text-slate-600 leading-relaxed">
                      {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                        <>
                          <div className="font-medium text-slate-800">{selectedCustomer.addresses[0].addressTitle}</div>
                          <div>{selectedCustomer.addresses[0].addressLine1}</div>
                          {selectedCustomer.addresses[0].addressLine2 && <div>{selectedCustomer.addresses[0].addressLine2}</div>}
                          <div>{selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} {selectedCustomer.addresses[0].pincode}</div>
                          <div>{selectedCustomer.addresses[0].country}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-slate-800">Corporate HQ</div>
                          <div>100 Tech Enterprise Blvd, Suite 400</div>
                          <div>New York, NY 10001, United States</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Key Communication Channels</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono">{selectedCustomer.email || "procurement@company.com"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedCustomer.phone || "+1 (800) 555-0199"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-blue-600">{selectedCustomer.website || "www.enterprise.io"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Contact Person</th>
                        <th className="py-2.5 px-4">Designation</th>
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Mobile</th>
                        <th className="py-2.5 px-4 text-center">Primary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCustomer.contacts && selectedCustomer.contacts.length > 0 ? (
                        selectedCustomer.contacts.map((ct) => (
                          <tr key={ct.id || ct.firstName} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{ct.firstName} {ct.lastName}</td>
                            <td className="py-2.5 px-4 text-slate-600">{ct.designation}</td>
                            <td className="py-2.5 px-4 text-blue-600 font-mono">{ct.emailId}</td>
                            <td className="py-2.5 px-4 text-slate-600">{ct.mobileNo}</td>
                            <td className="py-2.5 px-4 text-center">
                              {ct.isPrimaryContact && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                  PRIMARY
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">Sarah Jenkins</td>
                          <td className="py-2.5 px-4 text-slate-600">Chief Procurement Officer</td>
                          <td className="py-2.5 px-4 text-blue-600 font-mono">s.jenkins@enterprise.com</td>
                          <td className="py-2.5 px-4 text-slate-600">+1 (555) 234-8800</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">PRIMARY</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Credit & Accounting */}
            {activeTab === "credit" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-[11px]">Credit Limit & Exposure Analysis</span>
                    <span className="text-slate-500 font-mono">
                      Utilization: <b className={utilization > 80 ? "text-rose-600" : "text-emerald-600"}>{utilization.toFixed(1)}%</b>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilization > 80 ? "bg-rose-500" : utilization > 50 ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">Total Credit Limit</div>
                      <div className="font-bold text-slate-900 font-mono">₹{Number(selectedCustomer.creditLimit).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">Outstanding Due</div>
                      <div className="font-bold text-amber-600 font-mono">₹{Number(selectedCustomer.outstandingBalance).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">Available Headroom</div>
                      <div className="font-bold text-emerald-600 font-mono">₹{Number(selectedCustomer.availableCredit).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Receivable GL Head</span>
                    <div className="font-mono font-bold text-slate-800">{selectedCustomer.defaultReceivableAccount || "1310 - Debtors"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Bypass Credit Check</span>
                    <div className="font-bold text-slate-800">{selectedCustomer.bypassCreditLimitCheck ? "Allowed (VIP Account)" : "Enforced"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Sales Team & Partner */}
            {activeTab === "salesTeam" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Default Sales Partner</div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Handshake className="h-4 w-4 text-blue-600" />
                      <span>{selectedCustomer.defaultSalesPartner || "Pinnacle Alliance Systems"}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Partner Commission: <b>{selectedCustomer.defaultCommissionRate || 5.0}%</b></div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Assigned Account Manager</div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4 text-purple-600" />
                      <span>Alexander Wright</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Direct Sales Rep • 100% Allocation</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ERPNext 360 Connections & Live Transactions */}
            {activeTab === "connections" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <Link
                    href={`/sales/quotations?customerId=${selectedCustomer.id}&open=true`}
                    className="bg-blue-50/70 hover:bg-blue-100/70 p-2.5 rounded-xl border border-blue-200 text-center space-y-0.5 transition-all group"
                  >
                    <FileText className="h-4 w-4 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-blue-900">{dashboardData?.totalQuotationsCount || 0} Quotations</div>
                    <div className="text-[10px] text-blue-600 font-mono">₹{Number(dashboardData?.totalQuotationsValue || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-blue-700 font-semibold pt-1">+ New Quote ↗</div>
                  </Link>

                  <Link
                    href={`/sales/orders?customerId=${selectedCustomer.id}&open=true`}
                    className="bg-purple-50/70 hover:bg-purple-100/70 p-2.5 rounded-xl border border-purple-200 text-center space-y-0.5 transition-all group"
                  >
                    <ShoppingBag className="h-4 w-4 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-purple-900">{dashboardData?.totalSalesOrdersCount || 0} Sales Orders</div>
                    <div className="text-[10px] text-purple-600 font-mono">₹{Number(dashboardData?.totalSalesOrdersValue || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-purple-700 font-semibold pt-1">+ New Order ↗</div>
                  </Link>

                  <Link
                    href={`/sales/delivery-notes?customerId=${selectedCustomer.id}&open=true`}
                    className="bg-emerald-50/70 hover:bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200 text-center space-y-0.5 transition-all group"
                  >
                    <Truck className="h-4 w-4 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-emerald-900">{dashboardData?.totalDeliveryNotesCount || 0} Deliveries</div>
                    <div className="text-[10px] text-emerald-600 font-mono">{dashboardData?.totalDeliveredQty || 0} Qty</div>
                    <div className="text-[10px] text-emerald-700 font-semibold pt-1">+ New Delivery ↗</div>
                  </Link>

                  <Link
                    href={`/sales/invoices?customerId=${selectedCustomer.id}&open=true`}
                    className="bg-amber-50/70 hover:bg-amber-100/70 p-2.5 rounded-xl border border-amber-200 text-center space-y-0.5 transition-all group"
                  >
                    <Receipt className="h-4 w-4 mx-auto text-amber-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-amber-900">{dashboardData?.totalInvoicesCount || 0} Invoices</div>
                    <div className="text-[10px] text-amber-600 font-mono">₹{Number(dashboardData?.totalInvoicedValue || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-amber-700 font-semibold pt-1">+ New Invoice ↗</div>
                  </Link>

                  <Link
                    href={`/sales/payments?customerId=${selectedCustomer.id}&open=true`}
                    className="bg-teal-50/70 hover:bg-teal-100/70 p-2.5 rounded-xl border border-teal-200 text-center space-y-0.5 transition-all group"
                  >
                    <CreditCard className="h-4 w-4 mx-auto text-teal-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-teal-900">{dashboardData?.totalPaymentsCount || 0} Payments</div>
                    <div className="text-[10px] text-teal-600 font-mono">₹{Number(dashboardData?.totalCollectedAmount || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-teal-700 font-semibold pt-1">+ Pay Entry ↗</div>
                  </Link>
                </div>

                {/* Linked Invoices / Orders Preview */}
                <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2 p-3 bg-slate-50/50">
                  <div className="font-semibold text-slate-800 text-[11px]">Active Documents for {selectedCustomer.customerName}</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Click any quick action card above to instantly create a linked Quotation, Sales Order, Delivery Note, Sales Invoice, or Payment Entry with {selectedCustomer.customerName} automatically pre-selected.
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Create Customer Master Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Create ERPNext Customer Master</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCreateTab("basic")}
                className={`pb-2 ${createTab === "basic" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setCreateTab("contact")}
                className={`pb-2 ${createTab === "contact" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                2. Address & Contact
              </button>
              <button
                type="button"
                onClick={() => setCreateTab("credit")}
                className={`pb-2 ${createTab === "credit" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                3. Credit & Accounting
              </button>
              <button
                type="button"
                onClick={() => setCreateTab("salesTeam")}
                className={`pb-2 ${createTab === "salesTeam" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                4. Sales Partner
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* TAB 1 */}
              {createTab === "basic" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="font-semibold text-slate-700">Customer Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Acme Corporation Pvt Ltd"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Customer Series / Code</label>
                    <input
                      type="text"
                      placeholder="Auto (e.g. CUST-2026-001)"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Customer Type *</label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="COMPANY">Company</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="PARTNERSHIP">Partnership</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Customer Group</label>
                    <input
                      type="text"
                      value={customerGroupName}
                      onChange={(e) => setCustomerGroupName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Territory</label>
                    <input
                      type="text"
                      value={territoryName}
                      onChange={(e) => setTerritoryName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2 */}
              {createTab === "contact" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="font-semibold text-slate-700">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="Street address, building, suite..."
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">State / Pincode</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Primary Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Email & Mobile</label>
                    <input
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3 */}
              {createTab === "credit" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Credit Limit (₹)</label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Payment Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Tax ID / GSTIN / VAT</label>
                    <input
                      type="text"
                      placeholder="e.g. GSTIN-27AABCA1234F1Z5"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Receivable Account</label>
                    <input
                      type="text"
                      value={defaultReceivableAccount}
                      onChange={(e) => setDefaultReceivableAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2 pt-2">
                    <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bypassCreditLimit}
                        onChange={(e) => setBypassCreditLimit(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Bypass Credit Limit Check (VIP Account)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4 */}
              {createTab === "salesTeam" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Default Sales Partner</label>
                    <input
                      type="text"
                      value={defaultSalesPartner}
                      onChange={(e) => setDefaultSalesPartner(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultCommissionRate}
                      onChange={(e) => setDefaultCommissionRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Customer Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
