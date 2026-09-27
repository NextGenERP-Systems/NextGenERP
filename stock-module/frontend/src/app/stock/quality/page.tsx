"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Plus,
  Home,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  X,
  Boxes,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";

interface QualityInspectionReading {
  id: string;
  parameterName: string;
  specification: string;
  minValue: number;
  maxValue: number;
  readingValue: number;
  status: "ACCEPTED" | "REJECTED";
}

interface QualityInspection {
  id: string;
  inspectionNumber: string;
  inspectionType: "Incoming" | "Outgoing" | "In Process";
  referenceType: "Purchase Receipt" | "Delivery Note" | "Stock Entry";
  referenceId: string;
  itemCode: string;
  itemName: string;
  sampleSize: number;
  inspectionDate: string;
  inspector: string;
  status: "ACCEPTED" | "REJECTED";
  remarks: string;
  readings: QualityInspectionReading[];
}

const INITIAL_INSPECTIONS: QualityInspection[] = [
  {
    id: "qi-001",
    inspectionNumber: "QI-2026-001",
    inspectionType: "Incoming",
    referenceType: "Purchase Receipt",
    referenceId: "PREC-2026-001",
    itemCode: "ITEM-CPU-X9",
    itemName: "NextGen Core Processor X9 Octa-Core",
    sampleSize: 10,
    inspectionDate: "2026-02-18",
    inspector: "Dr. Aris Thorne (Lead QC)",
    status: "ACCEPTED",
    remarks: "Full lot passed thermal dissipation and voltage stress tolerances.",
    readings: [
      {
        id: "qir-01",
        parameterName: "Die Voltage Stability (VCore)",
        specification: "TDP voltage under 100% prime workload",
        minValue: 1.15,
        maxValue: 1.25,
        readingValue: 1.19,
        status: "ACCEPTED",
      },
      {
        id: "qir-02",
        parameterName: "Thermal Dissipation (°C at 95W)",
        specification: "Operating heat sink junction temperature",
        minValue: 45.0,
        maxValue: 78.0,
        readingValue: 64.2,
        status: "ACCEPTED",
      },
      {
        id: "qir-03",
        parameterName: "Gold Pin Coplanarity (mm)",
        specification: "LGA contact surface planar variation",
        minValue: 0.0,
        maxValue: 0.05,
        readingValue: 0.02,
        status: "ACCEPTED",
      },
    ],
  },
  {
    id: "qi-002",
    inspectionNumber: "QI-2026-002",
    inspectionType: "Outgoing",
    referenceType: "Delivery Note",
    referenceId: "DN-2026-0089",
    itemCode: "ITEM-SRV-ENTERPRISE",
    itemName: "NextGen AI Enterprise Rack Server 4U",
    sampleSize: 3,
    inspectionDate: "2026-02-16",
    inspector: "Elena Rostova (QA Specialist)",
    status: "ACCEPTED",
    remarks: "Pre-dispatch QA check verified IPMI firmware and redundant PSU load sharing.",
    readings: [
      {
        id: "qir-04",
        parameterName: "Dual PSU Load Balancing (%)",
        specification: "Deviation between PSU 1 and PSU 2 under 1500W load",
        minValue: 48.0,
        maxValue: 52.0,
        readingValue: 50.4,
        status: "ACCEPTED",
      },
      {
        id: "qir-05",
        parameterName: "Chassis Acoustic Noise Level (dBA)",
        specification: "Fan speed sound pressure at 1 meter",
        minValue: 30.0,
        maxValue: 65.0,
        readingValue: 58.0,
        status: "ACCEPTED",
      },
    ],
  },
  {
    id: "qi-003",
    inspectionNumber: "QI-2026-003",
    inspectionType: "Incoming",
    referenceType: "Purchase Receipt",
    referenceId: "PREC-2026-004",
    itemCode: "ITEM-RAM-DDR5",
    itemName: "64GB DDR5 ECC Server Memory Module",
    sampleSize: 15,
    inspectionDate: "2026-02-14",
    inspector: "Marcus Vance",
    status: "REJECTED",
    remarks: "Lot failed CAS latency signal integrity test. Redirecting 150 units to Quarantine Warehouse.",
    readings: [
      {
        id: "qir-06",
        parameterName: "CAS Latency Timing (CL)",
        specification: "Standard JEDEC timing clock cycle response",
        minValue: 38.0,
        maxValue: 40.0,
        readingValue: 46.5,
        status: "REJECTED",
      },
      {
        id: "qir-07",
        parameterName: "Operating Voltage (VDD)",
        specification: "Input rail voltage tolerance",
        minValue: 1.08,
        maxValue: 1.12,
        readingValue: 1.1,
        status: "ACCEPTED",
      },
    ],
  },
];

export default function QualityInspectionsPage() {
  const [inspections, setInspections] = useState<QualityInspection[]>(INITIAL_INSPECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Inspection Form State
  const [newType, setNewType] = useState<"Incoming" | "Outgoing" | "In Process">("Incoming");
  const [newRefType, setNewRefType] = useState<"Purchase Receipt" | "Delivery Note" | "Stock Entry">("Purchase Receipt");
  const [newRefId, setNewRefId] = useState("PREC-2026-005");
  const [newItemCode, setNewItemCode] = useState("ITEM-GPU-H100");
  const [newItemName, setNewItemName] = useState("NextGen High-Density GPU Accelerator 80GB");
  const [newSampleSize, setNewSampleSize] = useState(5);
  const [newInspector, setNewInspector] = useState("QA Specialist");
  const [newRemarks, setNewRemarks] = useState("");

  const [formReadings, setFormReadings] = useState<
    Array<{ parameterName: string; specification: string; minValue: number; maxValue: number; readingValue: number }>
  >([
    {
      parameterName: "PCIe Gen 5 Bus Bandwidth (GB/s)",
      specification: "Throughput under continuous memory copy test",
      minValue: 120.0,
      maxValue: 128.0,
      readingValue: 126.5,
    },
    {
      parameterName: "Peak Junction Temperature (°C)",
      specification: "Thermal limit during FP16 tensor core test",
      minValue: 40.0,
      maxValue: 85.0,
      readingValue: 79.2,
    },
    {
      parameterName: "Memory ECC Corrected Errors / Hr",
      specification: "Parity error correction ceiling under heavy load",
      minValue: 0.0,
      maxValue: 2.0,
      readingValue: 0.0,
    },
  ]);

  // Derived metrics
  const totalCount = inspections.length;
  const acceptedCount = inspections.filter((i) => i.status === "ACCEPTED").length;
  const passRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 100;
  const rejectedCount = inspections.filter((i) => i.status === "REJECTED").length;

  // Real-time evaluation of form readings
  const evaluatedFormReadings = formReadings.map((r, idx) => {
    const isValValid =
      r.readingValue !== undefined &&
      (r.minValue === undefined || r.readingValue >= r.minValue) &&
      (r.maxValue === undefined || r.readingValue <= r.maxValue);
    return {
      ...r,
      status: (isValValid ? "ACCEPTED" : "REJECTED") as "ACCEPTED" | "REJECTED",
    };
  });
  const overallFormStatus: "ACCEPTED" | "REJECTED" = evaluatedFormReadings.some((r) => r.status === "REJECTED")
    ? "REJECTED"
    : "ACCEPTED";

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const newQi: QualityInspection = {
      id: `qi-${Date.now()}`,
      inspectionNumber: `QI-2026-${String(inspections.length + 1).padStart(3, "0")}`,
      inspectionType: newType,
      referenceType: newRefType,
      referenceId: newRefId,
      itemCode: newItemCode,
      itemName: newItemName,
      sampleSize: newSampleSize,
      inspectionDate: new Date().toISOString().split("T")[0],
      inspector: newInspector,
      status: overallFormStatus,
      remarks: newRemarks || "Automated tolerance evaluation completed.",
      readings: evaluatedFormReadings.map((er, idx) => ({
        id: `qir-${Date.now()}-${idx}`,
        parameterName: er.parameterName,
        specification: er.specification,
        minValue: er.minValue,
        maxValue: er.maxValue,
        readingValue: er.readingValue,
        status: er.status,
      })),
    };

    setInspections([newQi, ...inspections]);
    setIsCreateOpen(false);
    setSelectedInspection(newQi);
  };

  const filteredInspections = inspections.filter((i) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      i.inspectionNumber.toLowerCase().includes(q) ||
      i.itemCode.toLowerCase().includes(q) ||
      i.referenceId.toLowerCase().includes(q) ||
      i.inspector.toLowerCase().includes(q);

    const matchType = typeFilter === "ALL" || i.inspectionType === typeFilter;
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top Breadcrumb Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/stock" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/stock" className="text-gray-500 hover:text-gray-900">
            Stock Workspace
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">Quality Inspections (QA / QC)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quality Inspection</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Module Header Description */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
              Quality Inspection & Parameter Readings Lifecycle
            </h1>
            <p className="text-gray-500 text-xs mt-1 max-w-3xl">
              Conduct gatekeeping inspections for incoming goods receipt, in-process manufacturing, and outbound customer
              deliveries. Automated min/max parameter reading evaluation flags non-conformities and isolates defective stock into quarantine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              ISO 9001 QA Standard
            </Badge>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Total Audits</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{totalCount} Inspections</div>
            <div className="text-[11px] text-gray-400 mt-1">Across Inward, Outward & WIP</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">First-Pass Yield</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-700">{passRate}% Pass Rate</div>
            <div className="text-[11px] text-gray-400 mt-1">{acceptedCount} lot batches accepted</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Quarantined / Rejected</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-xl font-bold text-red-700">{rejectedCount} Defective Lots</div>
            <div className="text-[11px] text-red-600 mt-1">Routed to Quarantine Warehouse</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Active Parameter Criteria</span>
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">Thermal, Voltage, Pinout</div>
            <div className="text-[11px] text-gray-400 mt-1">Automated min/max evaluation</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inspection #, item, ref doc, or inspector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-gray-200 rounded text-xs font-medium"
            >
              <option value="ALL">All Inspection Types</option>
              <option value="Incoming">Incoming (GRN)</option>
              <option value="Outgoing">Outgoing (Dispatch)</option>
              <option value="In Process">In Process (WIP)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-gray-200 rounded text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredInspections.length}</span> QA inspections
          </div>
        </div>

        {/* Inspections Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Inspection No</th>
                <th className="py-2.5 px-4">Stage Type</th>
                <th className="py-2.5 px-4">Reference Document</th>
                <th className="py-2.5 px-4">Item SKU & Name</th>
                <th className="py-2.5 px-4 text-center">Sample Size</th>
                <th className="py-2.5 px-4">Inspector</th>
                <th className="py-2.5 px-4 text-center">QC Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
              {filteredInspections.map((qi) => (
                <tr
                  key={qi.id}
                  className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedInspection(qi)}
                >
                  <td className="py-3 px-4 font-bold text-teal-700 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{qi.inspectionNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {qi.inspectionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="font-medium text-gray-900">{qi.referenceType}: </span>
                    <span className="text-gray-500">{qi.referenceId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{qi.itemCode}</div>
                    <div className="text-[11px] text-gray-500">{qi.itemName}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">{qi.sampleSize} units</td>
                  <td className="py-3 px-4 text-gray-600">{qi.inspector}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={qi.status} />
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedInspection(qi)}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                    >
                      View Readings
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No Quality Inspections found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Detail Modal / Drawer */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center ${
                    selectedInspection.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {selectedInspection.inspectionNumber}
                    <StatusBadge status={selectedInspection.status} />
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedInspection.inspectionType} Inspection | Ref: {selectedInspection.referenceType}{" "}
                    {selectedInspection.referenceId} | Inspector: {selectedInspection.inspector}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Status Alert */}
              {selectedInspection.status === "ACCEPTED" ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lot Conformance Passed: </span>
                    All readings are within configured specification thresholds. Stock is released for regular storage and fulfillment.
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Quality Defect Detected: </span>
                    One or more parameter readings violated tolerance limits. This lot has been locked and routed to the
                    Quarantine Warehouse for supplier return or scrap write-off.
                  </div>
                </div>
              )}

              {/* Item Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Item Code</div>
                  <div className="font-bold text-gray-900">{selectedInspection.itemCode}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Item Name</div>
                  <div className="font-medium text-gray-800">{selectedInspection.itemName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Sample Units Tested</div>
                  <div className="font-bold text-gray-900">{selectedInspection.sampleSize} units</div>
                </div>
              </div>

              {/* Parameter Readings Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                  Recorded Parameter Readings & Tolerance Verification
                </h4>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Parameter Name</th>
                        <th className="py-2.5 px-3">Specification / Condition</th>
                        <th className="py-2.5 px-3 text-right">Min Spec</th>
                        <th className="py-2.5 px-3 text-right">Max Spec</th>
                        <th className="py-2.5 px-3 text-right font-bold text-gray-900">Recorded Reading</th>
                        <th className="py-2.5 px-3 text-center">Reading Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {selectedInspection.readings.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{r.parameterName}</td>
                          <td className="py-2.5 px-3 text-gray-600">{r.specification}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-600">{r.minValue}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-600">{r.maxValue}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                            {r.readingValue}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {selectedInspection.remarks && (
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">QC Inspector Notes: </span>
                  {selectedInspection.remarks}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Inspection Date: {selectedInspection.inspectionDate} | Audit record locked and immutable.
              </span>
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quality Inspection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-900 text-sm">Record New Quality Inspection</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Header Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Inspection Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                    >
                      <option value="Incoming">Incoming (GRN / Vendor Delivery)</option>
                      <option value="Outgoing">Outgoing (Dispatch / Customer Note)</option>
                      <option value="In Process">In Process (Shopfloor Production)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Reference Document Type</label>
                    <select
                      value={newRefType}
                      onChange={(e) => setNewRefType(e.target.value as any)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                    >
                      <option value="Purchase Receipt">Purchase Receipt</option>
                      <option value="Delivery Note">Delivery Note</option>
                      <option value="Stock Entry">Stock Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Reference Doc No</label>
                    <input
                      type="text"
                      value={newRefId}
                      onChange={(e) => setNewRefId(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Item Code</label>
                    <input
                      type="text"
                      value={newItemCode}
                      onChange={(e) => setNewItemCode(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Sample Size Tested</label>
                    <input
                      type="number"
                      min="1"
                      value={newSampleSize}
                      onChange={(e) => setNewSampleSize(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Inspector Name</label>
                    <input
                      type="text"
                      value={newInspector}
                      onChange={(e) => setNewInspector(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Parameter Readings Table Input with Live Tolerance Verification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      Parameter Readings & Live Tolerance Verification
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">Overall Result:</span>
                      <StatusBadge status={overallFormStatus} />
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                          <th className="py-2 px-3">Parameter Name</th>
                          <th className="py-2 px-3">Specification</th>
                          <th className="py-2 px-3 text-right">Min</th>
                          <th className="py-2 px-3 text-right">Max</th>
                          <th className="py-2 px-3 text-right font-bold text-gray-900">Recorded Reading</th>
                          <th className="py-2 px-3 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {evaluatedFormReadings.map((r, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={r.parameterName}
                                onChange={(e) => {
                                  const updated = [...formReadings];
                                  updated[idx].parameterName = e.target.value;
                                  setFormReadings(updated);
                                }}
                                className="w-full p-1 border border-gray-200 rounded text-xs font-medium"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={r.specification}
                                onChange={(e) => {
                                  const updated = [...formReadings];
                                  updated[idx].specification = e.target.value;
                                  setFormReadings(updated);
                                }}
                                className="w-full p-1 border border-gray-200 rounded text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={r.minValue}
                                onChange={(e) => {
                                  const updated = [...formReadings];
                                  updated[idx].minValue = parseFloat(e.target.value) || 0;
                                  setFormReadings(updated);
                                }}
                                className="w-20 p-1 border border-gray-200 rounded text-right font-mono text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={r.maxValue}
                                onChange={(e) => {
                                  const updated = [...formReadings];
                                  updated[idx].maxValue = parseFloat(e.target.value) || 0;
                                  setFormReadings(updated);
                                }}
                                className="w-20 p-1 border border-gray-200 rounded text-right font-mono text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={r.readingValue}
                                onChange={(e) => {
                                  const updated = [...formReadings];
                                  updated[idx].readingValue = parseFloat(e.target.value) || 0;
                                  setFormReadings(updated);
                                }}
                                className={`w-24 p-1 border rounded text-right font-mono font-bold text-xs ${
                                  r.status === "ACCEPTED" ? "border-emerald-300 bg-emerald-50/50" : "border-red-300 bg-red-50/50"
                                }`}
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge status={r.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Remarks & Inspection Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermal paste applied correctly, all signal channels within specification"
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {overallFormStatus === "ACCEPTED"
                    ? "✓ All tolerances verified. Submission will approve inbound/outbound receipt."
                    : "⚠️ Warning: Defect detected! Submitting will flag lot as REJECTED and route to Quarantine."}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-1.5 rounded font-semibold text-xs text-white shadow-xs transition-colors ${
                      overallFormStatus === "ACCEPTED"
                        ? "bg-[#1f272e] hover:bg-black"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Submit Inspection ({overallFormStatus})
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
