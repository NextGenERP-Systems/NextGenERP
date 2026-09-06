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
  timeLogs?: any[];
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

  async completeJobCard(id: string, completedQty: number): Promise<JobCard> {
    try {
      const res = await fetch(`${BASE_URL}/job-cards/${id}/complete?completedQty=${completedQty}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, completing job card in mock store');
    }
    const jc = mockJobCards.find(j => j.jobCardId === id);
    if (jc) {
      jc.completedQuantity = (jc.completedQuantity || 0) + completedQty;
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
  }
};
