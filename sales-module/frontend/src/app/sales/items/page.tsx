"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package,
  Search,
  Plus,
  Layers,
  Tag,
  Boxes,
  CheckCircle2,
  Sliders,
  FileText,
  ChevronRight,
  Home,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  X,
  Filter,
  ArrowUpDown,
  Coins,
  Warehouse,
  Barcode,
  Layers3,
  Check,
  Percent,
  TrendingUp,
  FolderTree,
  Folder,
  ChevronDown,
  Info,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  getItemGroups,
  createItemGroup,
  deleteItemGroup,
  getPriceLists,
  createPriceList,
  deletePriceList,
  getItemPrices,
  createItemPrice,
  deleteItemPrice,
  getProductBundles,
  createProductBundle,
  deleteProductBundle,
} from "@/lib/api";
import {
  CatalogItem,
  ItemGroup,
  PriceList,
  ItemPrice,
  ProductBundle,
  ProductBundleItem,
} from "@/types/sales";

function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"items" | "groups" | "prices" | "item-prices" | "bundles">("items");
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Data Collections
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
  const [productBundles, setProductBundles] = useState<ProductBundle[]>([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [selectedPriceListFilter, setSelectedPriceListFilter] = useState("ALL");

  // Modals & Drawers
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState<CatalogItem | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [isItemPriceModalOpen, setIsItemPriceModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  // New Item Form State
  const [itemForm, setItemForm] = useState({
    itemCode: "",
    itemName: "",
    itemGroup: "Hardware",
    stockUom: "Nos",
    isStockItem: true,
    isSalesItem: true,
    isPurchaseItem: true,
    standardRate: 0,
    valuationRate: 0,
    lastPurchaseRate: 0,
    maxDiscount: 20,
    brand: "",
    description: "",
    barcode: "",
    hasSerialNo: false,
    hasBatchNo: false,
    defaultWarehouse: "Stores - NC",
    defaultIncomeAccount: "4110 - Sales Revenue",
    defaultExpenseAccount: "5110 - Cost of Goods Sold",
  });

  // New Group Form State
  const [groupForm, setGroupForm] = useState({
    itemGroupName: "",
    parentItemGroup: "All Item Groups",
    isGroup: false,
    description: "",
  });

  // New Price List Form State
  const [priceListForm, setPriceListForm] = useState({
    priceListName: "",
    currency: "INR",
    buying: false,
    selling: true,
    enabled: true,
    country: "India",
  });

  // New Item Price Form State
  const [itemPriceForm, setItemPriceForm] = useState({
    itemCode: "",
    priceListName: "Standard Selling",
    priceListRate: 0,
    currency: "INR",
    minQty: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validUpto: "",
  });

  // New Product Bundle Form State
  const [bundleForm, setBundleForm] = useState({
    newItemCode: "",
    bundleName: "",
    description: "",
    items: [{ itemCode: "", itemName: "", qty: 1, uom: "Nos", rate: 0 }],
  });

  // Sync tab from URL query params
  useEffect(() => {
    if (tabParam) {
      if (tabParam === "groups") setActiveTab("groups");
      else if (tabParam === "prices" || tabParam === "price-lists") setActiveTab("prices");
      else if (tabParam === "item-prices" || tabParam === "item-price") setActiveTab("item-prices");
      else if (tabParam === "bundles") setActiveTab("bundles");
      else setActiveTab("items");
    }
  }, [tabParam]);

  // Load all master datasets
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [itms, grps, pls, ips, bds] = await Promise.all([
        getItems(),
        getItemGroups(),
        getPriceLists(),
        getItemPrices(),
        getProductBundles(),
      ]);
      setItems(itms || []);
      setItemGroups(grps || []);
      setPriceLists(pls || []);
      setItemPrices(ips || []);
      setProductBundles(bds || []);
    } catch (err) {
      console.error("Failed to load Items & Pricing catalog", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Filtered Item Master List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup = selectedGroupFilter === "ALL" || item.itemGroup === selectedGroupFilter;
      const matchesStatus =
        selectedStatusFilter === "ALL" ||
        (selectedStatusFilter === "ACTIVE" && !item.disabled) ||
        (selectedStatusFilter === "DISABLED" && item.disabled);

      const matchesType =
        selectedTypeFilter === "ALL" ||
        (selectedTypeFilter === "STOCK" && item.isStockItem) ||
        (selectedTypeFilter === "SERVICE" && !item.isStockItem);

      return matchesSearch && matchesGroup && matchesStatus && matchesType;
    });
  }, [items, searchQuery, selectedGroupFilter, selectedStatusFilter, selectedTypeFilter]);

  // Filtered Item Prices
  const filteredItemPrices = useMemo(() => {
    return itemPrices.filter((ip) => {
      const matchesSearch =
        ip.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ip.itemName && ip.itemName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPL =
        selectedPriceListFilter === "ALL" || ip.priceListName === selectedPriceListFilter;
      return matchesSearch && matchesPL;
    });
  }, [itemPrices, searchQuery, selectedPriceListFilter]);

  // Form Handlers
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createItem(itemForm);
      setIsItemModalOpen(false);
      showNotification(`Item "${created.itemCode} - ${created.itemName}" created successfully!`);
      loadAllData();
      setItemForm({
        itemCode: "",
        itemName: "",
        itemGroup: "Hardware",
        stockUom: "Nos",
        isStockItem: true,
        isSalesItem: true,
        isPurchaseItem: true,
        standardRate: 0,
        valuationRate: 0,
        lastPurchaseRate: 0,
        maxDiscount: 20,
        brand: "",
        description: "",
        barcode: "",
        hasSerialNo: false,
        hasBatchNo: false,
        defaultWarehouse: "Stores - NC",
        defaultIncomeAccount: "4110 - Sales Revenue",
        defaultExpenseAccount: "5110 - Cost of Goods Sold",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create item");
    }
  };

  const handleDeleteItem = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete item "${code}"?`)) return;
    try {
      await deleteItem(id);
      showNotification(`Item "${code}" deleted.`);
      loadAllData();
      if (selectedItemForView?.id === id) setSelectedItemForView(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createItemGroup(groupForm);
      setIsGroupModalOpen(false);
      showNotification(`Item Group "${created.itemGroupName}" added!`);
      loadAllData();
      setGroupForm({ itemGroupName: "", parentItemGroup: "All Item Groups", isGroup: false, description: "" });
    } catch (err: any) {
      alert(err.message || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete item group "${name}"?`)) return;
    await deleteItemGroup(id);
    showNotification(`Item group "${name}" removed.`);
    loadAllData();
  };

  const handleCreatePriceList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createPriceList(priceListForm);
      setIsPriceListModalOpen(false);
      showNotification(`Price List "${created.priceListName}" created!`);
      loadAllData();
      setPriceListForm({ priceListName: "", currency: "INR", buying: false, selling: true, enabled: true, country: "India" });
    } catch (err: any) {
      alert(err.message || "Failed to create price list");
    }
  };

  const handleDeletePriceList = async (id: string, name: string) => {
    if (!confirm(`Delete price list "${name}"?`)) return;
    await deletePriceList(id);
    showNotification(`Price list "${name}" removed.`);
    loadAllData();
  };

  const handleCreateItemPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedItem = items.find((i) => i.itemCode === itemPriceForm.itemCode);
      const payload = {
        ...itemPriceForm,
        itemName: selectedItem ? selectedItem.itemName : itemPriceForm.itemCode,
      };
      const created = await createItemPrice(payload);
      setIsItemPriceModalOpen(false);
      showNotification(`Price entry for "${created.itemCode}" in "${created.priceListName}" recorded!`);
      loadAllData();
      setItemPriceForm({
        itemCode: items[0]?.itemCode || "",
        priceListName: "Standard Selling",
        priceListRate: 0,
        currency: "INR",
        minQty: 1,
        validFrom: new Date().toISOString().split("T")[0],
        validUpto: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create item price");
    }
  };

  const handleDeleteItemPrice = async (id: string) => {
    if (!confirm("Delete this price list rate entry?")) return;
    await deleteItemPrice(id);
    showNotification("Item price removed.");
    loadAllData();
  };

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createProductBundle(bundleForm);
      setIsBundleModalOpen(false);
      showNotification(`Product Bundle "${created.newItemCode}" created!`);
      loadAllData();
      setBundleForm({
        newItemCode: "",
        bundleName: "",
        description: "",
        items: [{ itemCode: "", itemName: "", qty: 1, uom: "Nos", rate: 0 }],
      });
    } catch (err: any) {
      alert(err.message || "Failed to create bundle");
    }
  };

  const handleDeleteBundle = async (id: string, code: string) => {
    if (!confirm(`Delete product bundle "${code}"?`)) return;
    await deleteProductBundle(id);
    showNotification(`Product bundle "${code}" removed.`);
    loadAllData();
  };

  const handleBundleChildChange = (index: number, field: string, value: any) => {
    const nextItems = [...bundleForm.items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    if (field === "itemCode") {
      const found = items.find((i) => i.itemCode === value);
      if (found) {
        nextItems[index].itemName = found.itemName;
        nextItems[index].rate = found.standardRate;
        nextItems[index].uom = found.stockUom;
      }
    }
    setBundleForm({ ...bundleForm, items: nextItems });
  };

  const addBundleChildRow = () => {
    setBundleForm({
      ...bundleForm,
      items: [...bundleForm.items, { itemCode: "", itemName: "", qty: 1, uom: "Nos", rate: 0 }],
    });
  };

  const removeBundleChildRow = (index: number) => {
    if (bundleForm.items.length <= 1) return;
    const nextItems = bundleForm.items.filter((_, i) => i !== index);
    setBundleForm({ ...bundleForm, items: nextItems });
  };

  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/sales/items?tab=${tab}`);
  };

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-20">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="text-gray-600 font-normal">Items &amp; Pricing</span>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900 capitalize">
            {activeTab === "items" && "Item"}
            {activeTab === "groups" && "Item Group"}
            {activeTab === "prices" && "Price List"}
            {activeTab === "item-prices" && "Item Price"}
            {activeTab === "bundles" && "Product Bundle"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {activeTab === "items" && (
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          )}

          {activeTab === "groups" && (
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Item Group</span>
            </button>
          )}

          {activeTab === "prices" && (
            <button
              onClick={() => setIsPriceListModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Price List</span>
            </button>
          )}

          {activeTab === "item-prices" && (
            <button
              onClick={() => setIsItemPriceModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Price</span>
            </button>
          )}

          {activeTab === "bundles" && (
            <button
              onClick={() => setIsBundleModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Product Bundle</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Feedback Alert Banner */}
        {actionSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-tab Navigation Matching ERPNext Items & Pricing */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-medium overflow-x-auto">
          {[
            { id: "items", label: `Item Master (${items.length})`, icon: Package },
            { id: "groups", label: `Item Groups (${itemGroups.length})`, icon: Layers },
            { id: "prices", label: `Price Lists (${priceLists.length})`, icon: Tag },
            { id: "item-prices", label: `Item Prices (${itemPrices.length})`, icon: Coins },
            { id: "bundles", label: `Product Bundles (${productBundles.length})`, icon: Boxes },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ITEM MASTER (ERPNext DocType: Item) */}
        {/* ========================================================================= */}
        {activeTab === "items" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/60 p-3 rounded-lg border border-gray-200">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item code, description, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none shadow-2xs"
                >
                  <option value="ALL">All Item Groups</option>
                  {itemGroups.map((g) => (
                    <option key={g.id} value={g.itemGroupName}>
                      {g.itemGroupName}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none shadow-2xs"
                >
                  <option value="ALL">All Types</option>
                  <option value="STOCK">Stock Items (Inventory)</option>
                  <option value="SERVICE">Service / Non-Stock</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none shadow-2xs"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Enabled</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            {/* Item Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Item Group</th>
                    <th className="py-3 px-4">UOM</th>
                    <th className="py-3 px-4">Standard Rate</th>
                    <th className="py-3 px-4">Valuation Rate</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        No catalog items found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id || item.itemCode} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          <button
                            onClick={() => setSelectedItemForView(item)}
                            className="text-blue-600 hover:underline hover:text-blue-800"
                          >
                            {item.itemCode}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className="font-semibold">{item.itemName}</div>
                          {item.brand && <div className="text-[10px] text-gray-400">Brand: {item.brand}</div>}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                            {item.itemGroup}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">{item.stockUom}</td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {formatCurrency(item.standardRate)}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {formatCurrency(item.valuationRate || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {item.isStockItem ? (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                              Stock Item
                            </span>
                          ) : (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                              Service / Digital
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.disabled ? (
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              DISABLED
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedItemForView(item)}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                              title="View Full Item Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.itemCode)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ITEM GROUPS (ERPNext DocType: Item Group) */}
        {/* ========================================================================= */}
        {activeTab === "groups" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Tree Hierarchy View */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs">
                    <FolderTree className="w-4 h-4 text-blue-600" />
                    <span>Hierarchy Tree</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">ERPNext Tree Structure</span>
                </div>

                <div className="space-y-1 text-xs">
                  {itemGroups.map((g) => {
                    const isRoot = !g.parentItemGroup || g.parentItemGroup === "";
                    const isChild = g.parentItemGroup && g.parentItemGroup !== "All Item Groups";
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 ${
                          isRoot
                            ? "font-bold text-gray-900 bg-gray-50/70"
                            : isChild
                            ? "pl-6 text-gray-600"
                            : "pl-3 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {g.isGroup ? (
                            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Tag className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span className="truncate">{g.itemGroupName}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold shrink-0">
                          {items.filter((i) => i.itemGroup === g.itemGroupName).length} Items
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Item Groups Table */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-bold text-gray-900 text-xs">All Item Group Masters</span>
                  <span className="text-gray-400 text-[11px]">{itemGroups.length} configured groups</span>
                </div>

                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Group Name</th>
                      <th className="py-2.5 px-3">Parent Group</th>
                      <th className="py-2.5 px-3">Group Node</th>
                      <th className="py-2.5 px-3">Assigned Items</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {itemGroups.map((group) => {
                      const count = items.filter((i) => i.itemGroup === group.itemGroupName).length;
                      return (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900 font-mono">
                            {group.itemGroupName}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">{group.parentItemGroup || "-"}</td>
                          <td className="py-2.5 px-3">
                            {group.isGroup ? (
                              <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                Folder Node
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                Leaf Category
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{count}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteGroup(group.id, group.itemGroupName)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Delete Group"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRICE LISTS (ERPNext DocType: Price List) */}
        {/* ========================================================================= */}
        {activeTab === "prices" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priceLists.map((pl) => {
                const count = itemPrices.filter((ip) => ip.priceListName === pl.priceListName).length;
                return (
                  <div
                    key={pl.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{pl.priceListName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pl.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pl.enabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Currency:</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {pl.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Classification:</span>
                        <div className="flex gap-1">
                          {pl.selling && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              Selling
                            </span>
                          )}
                          {pl.buying && (
                            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              Buying
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Territory / Country:</span>
                        <span className="font-medium text-gray-800">{pl.country || "All Regions"}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-400">Rates Configured:</span>
                        <span className="font-mono font-bold text-blue-600">{count} Items</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleDeletePriceList(pl.id, pl.priceListName)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ITEM PRICES (ERPNext DocType: Item Price) */}
        {/* ========================================================================= */}
        {activeTab === "item-prices" && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/60 p-3 rounded-lg border border-gray-200">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by item code or item name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <select
                value={selectedPriceListFilter}
                onChange={(e) => setSelectedPriceListFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none text-xs shadow-2xs"
              >
                <option value="ALL">All Price Lists</option>
                {priceLists.map((pl) => (
                  <option key={pl.id} value={pl.priceListName}>
                    {pl.priceListName} ({pl.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Item Prices Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Price List</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-4">Min Qty</th>
                    <th className="py-3 px-4">Valid Range</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredItemPrices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No specific item prices defined yet. Click "+ Add Item Price" above.
                      </td>
                    </tr>
                  ) : (
                    filteredItemPrices.map((ip) => (
                      <tr key={ip.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">{ip.itemCode}</td>
                        <td className="py-3 px-4 text-gray-800">{ip.itemName || ip.itemCode}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                            {ip.priceListName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900 text-sm">
                          {formatCurrency(ip.priceListRate)}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">{ip.currency || "INR"}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{ip.minQty || 1}</td>
                        <td className="py-3 px-4 text-gray-400 text-[11px] font-mono">
                          {ip.validFrom || "Immediate"} {ip.validUpto ? `to ${ip.validUpto}` : "(Ongoing)"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteItemPrice(ip.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Delete Item Price"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PRODUCT BUNDLES (ERPNext DocType: Product Bundle) */}
        {/* ========================================================================= */}
        {activeTab === "bundles" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productBundles.map((pb) => {
                const total = pb.items.reduce(
                  (acc, itm) => acc + (itm.rate || 0) * (itm.qty || 1),
                  0
                );
                return (
                  <div
                    key={pb.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{pb.bundleName || pb.newItemCode}</span>
                        <span className="ml-2 font-mono text-gray-400 text-xs">({pb.newItemCode})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBundle(pb.id, pb.newItemCode)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete Product Bundle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pb.description && <p className="text-gray-500 text-[11px]">{pb.description}</p>}

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase">Child Components (BOM):</div>
                      <div className="bg-gray-50 rounded border border-gray-200 p-2.5 space-y-1.5 font-mono">
                        {pb.items.map((ci, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700">
                              {ci.qty}x {ci.itemName || ci.itemCode}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency((ci.rate || 0) * ci.qty)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 font-bold">
                      <span className="text-gray-600">Calculated Bundle Value:</span>
                      <span className="font-mono text-blue-600 text-sm">{formatCurrency(total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD CATALOG ITEM (ERPNext Complete Fields) */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">New Item Master</h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKU-SRV-99"
                    value={itemForm.itemCode}
                    onChange={(e) => setItemForm({ ...itemForm, itemCode: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High Performance Server Blade"
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Item Group *</label>
                  <select
                    value={itemForm.itemGroup}
                    onChange={(e) => setItemForm({ ...itemForm, itemGroup: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {itemGroups.map((g) => (
                      <option key={g.id} value={g.itemGroupName}>
                        {g.itemGroupName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Default Unit of Measure (UOM)</label>
                  <select
                    value={itemForm.stockUom}
                    onChange={(e) => setItemForm({ ...itemForm, stockUom: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Nos">Nos (Units)</option>
                    <option value="Hours">Hours</option>
                    <option value="Years">Years</option>
                    <option value="Mtr">Meters</option>
                    <option value="Kg">Kilograms</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Standard Selling Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.standardRate}
                    onChange={(e) => setItemForm({ ...itemForm, standardRate: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Valuation Rate / Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.valuationRate}
                    onChange={(e) => setItemForm({ ...itemForm, valuationRate: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. NextGen Hardware"
                    value={itemForm.brand}
                    onChange={(e) => setItemForm({ ...itemForm, brand: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. 8901234567890"
                    value={itemForm.barcode}
                    onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkboxes for Item Capabilities */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isStockItem}
                    onChange={(e) => setItemForm({ ...itemForm, isStockItem: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Maintain Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isSalesItem}
                    onChange={(e) => setItemForm({ ...itemForm, isSalesItem: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Allow Sales</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isPurchaseItem}
                    onChange={(e) => setItemForm({ ...itemForm, isPurchaseItem: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Allow Purchase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.hasSerialNo}
                    onChange={(e) => setItemForm({ ...itemForm, hasSerialNo: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Has Serial No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.hasBatchNo}
                    onChange={(e) => setItemForm({ ...itemForm, hasBatchNo: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Has Batch No</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed technical or sales specification..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: VIEW ITEM DETAILS */}
      {/* ========================================================================= */}
      {selectedItemForView && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="font-bold text-gray-900 text-base">{selectedItemForView.itemName}</span>
                <p className="font-mono text-gray-400 text-xs">{selectedItemForView.itemCode}</p>
              </div>
              <button
                onClick={() => setSelectedItemForView(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-xs font-bold">
                {selectedItemForView.disabled ? "DISABLED" : "ENABLED / ACTIVE"}
              </span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold">
                Group: {selectedItemForView.itemGroup}
              </span>
            </div>

            {/* Key Rates Card */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono">Standard Selling Rate</span>
                <p className="text-base font-mono font-bold text-gray-900">
                  {formatCurrency(selectedItemForView.standardRate)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono">Valuation Rate</span>
                <p className="text-base font-mono font-bold text-gray-600">
                  {formatCurrency(selectedItemForView.valuationRate || 0)}
                </p>
              </div>
            </div>

            {/* ERPNext Master Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                Item Master Specifications
              </h4>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div className="p-2 border border-gray-100 rounded">
                  <span className="text-gray-400 block text-[10px]">Stock UOM</span>
                  <span className="font-semibold">{selectedItemForView.stockUom}</span>
                </div>
                <div className="p-2 border border-gray-100 rounded">
                  <span className="text-gray-400 block text-[10px]">Brand</span>
                  <span className="font-semibold">{selectedItemForView.brand || "Generic / None"}</span>
                </div>
                <div className="p-2 border border-gray-100 rounded">
                  <span className="text-gray-400 block text-[10px]">Default Warehouse</span>
                  <span className="font-semibold">{selectedItemForView.defaultWarehouse || "Stores - NC"}</span>
                </div>
                <div className="p-2 border border-gray-100 rounded">
                  <span className="text-gray-400 block text-[10px]">Max Discount Allowed</span>
                  <span className="font-semibold font-mono">{selectedItemForView.maxDiscount || 20}%</span>
                </div>
              </div>

              {selectedItemForView.description && (
                <div className="p-3 bg-gray-50/70 rounded border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Description</span>
                  <p className="text-gray-700">{selectedItemForView.description}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => handleDeleteItem(selectedItemForView.id, selectedItemForView.itemCode)}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium"
              >
                Delete Item
              </button>
              <button
                onClick={() => setSelectedItemForView(null)}
                className="px-4 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ITEM GROUP */}
      {/* ========================================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Item Group</h3>
              <button onClick={() => setIsGroupModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Item Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Storage Devices"
                  value={groupForm.itemGroupName}
                  onChange={(e) => setGroupForm({ ...groupForm, itemGroupName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Parent Item Group</label>
                <select
                  value={groupForm.parentItemGroup}
                  onChange={(e) => setGroupForm({ ...groupForm, parentItemGroup: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="All Item Groups">All Item Groups</option>
                  {itemGroups.map((g) => (
                    <option key={g.id} value={g.itemGroupName}>
                      {g.itemGroupName}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={groupForm.isGroup}
                  onChange={(e) => setGroupForm({ ...groupForm, isGroup: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Is Group (Can contain sub-groups)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PRICE LIST */}
      {/* ========================================================================= */}
      {isPriceListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Price List</h3>
              <button onClick={() => setIsPriceListModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreatePriceList} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Price List Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asia Pacific Distributor Rate"
                  value={priceListForm.priceListName}
                  onChange={(e) => setPriceListForm({ ...priceListForm, priceListName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Currency *</label>
                <select
                  value={priceListForm.currency}
                  onChange={(e) => setPriceListForm({ ...priceListForm, currency: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceListForm.selling}
                    onChange={(e) => setPriceListForm({ ...priceListForm, selling: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Selling</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceListForm.buying}
                    onChange={(e) => setPriceListForm({ ...priceListForm, buying: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Buying</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPriceListModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Price List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ITEM PRICE */}
      {/* ========================================================================= */}
      {isItemPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">Add Item Price Entry</h3>
              <button onClick={() => setIsItemPriceModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateItemPrice} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Item *</label>
                <select
                  required
                  value={itemPriceForm.itemCode}
                  onChange={(e) => setItemPriceForm({ ...itemPriceForm, itemCode: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select an Item</option>
                  {items.map((i) => (
                    <option key={i.id || i.itemCode} value={i.itemCode}>
                      {i.itemCode} - {i.itemName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Price List *</label>
                <select
                  value={itemPriceForm.priceListName}
                  onChange={(e) => setItemPriceForm({ ...itemPriceForm, priceListName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {priceLists.map((pl) => (
                    <option key={pl.id} value={pl.priceListName}>
                      {pl.priceListName} ({pl.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Rate *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={itemPriceForm.priceListRate}
                  onChange={(e) => setItemPriceForm({ ...itemPriceForm, priceListRate: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={itemPriceForm.minQty}
                    onChange={(e) => setItemPriceForm({ ...itemPriceForm, minQty: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Valid From</label>
                  <input
                    type="date"
                    value={itemPriceForm.validFrom}
                    onChange={(e) => setItemPriceForm({ ...itemPriceForm, validFrom: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsItemPriceModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Item Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PRODUCT BUNDLE */}
      {/* ========================================================================= */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Product Bundle (Sales Kitting)</h3>
              <button onClick={() => setIsBundleModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateBundle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Parent Bundle Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BDL-SERVER-PACK"
                    value={bundleForm.newItemCode}
                    onChange={(e) => setBundleForm({ ...bundleForm, newItemCode: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Bundle Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Server & Switch Kit"
                    value={bundleForm.bundleName}
                    onChange={(e) => setBundleForm({ ...bundleForm, bundleName: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding bundle components and delivery..."
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Child Components Table */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-xs">Child Items to Bundle</span>
                  <button
                    type="button"
                    onClick={addBundleChildRow}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {bundleForm.items.map((child, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <select
                        required
                        value={child.itemCode}
                        onChange={(e) => handleBundleChildChange(idx, "itemCode", e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="">Select Item</option>
                        {items.map((i) => (
                          <option key={i.id || i.itemCode} value={i.itemCode}>
                            {i.itemCode} - {i.itemName}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={child.qty}
                        onChange={(e) => handleBundleChildChange(idx, "qty", Number(e.target.value))}
                        className="w-16 bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs"
                      />

                      <button
                        type="button"
                        onClick={() => removeBundleChildRow(idx)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsBundleModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Product Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-gray-500 font-sans text-xs">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600" />
          <span>Loading Items &amp; Pricing Master...</span>
        </div>
      }
    >
      <ItemsContent />
    </Suspense>
  );
}
