// API Client & Resilient Offline Mock Store for NextGen ERP MRP Module

export interface BomItem {
  id?: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  standardRate: number;
  amount: number;
  subBomNo?: string;
}

export interface BomOperation {
  id?: string;
  sequenceNo: number;
  operationId: string;
  workstationId: string;
  timeInMins: number;
  operatingCost: number;
}

export interface Bom {
  bomNo: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  isActive: boolean;
  isDefault: boolean;
  routingId?: string;
  rawMaterialCost: number;
  operatingCost: number;
  scrapCost: number;
  totalCost: number;
  items: BomItem[];
  operations: BomOperation[];
}

export interface WorkOrderItem {
  id?: string;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  transferredQty: number;
  actualConsumedQty: number;
  uom: string;
  standardRate: number;
}

export interface WorkOrder {
  workOrderId: string;
  parentWoId?: string;
  productionItem: string;
  itemName: string;
  bomNo: string;
  qtyToProduce: number;
  producedQty: number;
  sourceWarehouse?: string;
  wipWarehouse?: string;
  fgWarehouse?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'STOPPED' | 'CANCELLED';
  plannedMaterialCost: number;
  actualMaterialCost: number;
  plannedOperatingCost: number;
  actualOperatingCost: number;
  items: WorkOrderItem[];
}

export interface JobCard {
  jobCardId: string;
  workOrderId: string;
  operationId: string;
  workstationId: string;
  forQuantity: number;
  completedQuantity: number;
  status: 'OPEN' | 'WORK_IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  assignedEmployeeId?: string;
  totalTimeInMins: number;
  scrapQuantity?: number;
  scrapReason?: string;
  timeLogs?: any[];
}

export interface OperationItem {
  operationId: string;
  operationName: string;
  defaultWorkstationId?: string;
  defaultOperatingCost?: number;
  description?: string;
}

export interface RoutingOperation {
  id?: string;
  sequenceNo: number;
  operationId: string;
  workstationId: string;
  timeInMins: number;
  operatingCost?: number;
  batchSize?: number;
}

export interface Routing {
  routingId: string;
  routingName: string;
  itemCode?: string;
  isActive: boolean;
  totalOperatingCost?: number;
  totalRoutingTimeMins?: number;
  operations: RoutingOperation[];
}

// Enterprise Mock Store for Offline / Resilient Mode
let mockBoms: Bom[] = [
  {
    bomNo: 'BOM-EV-DRONE-001',
    itemCode: 'EV-DRONE-X1',
    itemName: 'Enterprise Industrial EV Cargo Drone X1',
    quantity: 1,
    uom: 'Nos',
    isActive: true,
    isDefault: true,
    routingId: 'RT-DRONE-X1',
    rawMaterialCost: 2811.25,
    operatingCost: 67.92,
    scrapCost: 0,
    totalCost: 2879.17,
    items: [
      { itemCode: 'DRONE-FRAME-SUB', itemName: 'Carbon Fiber Chassis & Arm Sub-Assembly', qty: 1, uom: 'Nos', standardRate: 398.75, amount: 398.75, subBomNo: 'BOM-CHASSIS-001' },
      { itemCode: 'DRONE-PROP-SUB', itemName: 'Brushless Motor & Rotor Sub-Assembly', qty: 2, uom: 'Nos', standardRate: 532.50, amount: 1065.00, subBomNo: 'BOM-ROTOR-001' },
      { itemCode: 'RAW-BATTERY-PACK', itemName: 'LiFePO4 48V 20Ah Smart Battery Pack', qty: 1, uom: 'Nos', standardRate: 850.00, amount: 850.00 },
      { itemCode: 'RAW-FLIGHT-CTRL', itemName: 'AI Flight Controller Board v4', qty: 1, uom: 'Nos', standardRate: 320.00, amount: 320.00 }
    ],
    operations: [
      { sequenceNo: 1, operationId: 'OP-FINAL-ASM', workstationId: 'WS-ASM-01', timeInMins: 60, operatingCost: 45.00 },
      { sequenceNo: 2, operationId: 'OP-QC-CALIB', workstationId: 'WS-TEST-01', timeInMins: 25, operatingCost: 22.92 }
    ]
  },
  {
    bomNo: 'BOM-CHASSIS-001',
    itemCode: 'DRONE-FRAME-SUB',
    itemName: 'Carbon Fiber Chassis & Arm Sub-Assembly',
    quantity: 1,
    uom: 'Nos',
    isActive: true,
    isDefault: true,
    rawMaterialCost: 350.00,
    operatingCost: 48.75,
    scrapCost: 0,
    totalCost: 398.75,
    items: [
      { itemCode: 'RAW-CF-SHEET', itemName: 'Raw Carbon Fiber Sheet 5mm', qty: 2, uom: 'SqM', standardRate: 150.00, amount: 300.00 },
      { itemCode: 'RAW-TITANIUM-BOLT', itemName: 'M4 Titanium Hex Bolts', qty: 2, uom: 'Box', standardRate: 25.00, amount: 50.00 }
    ],
    operations: [
      { sequenceNo: 1, operationId: 'OP-CNC-CUT', workstationId: 'WS-CNC-01', timeInMins: 45, operatingCost: 48.75 }
    ]
  }
];

let mockWorkOrders: WorkOrder[] = [
  {
    workOrderId: 'WO-2026-0001',
    productionItem: 'EV-DRONE-X1',
    itemName: 'Enterprise Industrial EV Cargo Drone X1',
    bomNo: 'BOM-EV-DRONE-001',
    qtyToProduce: 10,
    producedQty: 2,
    sourceWarehouse: 'WH-STORES',
    wipWarehouse: 'WH-WIP',
    fgWarehouse: 'WH-FG',
    plannedStartDate: '2026-09-04T08:00:00Z',
    plannedEndDate: '2026-09-11T17:00:00Z',
    status: 'IN_PROGRESS',
    plannedMaterialCost: 28112.50,
    actualMaterialCost: 28432.50,
    plannedOperatingCost: 679.17,
    actualOperatingCost: 120.00,
    items: [
      { itemCode: 'DRONE-FRAME-SUB', itemName: 'Carbon Fiber Chassis & Arm Sub-Assembly', requiredQty: 10, transferredQty: 10, actualConsumedQty: 10, uom: 'Nos', standardRate: 398.75 },
      { itemCode: 'DRONE-PROP-SUB', itemName: 'Brushless Motor & Rotor Sub-Assembly', requiredQty: 20, transferredQty: 20, actualConsumedQty: 18, uom: 'Nos', standardRate: 532.50 },
      { itemCode: 'RAW-BATTERY-PACK', itemName: 'LiFePO4 48V 20Ah Smart Battery Pack', requiredQty: 10, transferredQty: 10, actualConsumedQty: 10, uom: 'Nos', standardRate: 850.00 },
      { itemCode: 'RAW-FLIGHT-CTRL', itemName: 'AI Flight Controller Board v4', requiredQty: 10, transferredQty: 10, actualConsumedQty: 11, uom: 'Nos', standardRate: 320.00 } // Over-consumption logged!
    ]
  },
  {
    workOrderId: 'WO-2026-0002',
    parentWoId: 'WO-2026-0001',
    productionItem: 'DRONE-FRAME-SUB',
    itemName: 'Carbon Fiber Chassis & Arm Sub-Assembly',
    bomNo: 'BOM-CHASSIS-001',
    qtyToProduce: 10,
    producedQty: 10,
    sourceWarehouse: 'WH-STORES',
    wipWarehouse: 'WH-WIP',
    fgWarehouse: 'WH-WIP',
    plannedStartDate: '2026-09-03T08:00:00Z',
    plannedEndDate: '2026-09-05T17:00:00Z',
    status: 'COMPLETED',
    plannedMaterialCost: 3500.00,
    actualMaterialCost: 3500.00,
    plannedOperatingCost: 487.50,
    actualOperatingCost: 487.50,
    items: [
      { itemCode: 'RAW-CF-SHEET', itemName: 'Raw Carbon Fiber Sheet 5mm', requiredQty: 20, transferredQty: 20, actualConsumedQty: 20, uom: 'SqM', standardRate: 150.00 }
    ]
  }
];

let mockJobCards: JobCard[] = [
  {
    jobCardId: 'JC-2026-001',
    workOrderId: 'WO-2026-0001',
    operationId: 'OP-FINAL-ASM',
    workstationId: 'WS-ASM-01',
    forQuantity: 10,
    completedQuantity: 2,
    status: 'WORK_IN_PROGRESS',
    assignedEmployeeId: 'EMP-102',
    totalTimeInMins: 120
  },
  {
    jobCardId: 'JC-2026-002',
    workOrderId: 'WO-2026-0001',
    operationId: 'OP-QC-CALIB',
    workstationId: 'WS-TEST-01',
    forQuantity: 10,
    completedQuantity: 0,
    status: 'OPEN',
    assignedEmployeeId: 'EMP-103',
    totalTimeInMins: 0
  }
];

// Helper API Fetcher
const BASE_URL = '/api/v1/mrp';

export const api = {
  async getBoms(): Promise<Bom[]> {
    try {
      const res = await fetch(`${BASE_URL}/boms`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock BOM data');
    }
    return mockBoms;
  },

  async explodeBom(bomNo: string): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/boms/${bomNo}/explode`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock CTE explosion');
    }
    const targetBom = mockBoms.find(b => b.bomNo === bomNo);
    if (!targetBom) return [];
    return targetBom.items.map(i => ({
      root_bom_no: bomNo,
      item_code: i.itemCode,
      item_name: i.itemName,
      total_exploded_qty: i.qty,
      uom: i.uom,
      standard_rate: i.standardRate,
      total_exploded_amount: i.amount,
      level_depth: i.subBomNo ? 1 : 2
    }));
  },

  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const res = await fetch(`${BASE_URL}/work-orders`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock Work Orders');
    }
    return mockWorkOrders;
  },

  async logMaterialConsumption(woId: string, itemCode: string, consumeQty: number): Promise<WorkOrder> {
    try {
      const res = await fetch(`${BASE_URL}/work-orders/${woId}/consume?itemCode=${itemCode}&consumeQty=${consumeQty}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, updating local mock state');
    }
    const wo = mockWorkOrders.find(w => w.workOrderId === woId);
    if (wo) {
      const item = wo.items.find(i => i.itemCode === itemCode);
      if (item) {
        item.actualConsumedQty = (item.actualConsumedQty || 0) + consumeQty;
        wo.actualMaterialCost = (wo.actualMaterialCost || 0) + (consumeQty * item.standardRate);
        wo.status = 'IN_PROGRESS';
      }
    }
    return wo || mockWorkOrders[0];
  },

  async getJobCards(): Promise<JobCard[]> {
    try {
      const res = await fetch(`${BASE_URL}/job-cards`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock Job Cards');
    }
    return mockJobCards;
  },

  async completeJobCard(id: string, completedQty: number, scrapQty?: number, scrapReason?: string): Promise<JobCard> {
    try {
      let url = `${BASE_URL}/job-cards/${id}/complete?completedQty=${completedQty}`;
      if (scrapQty) url += `&scrapQty=${scrapQty}`;
      if (scrapReason) url += `&scrapReason=${encodeURIComponent(scrapReason)}`;
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, completing job card in mock store');
    }
    const jc = mockJobCards.find(j => j.jobCardId === id);
    if (jc) {
      jc.completedQuantity = (jc.completedQuantity || 0) + completedQty;
      if (scrapQty) jc.scrapQuantity = (jc.scrapQuantity || 0) + scrapQty;
      if (scrapReason) jc.scrapReason = scrapReason;
      if (jc.completedQuantity >= jc.forQuantity) {
        jc.status = 'COMPLETED';
      } else {
        jc.status = 'WORK_IN_PROGRESS';
      }
    }
    return jc || mockJobCards[0];
  },

  async teardownSandbox(): Promise<string> {
    try {
      const res = await fetch(`${BASE_URL}/sandbox/teardown`, { method: 'POST' });
      if (res.ok) return (await res.json()).message;
    } catch (e) {
      console.warn('Backend unavailable, resetting local mock arrays');
    }
    mockWorkOrders = [];
    mockJobCards = [];
    return 'Local MRP Sandbox reset successfully!';
  },

  async calculateMrpWizard(bomNo: string, plannedQty: number): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/wizard/calculate?bomNo=${encodeURIComponent(bomNo)}&plannedQty=${plannedQty}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, performing local dynamic MRP calculation');
    }

    const mockStockLedger: Record<string, number> = {
      'RAW-CF-SHEET': 50,
      'RAW-TITANIUM-BOLT': 100,
      'RAW-BLDC-MOTOR': 30,
      'RAW-ESC-60A': 15,
      'RAW-BATTERY-PACK': 5,
      'RAW-FLIGHT-CTRL': 8,
      'DRONE-FRAME-SUB': 10,
      'DRONE-PROP-SUB': 5
    };

    const targetBom = mockBoms.find(b => b.bomNo === bomNo);
    const items = targetBom ? targetBom.items : [];
    
    const requirements = items.map(i => {
      const required_total_qty = i.qty * plannedQty;
      const actual_in_stock = mockStockLedger[i.itemCode] ?? 0;
      const shortage_qty = Math.max(0, required_total_qty - actual_in_stock);
      
      let action_recommended = 'STOCK_AVAILABLE';
      if (shortage_qty > 0) {
        action_recommended = i.subBomNo ? 'SPAWN_WORK_ORDER' : 'PURCHASE_ORDER';
      }

      return {
        item_code: i.itemCode,
        item_name: i.itemName,
        total_exploded_qty: i.qty,
        required_total_qty,
        actual_in_stock,
        mock_in_stock: actual_in_stock,
        shortage_qty,
        action_recommended,
        sub_bom_no: i.subBomNo
      };
    });

    return {
      bomNo,
      plannedQty,
      totalExplodedItems: requirements.length,
      requirements
    };
  },

  async getQualityInspections(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/quality/inspections`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock inspections');
    }
    return [
      {
        inspectionId: 'QI-2026-001',
        workOrderId: 'WO-2026-0001',
        inspectionType: 'In-Process',
        inspectedBy: 'Marcus Vance (EMP-103)',
        inspectedQty: 2,
        status: 'PASSED',
        remarks: 'Units 1 and 2 passed wind tunnel hover test cleanly.',
        readings: [
          { parameterName: 'Hover Stability Drift (cm)', readingValue: 2.1, status: 'PASSED' },
          { parameterName: 'Battery Voltage Full Load (V)', readingValue: 49.8, status: 'PASSED' }
        ]
      }
    ];
  },

  async submitQualityInspection(inspectionData: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/quality/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking submission');
    }
    return {
      ...inspectionData,
      inspectionId: inspectionData.inspectionId || `QI-2026-00${Math.floor(Math.random() * 90 + 10)}`,
      status: inspectionData.readings?.some((r: any) => r.status === 'FAILED') ? 'FAILED' : 'PASSED'
    };
  },

  async getDowntimeEntries(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/downtime`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock downtime');
    }
    return [
      {
        downtimeId: 'DT-2026-001',
        workstationId: 'WS-CNC-01',
        operatorEmployeeId: 'EMP-101',
        category: 'TOOLING',
        downtimeInMins: 120,
        remarks: 'Replaced worn tungsten carbide end-mill bit'
      }
    ];
  },

  async logDowntime(entry: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/downtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking downtime log');
    }
    return {
      ...entry,
      downtimeId: entry.downtimeId || `DT-2026-00${Math.floor(Math.random() * 90 + 10)}`
    };
  },

  async getScrapItems(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/scrap`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock scrap');
    }
    return [
      {
        workOrderId: 'WO-2026-0001',
        itemCode: 'RAW-CF-SHEET',
        scrapQty: 1.5,
        uom: 'SqM',
        financialValuation: 225.0
      }
    ];
  },

  async logScrap(scrapItem: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/scrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scrapItem)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking scrap log');
    }
    return scrapItem;
  },

  // Phase 1, 2, 3 Extensions: MPS, BOM Update Tool, Subcontracting
  async replaceBomItem(currentItemCode: string, newItemCode: string, newItemName: string, newRate?: number): Promise<any> {
    try {
      const params = new URLSearchParams({ currentItemCode, newItemCode, newItemName });
      if (newRate) params.append('newRate', newRate.toString());
      const res = await fetch(`${BASE_URL}/boms/replace-item?${params}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking BOM item replacement');
    }
    let updatedCount = 0;
    mockBoms.forEach(bom => {
      bom.items.forEach(item => {
        if (item.itemCode === currentItemCode) {
          item.itemCode = newItemCode;
          item.itemName = newItemName;
          if (newRate) {
            item.standardRate = newRate;
            item.amount = item.qty * newRate;
          }
          updatedCount++;
        }
      });
    });
    return { status: 'SUCCESS', bomsUpdated: updatedCount, message: `Replaced ${currentItemCode} with ${newItemCode} in mock store.` };
  },

  async getMpsSchedules(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/mps`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock MPS');
    }
    return [
      {
        mpsId: 'MPS-2026-001',
        itemCode: 'EV-DRONE-X1',
        bomNo: 'BOM-EV-DRONE-001',
        scheduleDate: '2026-09-25',
        plannedQty: 20,
        sourceType: 'FORECAST',
        status: 'SUBMITTED'
      }
    ];
  },

  async createMpsSchedule(mps: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/mps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mps)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking MPS creation');
    }
    return { ...mps, mpsId: mps.mpsId || `MPS-2026-${Math.floor(Math.random() * 900 + 100)}` };
  },

  async convertMpsToPlan(mpsId: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/mps/${mpsId}/to-production-plan`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking MPS conversion');
    }
    return {
      planId: `PLAN-MPS-${mpsId}`,
      status: 'SUBMITTED',
      createdBy: 'MPS-Auto-Generator',
      items: [{ itemCode: 'EV-DRONE-X1', bomNo: 'BOM-EV-DRONE-001', plannedQty: 20 }]
    };
  },

  async getSubcontracts(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/subcontracting`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock subcontracts');
    }
    return [
      {
        subcontractId: 'SUB-2026-001',
        workOrderId: 'WO-2026-0001',
        supplierId: 'SUP-AERO-TECH',
        itemCode: 'DRONE-PROP-SUB',
        qty: 5,
        serviceCost: 250.0,
        status: 'SUBMITTED'
      }
    ];
  },

  async createSubcontract(order: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/subcontracting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking subcontract creation');
    }
    return { ...order, subcontractId: order.subcontractId || `SUB-2026-${Math.floor(Math.random() * 900 + 100)}`, status: 'SUBMITTED' };
  },

  async dispatchSubcontractMaterials(subcontractId: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/subcontracting/${subcontractId}/dispatch-materials`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking material dispatch');
    }
    return { subcontractId, status: 'MATERIALS_DISPATCHED', materialsDispatched: true, dispatchDate: new Date().toISOString() };
  },

  async receiveSubcontractGoods(subcontractId: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/subcontracting/${subcontractId}/receive-goods`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking goods receipt');
    }
    return { subcontractId, status: 'COMPLETED' };
  },

  async getOperations(): Promise<OperationItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/operations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock operations');
    }
    return [
      { operationId: 'OP-CNC-01', operationName: 'Precision CNC Machining', defaultWorkstationId: 'WS-CNC-01', defaultOperatingCost: 15.5, description: 'Milling & Cutting' },
      { operationId: 'OP-ASSM-02', operationName: 'Robotic Chassis Assembly', defaultWorkstationId: 'WS-ASSM-01', defaultOperatingCost: 22.0, description: 'Chassis Wiring & Fastening' },
      { operationId: 'OP-QUAL-03', operationName: 'Laser Calibration & QA', defaultWorkstationId: 'WS-QUAL-01', defaultOperatingCost: 12.0, description: 'Inspection & Sensor Calibration' }
    ];
  },

  async createOperation(op: OperationItem): Promise<OperationItem> {
    try {
      const res = await fetch(`${BASE_URL}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking operation creation');
    }
    return { ...op, operationId: op.operationId || `OP-${Math.floor(Math.random() * 9000 + 1000)}` };
  },

  async getRoutings(): Promise<Routing[]> {
    try {
      const res = await fetch(`${BASE_URL}/routings`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock routings');
    }
    return [
      {
        routingId: 'RT-DRONE-X1',
        routingName: 'Standard Industrial Drone Assembly Routing',
        itemCode: 'EV-DRONE-X1',
        isActive: true,
        totalOperatingCost: 49.5,
        totalRoutingTimeMins: 75,
        operations: [
          { sequenceNo: 1, operationId: 'Precision CNC Machining', workstationId: 'WS-CNC-01', timeInMins: 30, operatingCost: 15.5 },
          { sequenceNo: 2, operationId: 'Robotic Chassis Assembly', workstationId: 'WS-ASSM-01', timeInMins: 30, operatingCost: 22.0 },
          { sequenceNo: 3, operationId: 'Laser Calibration & QA', workstationId: 'WS-QUAL-01', timeInMins: 15, operatingCost: 12.0 }
        ]
      }
    ];
  },

  async getRoutingById(routingId: string): Promise<Routing> {
    try {
      const res = await fetch(`${BASE_URL}/routings/${routingId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock routing');
    }
    const list = await this.getRoutings();
    return list.find(r => r.routingId === routingId) || list[0];
  },

  async createRouting(routing: Routing): Promise<Routing> {
    try {
      const res = await fetch(`${BASE_URL}/routings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routing)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking routing creation');
    }
    return { ...routing, routingId: routing.routingId || `RT-${Math.floor(Math.random() * 9000 + 1000)}` };
  },

  async createWorkOrder(wo: Partial<WorkOrder>): Promise<WorkOrder> {
    try {
      const res = await fetch(`${BASE_URL}/work-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wo)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking work order creation');
    }
    return {
      workOrderId: wo.workOrderId || `WO-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      productionItem: wo.productionItem || 'EV-DRONE-X1',
      itemName: wo.itemName || 'Industrial EV Drone',
      bomNo: wo.bomNo || 'BOM-EV-DRONE-001',
      qtyToProduce: wo.qtyToProduce || 10,
      producedQty: 0,
      plannedStartDate: wo.plannedStartDate || new Date().toISOString(),
      plannedEndDate: wo.plannedEndDate || new Date(Date.now() + 86400000*3).toISOString(),
      status: 'NOT_STARTED',
      plannedMaterialCost: 2800,
      actualMaterialCost: 0,
      plannedOperatingCost: 50,
      actualOperatingCost: 0,
      items: []
    };
  },

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    try {
      const res = await fetch(`${BASE_URL}/work-orders/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, returning mock work order');
    }
    const list = await this.getWorkOrders();
    return list.find(w => w.workOrderId === id) || list[0];
  },

  async submitWorkOrder(id: string): Promise<WorkOrder> {
    try {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/submit`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, mocking work order submit');
    }
    const wo = await this.getWorkOrderById(id);
    return { ...wo, status: 'SUBMITTED' };
  }
};




