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
  Truck,
  DollarSign,
  Receipt,
  Cpu,
  ShieldCheck,
  Scale,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  Sparkles,
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
  ItemUomConversion,
} from "@/types/sales";

export type ItemFormTab =
  | "details"
  | "inventory"
  | "sales"
  | "purchasing"
  | "accounting"
  | "pricing"
  | "tax"
  | "manufacturing"
  | "quality"
  | "variants"
  | "uom"
  | "connections";

const ITEM_TABS: { id: ItemFormTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "details", label: "Details", icon: Info },
  { id: "inventory", label: "Inventory", icon: Warehouse },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "purchasing", label: "Purchasing", icon: Truck },
  { id: "accounting", label: "Accounting", icon: Coins },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "tax", label: "Tax", icon: Receipt },
  { id: "manufacturing", label: "Manufacturing", icon: Cpu },
  { id: "quality", label: "Quality", icon: ShieldCheck },
  { id: "variants", label: "Variants", icon: FolderTree },
  { id: "uom", label: "UOM", icon: Scale },
  { id: "connections", label: "Connections", icon: ExternalLink },
];

const INITIAL_ITEM_FORM = {
  itemCode: "",
  itemName: "",
  itemGroup: "Hardware",
  stockUom: "Nos",
  imageUrl: "",
  isStockItem: true,
  isSalesItem: true,
  isPurchaseItem: true,
  isFixedAsset: false,
  allowAlternativeItem: false,
  hasVariants: false,
  standardRate: 0,
  valuationRate: 0,
  lastPurchaseRate: 0,
  valuationMethod: "FIFO",
  maxDiscount: 20,
  hasSerialNo: false,
  hasBatchNo: false,
  hasExpiryDate: false,
  shelfLifeInDays: 0,
  warrantyPeriod: "",
  weightPerUnit: 0,
  weightUom: "Kg",
  minOrderQty: 0,
  safetyStock: 0,
  leadTimeDays: 0,
  brand: "",
  description: "",
  barcode: "",
  disabled: false,
  defaultWarehouse: "Main Warehouse",
  defaultIncomeAccount: "4110 - Sales Revenue",
  defaultExpenseAccount: "5110 - Cost of Goods Sold",
  defaultSupplier: "",
  deliveredBySupplier: false,
  grantCommission: true,
  enableDeferredRevenue: false,
  enableDeferredExpense: false,
  includeItemInManufacturing: true,
  isSubContractedItem: false,
  defaultBom: "",
  productionCapacity: 0,
  inspectionRequiredBeforePurchase: false,
  inspectionRequiredBeforeDelivery: false,
  qualityInspectionTemplate: "",
  variantBasedOn: "Item Attribute",
  uoms: [
    { uom: "Nos", conversionFactor: 1.0 },
    { uom: "Box (10 Units)", conversionFactor: 10.0 },
    { uom: "Master Carton (50 Units)", conversionFactor: 50.0 },
  ],
};

function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const itemParam = searchParams.get("item") || searchParams.get("id");

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

  // Modals & Drawers with 12-Tab System
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<ItemFormTab>("details");
  const [selectedItemForView, setSelectedItemForView] = useState<CatalogItem | null>(null);
  const [inspectorActiveTab, setInspectorActiveTab] = useState<ItemFormTab>("details");
  const [isEditingInInspector, setIsEditingInInspector] = useState(false);
  const [inspectorEditForm, setInspectorEditForm] = useState<typeof INITIAL_ITEM_FORM>(INITIAL_ITEM_FORM);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [isItemPriceModalOpen, setIsItemPriceModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  // New Item Form State (Complete 12-Tab ERPNext fields)
  const [itemForm, setItemForm] = useState<typeof INITIAL_ITEM_FORM>(INITIAL_ITEM_FORM);

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

  // Deep Link URL Hash sync (e.g. #accounting, #inventory, #sales)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toLowerCase() as ItemFormTab;
      if (hash && ITEM_TABS.some((t) => t.id === hash)) {
        setInspectorActiveTab(hash);
      }
    }
  }, []);

  // Sync item selection from query param (e.g. ?item=SKU010)
  useEffect(() => {
    if (itemParam && items.length > 0) {
      const found = items.find(
        (i) => i.id === itemParam || i.itemCode.toLowerCase() === itemParam.toLowerCase()
      );
      if (found) {
        handleOpenItemInspector(found);
      }
    }
  }, [itemParam, items]);

  const handleSelectInspectorTab = (tab: ItemFormTab) => {
    setInspectorActiveTab(tab);
    if (typeof window !== "undefined" && selectedItemForView) {
      window.history.replaceState(
        null,
        "",
        `/sales/items?item=${selectedItemForView.itemCode}#${tab}`
      );
    }
  };

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
      setItemForm(INITIAL_ITEM_FORM);
      setModalActiveTab("details");
    } catch (err: any) {
      alert(err.message || "Failed to create item");
    }
  };

  const handleOpenItemInspector = (item: CatalogItem) => {
    setSelectedItemForView(item);
    setInspectorActiveTab("details");
    setIsEditingInInspector(false);
    setInspectorEditForm({
      itemCode: item.itemCode,
      itemName: item.itemName,
      itemGroup: item.itemGroup || "Hardware",
      stockUom: item.stockUom || "Nos",
      imageUrl: item.imageUrl || "",
      isStockItem: item.isStockItem ?? true,
      isSalesItem: item.isSalesItem ?? true,
      isPurchaseItem: item.isPurchaseItem ?? true,
      isFixedAsset: item.isFixedAsset ?? false,
      allowAlternativeItem: item.allowAlternativeItem ?? false,
      hasVariants: item.hasVariants ?? false,
      standardRate: item.standardRate || 0,
      valuationRate: item.valuationRate || 0,
      lastPurchaseRate: item.lastPurchaseRate || 0,
      valuationMethod: item.valuationMethod || "FIFO",
      maxDiscount: item.maxDiscount || 20,
      hasSerialNo: item.hasSerialNo ?? false,
      hasBatchNo: item.hasBatchNo ?? false,
      hasExpiryDate: item.hasExpiryDate ?? false,
      shelfLifeInDays: item.shelfLifeInDays || 0,
      warrantyPeriod: item.warrantyPeriod || "",
      weightPerUnit: item.weightPerUnit || 0,
      weightUom: item.weightUom || "Kg",
      minOrderQty: item.minOrderQty || 0,
      safetyStock: item.safetyStock || 0,
      leadTimeDays: item.leadTimeDays || 0,
      brand: item.brand || "",
      description: item.description || "",
      barcode: item.barcode || "",
      disabled: item.disabled ?? false,
      defaultWarehouse: item.defaultWarehouse || "Main Warehouse",
      defaultIncomeAccount: item.defaultIncomeAccount || "4110 - Sales Revenue",
      defaultExpenseAccount: item.defaultExpenseAccount || "5110 - Cost of Goods Sold",
      defaultSupplier: item.defaultSupplier || "",
      deliveredBySupplier: item.deliveredBySupplier ?? false,
      grantCommission: item.grantCommission ?? true,
      enableDeferredRevenue: item.enableDeferredRevenue ?? false,
      enableDeferredExpense: item.enableDeferredExpense ?? false,
      includeItemInManufacturing: item.includeItemInManufacturing ?? true,
      isSubContractedItem: item.isSubContractedItem ?? false,
      defaultBom: item.defaultBom || "",
      productionCapacity: item.productionCapacity || 0,
      inspectionRequiredBeforePurchase: item.inspectionRequiredBeforePurchase ?? false,
      inspectionRequiredBeforeDelivery: item.inspectionRequiredBeforeDelivery ?? false,
      qualityInspectionTemplate: item.qualityInspectionTemplate || "",
      variantBasedOn: item.variantBasedOn || "Item Attribute",
      uoms: item.uoms && item.uoms.length > 0 ? item.uoms : [
        { uom: item.stockUom || "Nos", conversionFactor: 1.0 },
        { uom: "Box", conversionFactor: 10.0 },
      ],
    });
  };

  const handleUpdateItemFromInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForView) return;
    try {
      const updated = await updateItem(selectedItemForView.id, inspectorEditForm);
      showNotification(`Item "${updated.itemCode}" updated successfully!`);
      loadAllData();
      setSelectedItemForView(updated);
      setIsEditingInInspector(false);
    } catch (err: any) {
      alert(err.message || "Failed to update item");
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
                            onClick={() => handleOpenItemInspector(item)}
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
                              onClick={() => handleOpenItemInspector(item)}
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
      {/* MODAL: ADD / CREATE ITEM MASTER (12-Tab ERPNext Layout) */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">New Item Master</h3>
                  <p className="text-[11px] text-gray-500">ERPNext 12-Tab Catalog Definition</p>
                </div>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 12-Tab Horizontal Switcher */}
            <div className="flex items-center gap-1 px-4 py-2 bg-gray-100/70 border-b border-gray-200 overflow-x-auto text-[11px] scrollbar-thin">
              {ITEM_TABS.map((t) => {
                const IconComponent = t.icon;
                const isCurrent = modalActiveTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModalActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                      isCurrent
                        ? "bg-white text-blue-700 font-semibold shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isCurrent ? "text-blue-600" : "text-gray-400"}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateItem} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* TAB 1: DETAILS */}
              {modalActiveTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Item Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SKU010 or HW-SRV-01"
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
                        placeholder="e.g. Camera or Enterprise Server"
                        value={itemForm.itemName}
                        onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
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
                      <label className="block text-gray-700 font-semibold mb-1">Default Stock UOM</label>
                      <select
                        value={itemForm.stockUom}
                        onChange={(e) => setItemForm({ ...itemForm, stockUom: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Nos">Nos (Units)</option>
                        <option value="Hours">Hours</option>
                        <option value="Years">Years</option>
                        <option value="Kg">Kilograms (Kg)</option>
                        <option value="Mtr">Meters (Mtr)</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. OptiView, NextGen"
                        value={itemForm.brand}
                        onChange={(e) => setItemForm({ ...itemForm, brand: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Image URL (Product Thumbnail)</label>
                    <input
                      type="url"
                      placeholder="https://images.pexels.com/... or /static/image.jpg"
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Detailed item specifications, technical notes, or sales brochure text..."
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.isStockItem}
                        onChange={(e) => setItemForm({ ...itemForm, isStockItem: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Maintain Stock (Stock Item)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.isSalesItem}
                        onChange={(e) => setItemForm({ ...itemForm, isSalesItem: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Allow Sales</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.isPurchaseItem}
                        onChange={(e) => setItemForm({ ...itemForm, isPurchaseItem: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Allow Purchase</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.isFixedAsset}
                        onChange={(e) => setItemForm({ ...itemForm, isFixedAsset: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Is Fixed Asset</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.allowAlternativeItem}
                        onChange={(e) => setItemForm({ ...itemForm, allowAlternativeItem: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Allow Alternative Item</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.disabled}
                        onChange={(e) => setItemForm({ ...itemForm, disabled: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-700 font-medium">Disabled</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY */}
              {modalActiveTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Default Warehouse</label>
                      <input
                        type="text"
                        placeholder="e.g. Main Warehouse, Stores - NC"
                        value={itemForm.defaultWarehouse}
                        onChange={(e) => setItemForm({ ...itemForm, defaultWarehouse: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Barcode / SKU Barcode</label>
                      <input
                        type="text"
                        placeholder="e.g. 8901234567890"
                        value={itemForm.barcode}
                        onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-3">
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.hasExpiryDate}
                        onChange={(e) => setItemForm({ ...itemForm, hasExpiryDate: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Has Expiry Date</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Shelf Life (Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemForm.shelfLifeInDays}
                        onChange={(e) => setItemForm({ ...itemForm, shelfLifeInDays: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Warranty Period</label>
                      <input
                        type="text"
                        placeholder="e.g. 24 Months Manufacturer"
                        value={itemForm.warrantyPeriod}
                        onChange={(e) => setItemForm({ ...itemForm, warrantyPeriod: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Weight Per Unit ({itemForm.weightUom})</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={itemForm.weightPerUnit}
                        onChange={(e) => setItemForm({ ...itemForm, weightPerUnit: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
                    <div className="font-semibold text-blue-900 text-xs">Reorder Levels & Auto-Replenishment</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-600 text-[11px] mb-1">Safety Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={itemForm.safetyStock}
                          onChange={(e) => setItemForm({ ...itemForm, safetyStock: Number(e.target.value) })}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[11px] mb-1">Min Order Qty</label>
                        <input
                          type="number"
                          min="0"
                          value={itemForm.minOrderQty}
                          onChange={(e) => setItemForm({ ...itemForm, minOrderQty: Number(e.target.value) })}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[11px] mb-1">Lead Time (Days)</label>
                        <input
                          type="number"
                          min="0"
                          value={itemForm.leadTimeDays}
                          onChange={(e) => setItemForm({ ...itemForm, leadTimeDays: Number(e.target.value) })}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SALES */}
              {modalActiveTab === "sales" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
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
                      <label className="block text-gray-700 font-semibold mb-1">Max Discount Allowed (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={itemForm.maxDiscount}
                        onChange={(e) => setItemForm({ ...itemForm, maxDiscount: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.grantCommission}
                        onChange={(e) => setItemForm({ ...itemForm, grantCommission: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Grant Commission to Sales Team</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      When enabled, order line items containing this item are included in sales team commission incentive calculations.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.enableDeferredRevenue}
                        onChange={(e) => setItemForm({ ...itemForm, enableDeferredRevenue: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Enable Deferred Revenue</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Amortizes recognition of revenue over a multi-month period on customer invoices.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: PURCHASING */}
              {modalActiveTab === "purchasing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Default Supplier</label>
                      <input
                        type="text"
                        placeholder="e.g. Global Vision Optics, Intel Corp"
                        value={itemForm.defaultSupplier}
                        onChange={(e) => setItemForm({ ...itemForm, defaultSupplier: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Last Purchase Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.lastPurchaseRate}
                        onChange={(e) => setItemForm({ ...itemForm, lastPurchaseRate: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.deliveredBySupplier}
                        onChange={(e) => setItemForm({ ...itemForm, deliveredBySupplier: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Delivered By Supplier (Drop Shipping)</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Directly drop-shipped from supplier to customer without stocking in internal warehouses.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.enableDeferredExpense}
                        onChange={(e) => setItemForm({ ...itemForm, enableDeferredExpense: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Enable Deferred Expense</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Amortizes COGS / expense entries over the product subscription lifecycle.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: ACCOUNTING */}
              {modalActiveTab === "accounting" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Default Income Account</label>
                      <input
                        type="text"
                        value={itemForm.defaultIncomeAccount}
                        onChange={(e) => setItemForm({ ...itemForm, defaultIncomeAccount: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Default Expense Account</label>
                      <input
                        type="text"
                        value={itemForm.defaultExpenseAccount}
                        onChange={(e) => setItemForm({ ...itemForm, defaultExpenseAccount: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Valuation Method</label>
                      <select
                        value={itemForm.valuationMethod}
                        onChange={(e) => setItemForm({ ...itemForm, valuationMethod: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="FIFO">FIFO (First In First Out)</option>
                        <option value="Moving Average">Moving Average</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Valuation Rate / Unit Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.valuationRate}
                        onChange={(e) => setItemForm({ ...itemForm, valuationRate: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PRICING */}
              {modalActiveTab === "pricing" && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900 text-xs mb-1">Price Lists & Multi-Currency Rates</div>
                    <p className="text-[11px] text-gray-500 mb-3">
                      Standard base rate applies to Standard Selling list. Additional rates can be managed via the Item Prices tab.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-gray-200 rounded">
                        <span className="text-[10px] text-gray-400 uppercase font-mono">Standard Selling Rate</span>
                        <div className="text-base font-bold font-mono text-gray-900">
                          {formatCurrency(itemForm.standardRate)}
                        </div>
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded">
                        <span className="text-[10px] text-gray-400 uppercase font-mono">Expected Gross Margin</span>
                        <div className="text-base font-bold font-mono text-emerald-600">
                          {itemForm.standardRate > 0 && itemForm.valuationRate > 0
                            ? `${(((itemForm.standardRate - itemForm.valuationRate) / itemForm.standardRate) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: TAX */}
              {modalActiveTab === "tax" && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Item Tax Templates</div>
                    <p className="text-[11px] text-gray-500">
                      Standard company tax rates apply automatically to this item unless specific exemptions are mapped.
                    </p>
                    <div className="p-2 bg-white rounded border border-gray-200 text-xs flex justify-between">
                      <span className="text-gray-700 font-medium">Standard Output GST / VAT:</span>
                      <span className="font-mono font-bold text-gray-900">18.00%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: MANUFACTURING */}
              {modalActiveTab === "manufacturing" && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.includeItemInManufacturing}
                        onChange={(e) => setItemForm({ ...itemForm, includeItemInManufacturing: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Include in Manufacturing / Work Orders</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.isSubContractedItem}
                        onChange={(e) => setItemForm({ ...itemForm, isSubContractedItem: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Is Subcontracted Item</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Default BOM</label>
                      <input
                        type="text"
                        placeholder="e.g. BOM-CAM-001"
                        value={itemForm.defaultBom}
                        onChange={(e) => setItemForm({ ...itemForm, defaultBom: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Production Capacity (Units/Day)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemForm.productionCapacity}
                        onChange={(e) => setItemForm({ ...itemForm, productionCapacity: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: QUALITY */}
              {modalActiveTab === "quality" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.inspectionRequiredBeforePurchase}
                        onChange={(e) => setItemForm({ ...itemForm, inspectionRequiredBeforePurchase: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Inspection Required Before Purchase Receipt</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.inspectionRequiredBeforeDelivery}
                        onChange={(e) => setItemForm({ ...itemForm, inspectionRequiredBeforeDelivery: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Inspection Required Before Delivery Dispatch</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Quality Inspection Template</label>
                    <input
                      type="text"
                      placeholder="e.g. High Precision Optical QC"
                      value={itemForm.qualityInspectionTemplate}
                      onChange={(e) => setItemForm({ ...itemForm, qualityInspectionTemplate: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 10: VARIANTS */}
              {modalActiveTab === "variants" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.hasVariants}
                        onChange={(e) => setItemForm({ ...itemForm, hasVariants: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Has Item Variants (Color, Size, Resolution)</span>
                    </label>
                  </div>
                  {itemForm.hasVariants && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Variant Based On</label>
                      <select
                        value={itemForm.variantBasedOn}
                        onChange={(e) => setItemForm({ ...itemForm, variantBasedOn: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Item Attribute">Item Attribute (e.g. 4K, 8K, Black, Silver)</option>
                        <option value="Manufacturer">Manufacturer</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 11: UOM */}
              {modalActiveTab === "uom" && (
                <div className="space-y-4">
                  <div className="font-semibold text-gray-900 text-xs">Unit of Measure (UOM) Conversions</div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                    {itemForm.uoms.map((u, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded">
                        <span className="font-semibold text-gray-800 text-xs w-1/2">{u.uom}</span>
                        <span className="text-gray-500 font-mono text-xs">1 {u.uom} =</span>
                        <span className="font-bold font-mono text-blue-700 text-xs">{u.conversionFactor} {itemForm.stockUom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 12: CONNECTIONS */}
              {modalActiveTab === "connections" && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="font-semibold text-gray-900 text-xs">Linked Transaction Streams</div>
                  <p className="text-[11px] text-gray-500">
                    Once created, this item can be referenced in Sales Orders, Delivery Notes, Quotations, Purchase Orders, and General Ledger postings.
                  </p>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs transition-colors"
                  >
                    Save Item Master
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: 12-TAB ITEM MASTER INSPECTOR & 360 VIEWER */}
      {/* ========================================================================= */}
      {selectedItemForView && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in-50 duration-150">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Inspector Top Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedItemForView.imageUrl ? (
                    <img
                      src={selectedItemForView.imageUrl}
                      alt={selectedItemForView.itemName}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-300 shadow-2xs bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-2xs">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{selectedItemForView.itemName}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedItemForView.disabled ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {selectedItemForView.disabled ? "DISABLED" : "ACTIVE"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <span>Code: <strong className="text-gray-900">{selectedItemForView.itemCode}</strong></span>
                      <span>•</span>
                      <span>Group: <strong className="text-gray-900">{selectedItemForView.itemGroup}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteItem(selectedItemForView.id, selectedItemForView.itemCode)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItemForView(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-200/60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Rates Metric Strip */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-gray-200/70 text-center">
                <div className="bg-white p-2 rounded border border-gray-200 shadow-2xs">
                  <span className="text-[9px] text-gray-400 uppercase font-mono block">Standard Rate</span>
                  <span className="font-mono font-bold text-gray-900 text-xs">{formatCurrency(selectedItemForView.standardRate)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 shadow-2xs">
                  <span className="text-[9px] text-gray-400 uppercase font-mono block">Valuation Rate</span>
                  <span className="font-mono font-bold text-gray-600 text-xs">{formatCurrency(selectedItemForView.valuationRate || 0)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 shadow-2xs">
                  <span className="text-[9px] text-gray-400 uppercase font-mono block">Last Purchase</span>
                  <span className="font-mono font-bold text-gray-700 text-xs">{formatCurrency(selectedItemForView.lastPurchaseRate || 0)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 shadow-2xs">
                  <span className="text-[9px] text-gray-400 uppercase font-mono block">Stock UOM</span>
                  <span className="font-mono font-bold text-blue-700 text-xs">{selectedItemForView.stockUom}</span>
                </div>
              </div>
            </div>

            {/* 12-Tab Inspector Nav */}
            <div className="flex items-center gap-1 px-4 py-2 bg-gray-100/70 border-b border-gray-200 overflow-x-auto text-[11px] scrollbar-thin">
              {ITEM_TABS.map((t) => {
                const IconComp = t.icon;
                const isCurrent = inspectorActiveTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectInspectorTab(t.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                      isCurrent
                        ? "bg-white text-blue-700 font-bold shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isCurrent ? "text-blue-600" : "text-gray-400"}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inspector Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* TAB 1: DETAILS */}
              {inspectorActiveTab === "details" && (
                <div className="space-y-4">
                  {selectedItemForView.imageUrl && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                      <img
                        src={selectedItemForView.imageUrl}
                        alt={selectedItemForView.itemName}
                        className="max-h-48 rounded-lg object-contain shadow-xs bg-white p-1 border border-gray-200"
                      />
                      <span className="text-[10px] text-gray-400 font-mono">Product Image / Catalog Photo</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] block uppercase font-mono">Brand</span>
                      <span className="font-semibold text-gray-900">{selectedItemForView.brand || "Generic / None"}</span>
                    </div>
                    <div className="p-2.5 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] block uppercase font-mono">Stock UOM</span>
                      <span className="font-semibold text-gray-900">{selectedItemForView.stockUom}</span>
                    </div>
                  </div>

                  {selectedItemForView.description && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                      <span className="text-[10px] text-gray-400 uppercase font-mono font-semibold">Description</span>
                      <p className="text-gray-700 leading-relaxed">{selectedItemForView.description}</p>
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-semibold block">Item Capabilities</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.isStockItem ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Maintain Stock (Stock Item)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.isSalesItem ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Allow Sales (Sales Item)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.isPurchaseItem ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Allow Purchase (Purchase Item)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.isFixedAsset ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Fixed Asset</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.allowAlternativeItem ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Allow Alternative Item</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${selectedItemForView.includeItemInManufacturing ? "text-emerald-600" : "text-gray-300"}`} />
                        <span>Include in Manufacturing</span>
                      </div>
                    </div>
                  </div>

                  {/* Barcodes Subtable */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-semibold block">Barcodes Table</span>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Barcode Value</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">UOM</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{selectedItemForView.barcode || "8901234567890"}</td>
                            <td className="py-2 px-3 text-gray-600">EAN-13</td>
                            <td className="py-2 px-3 text-gray-600">{selectedItemForView.stockUom}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY */}
              {inspectorActiveTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Default Warehouse</span>
                      <span className="font-semibold text-gray-900">{selectedItemForView.defaultWarehouse || "Main Warehouse"}</span>
                    </div>
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Barcode / SKU</span>
                      <span className="font-mono font-bold text-gray-900">{selectedItemForView.barcode || "N/A"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 border border-gray-200 rounded bg-gray-50/50 text-center">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Shelf Life</span>
                      <span className="font-mono font-bold text-gray-900">{selectedItemForView.shelfLifeInDays || 730} Days</span>
                    </div>
                    <div className="p-2.5 border border-gray-200 rounded bg-gray-50/50 text-center">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Warranty Period</span>
                      <span className="font-mono font-bold text-gray-900">{selectedItemForView.warrantyPeriod || "24 Months"}</span>
                    </div>
                    <div className="p-2.5 border border-gray-200 rounded bg-gray-50/50 text-center">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Weight Per Unit</span>
                      <span className="font-mono font-bold text-gray-900">{selectedItemForView.weightPerUnit || 0.65} {selectedItemForView.weightUom || "Kg"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${selectedItemForView.hasSerialNo ? "text-emerald-600" : "text-gray-300"}`} />
                      <span>Serial Number Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${selectedItemForView.hasBatchNo ? "text-emerald-600" : "text-gray-300"}`} />
                      <span>Batch Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${selectedItemForView.hasExpiryDate ? "text-emerald-600" : "text-gray-300"}`} />
                      <span>Expiry Date Required</span>
                    </div>
                  </div>

                  {/* Reorder Levels Subtable */}
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
                    <div className="font-semibold text-blue-900 text-xs">Reorder Levels & Auto-Replenishment Table</div>
                    <div className="bg-white border border-blue-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/70 border-b border-blue-200 text-blue-800 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Warehouse</th>
                            <th className="py-2 px-3">Reorder Level</th>
                            <th className="py-2 px-3">Reorder Qty</th>
                            <th className="py-2 px-3">Request Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">{selectedItemForView.defaultWarehouse || "Main Warehouse"}</td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{selectedItemForView.safetyStock || 10} {selectedItemForView.stockUom}</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{selectedItemForView.minOrderQty || 5} {selectedItemForView.stockUom}</td>
                            <td className="py-2 px-3 text-gray-600">Purchase</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">Stores - Regional DC</td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">5 {selectedItemForView.stockUom}</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">10 {selectedItemForView.stockUom}</td>
                            <td className="py-2 px-3 text-gray-600">Material Transfer</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SALES */}
              {inspectorActiveTab === "sales" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Standard Selling Rate</span>
                      <span className="font-mono font-bold text-gray-900 text-sm">{formatCurrency(selectedItemForView.standardRate)}</span>
                    </div>
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Max Discount Allowed</span>
                      <span className="font-mono font-bold text-blue-700 text-sm">{selectedItemForView.maxDiscount || 20}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 block">Sales Team Commission Eligible</span>
                      <span className="text-[11px] text-gray-500">Included in sales reps incentive splits on quotation/order</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedItemForView.grantCommission ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                    }`}>
                      {selectedItemForView.grantCommission ? "YES (COMMISSIONABLE)" : "NO"}
                    </span>
                  </div>

                  {/* Customer Specific Items Table */}
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Customer Specific Item Codes</div>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Customer Name</th>
                            <th className="py-2 px-3">Customer Item Code / Ref</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">Apex Global Technologies</td>
                            <td className="py-2 px-3 font-mono text-blue-700">APEX-CAM-OPT-99</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PURCHASING */}
              {inspectorActiveTab === "purchasing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Default Supplier</span>
                      <span className="font-semibold text-gray-900">{selectedItemForView.defaultSupplier || "Global Vision Optics Inc."}</span>
                    </div>
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Last Purchase Rate</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(selectedItemForView.lastPurchaseRate || 0)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 block">Drop-Ship Fulfillment</span>
                      <span className="text-[11px] text-gray-500">Delivered directly by supplier to customer</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedItemForView.deliveredBySupplier ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600"
                    }`}>
                      {selectedItemForView.deliveredBySupplier ? "DROP-SHIP" : "INTERNAL STORES"}
                    </span>
                  </div>

                  {/* Supplier Items Subtable */}
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Item Supplier Mapping</div>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Supplier</th>
                            <th className="py-2 px-3">Supplier Part No</th>
                            <th className="py-2 px-3">Last Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">{selectedItemForView.defaultSupplier || "Global Vision Optics Inc."}</td>
                            <td className="py-2 px-3 font-mono text-gray-600">GVO-CAM-8800X</td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{formatCurrency(selectedItemForView.lastPurchaseRate || 500)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACCOUNTING (ERPNext #accounting Layout) */}
              {inspectorActiveTab === "accounting" && (
                <div className="space-y-4">
                  {/* Item Defaults / Company Defaults Subtable */}
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Item Defaults per Company</div>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Company</th>
                            <th className="py-2 px-3">Default Warehouse</th>
                            <th className="py-2 px-3">Default Income Account</th>
                            <th className="py-2 px-3">Default Expense Account</th>
                            <th className="py-2 px-3">Cost Center</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">NextGen Corp</td>
                            <td className="py-2 px-3 font-mono text-gray-700">{selectedItemForView.defaultWarehouse || "Main Warehouse"}</td>
                            <td className="py-2 px-3 font-mono text-blue-700 font-medium">{selectedItemForView.defaultIncomeAccount || "4110 - Sales Revenue"}</td>
                            <td className="py-2 px-3 font-mono text-purple-700 font-medium">{selectedItemForView.defaultExpenseAccount || "5110 - Cost of Goods Sold"}</td>
                            <td className="py-2 px-3 text-gray-600">Main - NC</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Deferred Accounting & Valuation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50 space-y-1">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Valuation Method</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedItemForView.valuationMethod || "FIFO"}</span>
                      <p className="text-[10px] text-gray-500">First In, First Out inventory costing ledger</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50 space-y-1">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Unit Valuation Cost</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">{formatCurrency(selectedItemForView.valuationRate || 500)}</span>
                      <p className="text-[10px] text-gray-500">Current moving stock valuation</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Deferred Accounting Parameters</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-white rounded border border-gray-200 text-xs">
                        <span className="text-gray-500 block text-[10px]">Deferred Revenue:</span>
                        <span className="font-semibold">{selectedItemForView.enableDeferredRevenue ? "Enabled (Multi-month recognition)" : "Disabled (Immediate recognition on Invoice)"}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200 text-xs">
                        <span className="text-gray-500 block text-[10px]">Deferred Expense:</span>
                        <span className="font-semibold">{selectedItemForView.enableDeferredExpense ? "Enabled (COGS Amortization)" : "Disabled (Immediate recognition on Delivery)"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PRICING */}
              {inspectorActiveTab === "pricing" && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="font-semibold text-gray-900 text-xs">Price Lists Matrix</div>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Price List</th>
                            <th className="py-2 px-3">Currency</th>
                            <th className="py-2 px-3">Rate</th>
                            <th className="py-2 px-3">Gross Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">Standard Selling</td>
                            <td className="py-2 px-3 font-mono text-gray-600">INR (₹)</td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{formatCurrency(selectedItemForView.standardRate)}</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-600">
                              {selectedItemForView.standardRate > 0 && selectedItemForView.valuationRate > 0
                                ? `${(((selectedItemForView.standardRate - selectedItemForView.valuationRate) / selectedItemForView.standardRate) * 100).toFixed(1)}%`
                                : "33.3%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-gray-800">Channel Partner / Distributor</td>
                            <td className="py-2 px-3 font-mono text-gray-600">INR (₹)</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{formatCurrency(selectedItemForView.standardRate * 0.85)}</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-600">21.5%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: TAX */}
              {inspectorActiveTab === "tax" && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="font-semibold text-gray-900 text-xs">Item Tax Templates & Tax Rules</div>
                  <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Item Tax Template</th>
                          <th className="py-2 px-3">Tax Category</th>
                          <th className="py-2 px-3">Tax Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-3 font-semibold text-gray-800">Standard GST 18%</td>
                          <td className="py-2 px-3 text-gray-600">In-State / Intra-State</td>
                          <td className="py-2 px-3 font-mono font-bold text-gray-900">18.00%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: MANUFACTURING */}
              {inspectorActiveTab === "manufacturing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Default BOM</span>
                      <span className="font-mono font-semibold text-gray-900">{selectedItemForView.defaultBom || "BOM-CAM-001"}</span>
                    </div>
                    <div className="p-3 border border-gray-200 rounded bg-gray-50/50">
                      <span className="text-gray-400 text-[10px] uppercase font-mono block">Daily Capacity</span>
                      <span className="font-mono font-semibold text-gray-900">{selectedItemForView.productionCapacity || 100} Units/Day</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: QUALITY */}
              {inspectorActiveTab === "quality" && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${selectedItemForView.inspectionRequiredBeforePurchase ? "text-emerald-600" : "text-gray-300"}`} />
                      <span>Pre-Purchase Quality Inspection Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${selectedItemForView.inspectionRequiredBeforeDelivery ? "text-emerald-600" : "text-gray-300"}`} />
                      <span>Pre-Delivery Quality Inspection Required</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: VARIANTS */}
              {inspectorActiveTab === "variants" && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="font-semibold text-gray-900 text-xs">Variants Configuration</div>
                  <p className="text-gray-600 text-xs">
                    {selectedItemForView.hasVariants ? `Variant based on ${selectedItemForView.variantBasedOn || "Item Attribute"}` : "Standard single-SKU item master. No active variant matrix configured."}
                  </p>
                </div>
              )}

              {/* TAB 11: UOM CONVERSIONS */}
              {inspectorActiveTab === "uom" && (
                <div className="space-y-3">
                  <div className="font-semibold text-gray-900 text-xs">Multi-Unit Conversion Matrix (ERPNext #uom_tab)</div>
                  <div className="space-y-2">
                    {(selectedItemForView.uoms && selectedItemForView.uoms.length > 0 ? selectedItemForView.uoms : [
                      { uom: selectedItemForView.stockUom || "Nos", conversionFactor: 1.0 },
                      { uom: "Box (10 Units)", conversionFactor: 10.0 },
                      { uom: "Master Carton (50 Units)", conversionFactor: 50.0 }
                    ]).map((u, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded">
                        <span className="font-semibold text-gray-800">{u.uom}</span>
                        <span className="font-mono text-blue-700 font-bold">1 {u.uom} = {u.conversionFactor} {selectedItemForView.stockUom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 12: CONNECTIONS */}
              {inspectorActiveTab === "connections" && (
                <div className="space-y-3">
                  <div className="font-semibold text-gray-900 text-xs">Linked Transaction Streams & Documents (ERPNext #dashboard_tab)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/sales/orders`}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800 group-hover:text-blue-700">Sales Orders</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                    </Link>

                    <Link
                      href={`/sales/quotations`}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800 group-hover:text-blue-700">Quotations</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                    </Link>

                    <Link
                      href={`/sales/delivery-notes`}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800 group-hover:text-blue-700">Delivery Notes</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                    </Link>

                    <Link
                      href={`/sales/invoices`}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800 group-hover:text-blue-700">Sales Invoices</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50/70">
              <span className="text-[11px] text-gray-400 font-mono">
                Last modified: {selectedItemForView.createdAt ? new Date(selectedItemForView.createdAt).toLocaleDateString() : "Active"}
              </span>
              <button
                onClick={() => setSelectedItemForView(null)}
                className="px-4 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 font-medium text-xs shadow-2xs"
              >
                Close Inspector
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
