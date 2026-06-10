# Crystal Inventory System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个本地运行的水晶库存网页系统，用于记录材料、进货、配方、制作、成品库存、销售、图片和利润报表。

**Architecture:** 使用 Vite + React + TypeScript 构建单页本地网页应用。库存、成本、利润、报表聚合逻辑放在纯 TypeScript 模块中并用单元测试覆盖；React 页面只负责录入、展示、调用业务操作和持久化到浏览器 localStorage。

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, localStorage, Canvas image resizing, CSS modules/plain CSS.

---

## 文件结构

- Create: `package.json` - 项目脚本和依赖。
- Create: `index.html` - Vite HTML 入口。
- Create: `tsconfig.json` - TypeScript 配置。
- Create: `tsconfig.node.json` - Vite 配置编译支持。
- Create: `vite.config.ts` - Vite + Vitest 配置。
- Create: `src/main.tsx` - React 应用入口。
- Create: `src/App.tsx` - 顶层布局、导航、页面切换。
- Create: `src/styles.css` - 全局视觉样式。
- Create: `src/domain/types.ts` - 材料、进货、配方、制作、成品、销售等类型定义。
- Create: `src/domain/calculations.ts` - 加权平均成本、利润、报表聚合等纯计算函数。
- Create: `src/domain/inventory.ts` - 进货、制作、销售对库存的业务变更函数。
- Create: `src/domain/sampleData.ts` - 首次打开时可选示例数据。
- Create: `src/storage/store.ts` - localStorage 读写、数据版本、初始化。
- Create: `src/utils/image.ts` - 图片压缩和 base64 存储辅助函数。
- Create: `src/components/FormField.tsx` - 表单字段通用布局。
- Create: `src/components/ImageInput.tsx` - 图片上传、预览、压缩。
- Create: `src/components/MetricCard.tsx` - 仪表盘指标。
- Create: `src/components/DataTable.tsx` - 简单表格。
- Create: `src/pages/DashboardPage.tsx` - 总览。
- Create: `src/pages/MaterialsPage.tsx` - 材料库存。
- Create: `src/pages/PurchasesPage.tsx` - 进货。
- Create: `src/pages/RecipesPage.tsx` - 配方/款式。
- Create: `src/pages/ProductionPage.tsx` - 制作成品。
- Create: `src/pages/FinishedGoodsPage.tsx` - 成品库存。
- Create: `src/pages/SalesPage.tsx` - 销售。
- Create: `src/pages/ReportsPage.tsx` - 报表。
- Create: `src/domain/calculations.test.ts` - 成本和报表单元测试。
- Create: `src/domain/inventory.test.ts` - 进货、制作、销售库存流转测试。
- Create: `src/storage/store.test.ts` - localStorage 初始化和保存测试。

---

### Task 1: 初始化 Vite React TypeScript 项目

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: 创建项目依赖和脚本**

`package.json`:

```json
{
  "name": "crystal-inventory-system",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: 安装依赖**

Run: `npm install`

Expected: 生成 `package-lock.json` 和 `node_modules/`，命令退出码为 0。

- [ ] **Step 3: 创建 Vite 配置**

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
```

- [ ] **Step 4: 创建 TypeScript 配置**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 HTML 和 React 入口**

`index.html`:

```html
<!doctype html>
<html lang="zh-Hans">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>水晶库存系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <h1>水晶库存系统</h1>
      <p>项目初始化完成。</p>
    </main>
  );
}
```

`src/styles.css`:

```css
:root {
  color: #17211f;
  background: #f6f7f4;
  font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 6: 验证项目能构建**

Run: `npm run build`

Expected: TypeScript 和 Vite 构建通过，生成 `dist/`。

- [ ] **Step 7: 提交初始化**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src/main.tsx src/App.tsx src/styles.css
git commit -m "feat: initialize crystal inventory app"
```

---

### Task 2: 定义领域类型和核心计算函数

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/calculations.ts`
- Create: `src/domain/calculations.test.ts`

- [ ] **Step 1: 先写计算测试**

`src/domain/calculations.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  summarizeByMonth,
  summarizeByStyle
} from "./calculations";
import type { SaleRecord } from "./types";

describe("calculations", () => {
  it("updates weighted average unit cost after a purchase", () => {
    expect(calculateAverageUnitCost(100, 50, 100, 70)).toBeCloseTo(0.6);
  });

  it("calculates finished unit cost with material, packaging, and labor", () => {
    expect(calculateFinishedUnitCost(18.5, 3, 8)).toBeCloseTo(29.5);
  });

  it("calculates sale profit and margin", () => {
    expect(calculateSaleProfit(2, 68, 29.5)).toEqual({
      totalRevenue: 136,
      totalCost: 59,
      profit: 77,
      profitMargin: 77 / 136
    });
  });

  it("summarizes sales by style", () => {
    const sales: SaleRecord[] = [
      makeSale("s1", "粉晶款", "2026-06-01", 1, 68, 30),
      makeSale("s2", "粉晶款", "2026-06-02", 2, 70, 31),
      makeSale("s3", "草莓晶款", "2026-06-03", 1, 88, 40)
    ];

    expect(summarizeByStyle(sales)).toEqual([
      {
        key: "粉晶款",
        quantitySold: 3,
        totalRevenue: 208,
        totalCost: 92,
        totalProfit: 116,
        averageProfitMargin: 116 / 208
      },
      {
        key: "草莓晶款",
        quantitySold: 1,
        totalRevenue: 88,
        totalCost: 40,
        totalProfit: 48,
        averageProfitMargin: 48 / 88
      }
    ]);
  });

  it("summarizes sales by month", () => {
    const sales: SaleRecord[] = [
      makeSale("s1", "粉晶款", "2026-06-01", 1, 68, 30),
      makeSale("s2", "粉晶款", "2026-06-20", 1, 70, 31),
      makeSale("s3", "粉晶款", "2026-07-01", 1, 88, 40)
    ];

    expect(summarizeByMonth(sales)).toEqual([
      {
        key: "2026-06",
        quantitySold: 2,
        totalRevenue: 138,
        totalCost: 61,
        totalProfit: 77,
        averageProfitMargin: 77 / 138
      },
      {
        key: "2026-07",
        quantitySold: 1,
        totalRevenue: 88,
        totalCost: 40,
        totalProfit: 48,
        averageProfitMargin: 48 / 88
      }
    ]);
  });
});

function makeSale(
  id: string,
  styleName: string,
  saleDate: string,
  quantitySold: number,
  salePricePerUnit: number,
  unitCost: number
): SaleRecord {
  const totalRevenue = quantitySold * salePricePerUnit;
  const totalCost = quantitySold * unitCost;
  const profit = totalRevenue - totalCost;
  return {
    id,
    saleDate,
    finishedGoodBatchId: "batch-1",
    styleName,
    quantitySold,
    salePricePerUnit,
    totalRevenue,
    unitCost,
    totalCost,
    profit,
    profitMargin: profit / totalRevenue,
    channelNote: "",
    imageDataUrl: "",
    notes: ""
  };
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/domain/calculations.test.ts`

Expected: FAIL，提示找不到 `./calculations` 或导出函数。

- [ ] **Step 3: 定义领域类型**

`src/domain/types.ts`:

```ts
export type MaterialCategory =
  | "crystal"
  | "spacer"
  | "charm"
  | "string"
  | "packaging"
  | "other";

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  specification: string;
  currentQuantity: number;
  remainingTotalCost: number;
  averageUnitCost: number;
  lowStockThreshold: number;
  imageDataUrl: string;
  notes: string;
}

export interface PurchaseRecord {
  id: string;
  materialId: string;
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  notes: string;
}

export interface MaterialLine {
  materialId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  materialLines: MaterialLine[];
  packagingCostPerUnit: number;
  laborCostPerUnit: number;
  suggestedSalePrice: number;
  imageDataUrl: string;
  notes: string;
}

export interface ProductionRecord {
  id: string;
  productionDate: string;
  recipeId: string;
  customName: string;
  styleName: string;
  materialLines: MaterialLine[];
  quantityMade: number;
  packagingCostPerUnit: number;
  laborCostPerUnit: number;
  materialCostPerUnit: number;
  finishedUnitCost: number;
  imageDataUrl: string;
  notes: string;
}

export interface FinishedGoodBatch {
  id: string;
  productionRecordId: string;
  recipeId: string;
  styleName: string;
  quantityMade: number;
  quantityRemaining: number;
  unitCost: number;
  productionDate: string;
  imageDataUrl: string;
  notes: string;
}

export interface SaleRecord {
  id: string;
  saleDate: string;
  finishedGoodBatchId: string;
  styleName: string;
  quantitySold: number;
  salePricePerUnit: number;
  totalRevenue: number;
  unitCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  channelNote: string;
  imageDataUrl: string;
  notes: string;
}

export interface AppData {
  materials: Material[];
  purchases: PurchaseRecord[];
  recipes: Recipe[];
  productions: ProductionRecord[];
  finishedGoods: FinishedGoodBatch[];
  sales: SaleRecord[];
}

export interface SummaryRow {
  key: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageProfitMargin: number;
}
```

- [ ] **Step 4: 实现计算函数**

`src/domain/calculations.ts`:

```ts
import type { SaleRecord, SummaryRow } from "./types";

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateAverageUnitCost(
  oldQuantity: number,
  oldRemainingTotalCost: number,
  purchaseQuantity: number,
  purchaseTotalCost: number
): number {
  const totalQuantity = oldQuantity + purchaseQuantity;
  if (totalQuantity <= 0) {
    return 0;
  }
  return (oldRemainingTotalCost + purchaseTotalCost) / totalQuantity;
}

export function calculateFinishedUnitCost(
  materialCostPerUnit: number,
  packagingCostPerUnit: number,
  laborCostPerUnit: number
): number {
  return roundMoney(materialCostPerUnit + packagingCostPerUnit + laborCostPerUnit);
}

export function calculateSaleProfit(
  quantitySold: number,
  salePricePerUnit: number,
  unitCost: number
) {
  const totalRevenue = roundMoney(quantitySold * salePricePerUnit);
  const totalCost = roundMoney(quantitySold * unitCost);
  const profit = roundMoney(totalRevenue - totalCost);
  return {
    totalRevenue,
    totalCost,
    profit,
    profitMargin: totalRevenue > 0 ? profit / totalRevenue : 0
  };
}

export function summarizeByStyle(sales: SaleRecord[]): SummaryRow[] {
  return summarizeSales(sales, (sale) => sale.styleName);
}

export function summarizeByMonth(sales: SaleRecord[]): SummaryRow[] {
  return summarizeSales(sales, (sale) => sale.saleDate.slice(0, 7));
}

function summarizeSales(
  sales: SaleRecord[],
  keySelector: (sale: SaleRecord) => string
): SummaryRow[] {
  const rows = new Map<string, SummaryRow>();

  for (const sale of sales) {
    const key = keySelector(sale);
    const existing =
      rows.get(key) ??
      {
        key,
        quantitySold: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        averageProfitMargin: 0
      };

    existing.quantitySold += sale.quantitySold;
    existing.totalRevenue = roundMoney(existing.totalRevenue + sale.totalRevenue);
    existing.totalCost = roundMoney(existing.totalCost + sale.totalCost);
    existing.totalProfit = roundMoney(existing.totalProfit + sale.profit);
    existing.averageProfitMargin =
      existing.totalRevenue > 0 ? existing.totalProfit / existing.totalRevenue : 0;
    rows.set(key, existing);
  }

  return Array.from(rows.values()).sort((a, b) => a.key.localeCompare(b.key));
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test -- src/domain/calculations.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交领域计算**

```bash
git add src/domain/types.ts src/domain/calculations.ts src/domain/calculations.test.ts
git commit -m "feat: add inventory calculation domain"
```

---

### Task 3: 实现库存业务流转

**Files:**
- Create: `src/domain/inventory.ts`
- Create: `src/domain/inventory.test.ts`

- [ ] **Step 1: 先写库存流转测试**

`src/domain/inventory.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  applyProduction,
  applyPurchase,
  applySale,
  calculateRecipeMaterialCost
} from "./inventory";
import type { AppData, Material } from "./types";

describe("inventory operations", () => {
  it("applies purchase and updates material stock with weighted average cost", () => {
    const data = makeData([makeMaterial("m1", "粉晶", 100, 50)]);
    const next = applyPurchase(data, {
      materialId: "m1",
      quantity: 100,
      totalCost: 70,
      purchaseDate: "2026-06-10",
      notes: ""
    });

    expect(next.materials[0].currentQuantity).toBe(200);
    expect(next.materials[0].remainingTotalCost).toBe(120);
    expect(next.materials[0].averageUnitCost).toBeCloseTo(0.6);
    expect(next.purchases).toHaveLength(1);
  });

  it("calculates recipe material cost from average costs", () => {
    const data = makeData([
      makeMaterial("m1", "粉晶", 100, 50),
      makeMaterial("m2", "隔片", 50, 25)
    ]);

    expect(
      calculateRecipeMaterialCost(data.materials, [
        { materialId: "m1", quantity: 12 },
        { materialId: "m2", quantity: 4 }
      ])
    ).toBeCloseTo(8);
  });

  it("applies production and creates a finished goods batch", () => {
    const data = makeData([
      makeMaterial("m1", "粉晶", 100, 50),
      makeMaterial("m2", "隔片", 50, 25)
    ]);

    const next = applyProduction(data, {
      recipeId: "",
      customName: "粉晶定制",
      styleName: "粉晶定制",
      productionDate: "2026-06-10",
      materialLines: [
        { materialId: "m1", quantity: 12 },
        { materialId: "m2", quantity: 4 }
      ],
      quantityMade: 2,
      packagingCostPerUnit: 3,
      laborCostPerUnit: 8,
      imageDataUrl: "",
      notes: ""
    });

    expect(next.materials.find((item) => item.id === "m1")?.currentQuantity).toBe(76);
    expect(next.materials.find((item) => item.id === "m2")?.currentQuantity).toBe(42);
    expect(next.finishedGoods[0].quantityMade).toBe(2);
    expect(next.finishedGoods[0].quantityRemaining).toBe(2);
    expect(next.finishedGoods[0].unitCost).toBe(19);
  });

  it("rejects production when material stock is insufficient", () => {
    const data = makeData([makeMaterial("m1", "粉晶", 5, 2.5)]);

    expect(() =>
      applyProduction(data, {
        recipeId: "",
        customName: "粉晶定制",
        styleName: "粉晶定制",
        productionDate: "2026-06-10",
        materialLines: [{ materialId: "m1", quantity: 12 }],
        quantityMade: 1,
        packagingCostPerUnit: 3,
        laborCostPerUnit: 8,
        imageDataUrl: "",
        notes: ""
      })
    ).toThrow("材料库存不足：粉晶");
  });

  it("applies sale and calculates profit", () => {
    const data: AppData = {
      ...makeData([]),
      finishedGoods: [
        {
          id: "batch-1",
          productionRecordId: "p1",
          recipeId: "",
          styleName: "粉晶定制",
          quantityMade: 2,
          quantityRemaining: 2,
          unitCost: 19,
          productionDate: "2026-06-10",
          imageDataUrl: "",
          notes: ""
        }
      ]
    };

    const next = applySale(data, {
      finishedGoodBatchId: "batch-1",
      saleDate: "2026-06-11",
      quantitySold: 1,
      salePricePerUnit: 68,
      channelNote: "小红书",
      imageDataUrl: "",
      notes: ""
    });

    expect(next.finishedGoods[0].quantityRemaining).toBe(1);
    expect(next.sales[0].totalRevenue).toBe(68);
    expect(next.sales[0].totalCost).toBe(19);
    expect(next.sales[0].profit).toBe(49);
  });
});

function makeMaterial(
  id: string,
  name: string,
  currentQuantity: number,
  remainingTotalCost: number
): Material {
  return {
    id,
    name,
    category: "crystal",
    specification: "8mm",
    currentQuantity,
    remainingTotalCost,
    averageUnitCost: remainingTotalCost / currentQuantity,
    lowStockThreshold: 10,
    imageDataUrl: "",
    notes: ""
  };
}

function makeData(materials: Material[]): AppData {
  return {
    materials,
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/domain/inventory.test.ts`

Expected: FAIL，提示找不到 `./inventory` 或导出函数。

- [ ] **Step 3: 实现库存业务函数**

`src/domain/inventory.ts`:

```ts
import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  roundMoney
} from "./calculations";
import type {
  AppData,
  FinishedGoodBatch,
  Material,
  MaterialLine,
  ProductionRecord,
  PurchaseRecord,
  SaleRecord
} from "./types";

type PurchaseInput = Omit<PurchaseRecord, "id">;

type ProductionInput = Omit<
  ProductionRecord,
  "id" | "materialCostPerUnit" | "finishedUnitCost"
>;

type SaleInput = Pick<
  SaleRecord,
  | "finishedGoodBatchId"
  | "saleDate"
  | "quantitySold"
  | "salePricePerUnit"
  | "channelNote"
  | "imageDataUrl"
  | "notes"
>;

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function applyPurchase(data: AppData, input: PurchaseInput): AppData {
  if (input.quantity <= 0 || input.totalCost <= 0) {
    throw new Error("进货数量和总成本必须大于 0");
  }

  const materials = data.materials.map((material) => {
    if (material.id !== input.materialId) {
      return material;
    }
    const currentQuantity = material.currentQuantity + input.quantity;
    const remainingTotalCost = roundMoney(material.remainingTotalCost + input.totalCost);
    return {
      ...material,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: calculateAverageUnitCost(
        material.currentQuantity,
        material.remainingTotalCost,
        input.quantity,
        input.totalCost
      )
    };
  });

  if (!materials.some((material) => material.id === input.materialId)) {
    throw new Error("找不到对应材料");
  }

  return {
    ...data,
    materials,
    purchases: [...data.purchases, { id: createId("purchase"), ...input }]
  };
}

export function calculateRecipeMaterialCost(
  materials: Material[],
  materialLines: MaterialLine[]
): number {
  return roundMoney(
    materialLines.reduce((sum, line) => {
      const material = findMaterial(materials, line.materialId);
      return sum + material.averageUnitCost * line.quantity;
    }, 0)
  );
}

export function applyProduction(data: AppData, input: ProductionInput): AppData {
  if (input.quantityMade <= 0) {
    throw new Error("制作数量必须大于 0");
  }

  for (const line of input.materialLines) {
    const material = findMaterial(data.materials, line.materialId);
    const requiredQuantity = line.quantity * input.quantityMade;
    if (material.currentQuantity < requiredQuantity) {
      throw new Error(`材料库存不足：${material.name}`);
    }
  }

  const materialCostPerUnit = calculateRecipeMaterialCost(
    data.materials,
    input.materialLines
  );
  const finishedUnitCost = calculateFinishedUnitCost(
    materialCostPerUnit,
    input.packagingCostPerUnit,
    input.laborCostPerUnit
  );
  const productionRecord: ProductionRecord = {
    id: createId("production"),
    ...input,
    materialCostPerUnit,
    finishedUnitCost
  };
  const finishedBatch: FinishedGoodBatch = {
    id: createId("batch"),
    productionRecordId: productionRecord.id,
    recipeId: input.recipeId,
    styleName: input.styleName || input.customName,
    quantityMade: input.quantityMade,
    quantityRemaining: input.quantityMade,
    unitCost: finishedUnitCost,
    productionDate: input.productionDate,
    imageDataUrl: input.imageDataUrl,
    notes: input.notes
  };

  const materials = data.materials.map((material) => {
    const line = input.materialLines.find((item) => item.materialId === material.id);
    if (!line) {
      return material;
    }
    const usedQuantity = line.quantity * input.quantityMade;
    const usedCost = roundMoney(material.averageUnitCost * usedQuantity);
    const currentQuantity = material.currentQuantity - usedQuantity;
    const remainingTotalCost = roundMoney(Math.max(0, material.remainingTotalCost - usedCost));
    return {
      ...material,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: currentQuantity > 0 ? remainingTotalCost / currentQuantity : 0
    };
  });

  return {
    ...data,
    materials,
    productions: [...data.productions, productionRecord],
    finishedGoods: [...data.finishedGoods, finishedBatch]
  };
}

export function applySale(data: AppData, input: SaleInput): AppData {
  if (input.quantitySold <= 0 || input.salePricePerUnit <= 0) {
    throw new Error("销售数量和售价必须大于 0");
  }

  const batch = data.finishedGoods.find((item) => item.id === input.finishedGoodBatchId);
  if (!batch) {
    throw new Error("找不到对应成品批次");
  }
  if (batch.quantityRemaining < input.quantitySold) {
    throw new Error(`成品库存不足：${batch.styleName}`);
  }

  const profit = calculateSaleProfit(
    input.quantitySold,
    input.salePricePerUnit,
    batch.unitCost
  );
  const sale: SaleRecord = {
    id: createId("sale"),
    saleDate: input.saleDate,
    finishedGoodBatchId: input.finishedGoodBatchId,
    styleName: batch.styleName,
    quantitySold: input.quantitySold,
    salePricePerUnit: input.salePricePerUnit,
    unitCost: batch.unitCost,
    channelNote: input.channelNote,
    imageDataUrl: input.imageDataUrl,
    notes: input.notes,
    ...profit
  };

  return {
    ...data,
    finishedGoods: data.finishedGoods.map((item) =>
      item.id === input.finishedGoodBatchId
        ? { ...item, quantityRemaining: item.quantityRemaining - input.quantitySold }
        : item
    ),
    sales: [...data.sales, sale]
  };
}

function findMaterial(materials: Material[], materialId: string): Material {
  const material = materials.find((item) => item.id === materialId);
  if (!material) {
    throw new Error("找不到对应材料");
  }
  return material;
}
```

- [ ] **Step 4: 运行库存测试确认通过**

Run: `npm test -- src/domain/inventory.test.ts`

Expected: PASS。

- [ ] **Step 5: 运行全部测试**

Run: `npm test`

Expected: PASS。

- [ ] **Step 6: 提交库存流转逻辑**

```bash
git add src/domain/inventory.ts src/domain/inventory.test.ts
git commit -m "feat: add inventory stock operations"
```

---

### Task 4: 实现 localStorage 数据层和示例数据

**Files:**
- Create: `src/storage/store.ts`
- Create: `src/storage/store.test.ts`
- Create: `src/domain/sampleData.ts`

- [ ] **Step 1: 写存储测试**

`src/storage/store.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyData, loadData, saveData } from "./store";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates empty app data", () => {
    expect(createEmptyData()).toEqual({
      materials: [],
      purchases: [],
      recipes: [],
      productions: [],
      finishedGoods: [],
      sales: []
    });
  });

  it("loads empty data when localStorage is empty", () => {
    expect(loadData()).toEqual(createEmptyData());
  });

  it("saves and loads app data", () => {
    const data = createEmptyData();
    data.materials.push({
      id: "m1",
      name: "粉晶",
      category: "crystal",
      specification: "8mm",
      currentQuantity: 100,
      remainingTotalCost: 50,
      averageUnitCost: 0.5,
      lowStockThreshold: 10,
      imageDataUrl: "",
      notes: ""
    });

    saveData(data);

    expect(loadData().materials[0].name).toBe("粉晶");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/storage/store.test.ts`

Expected: FAIL，提示找不到 `./store`。

- [ ] **Step 3: 实现 store**

`src/storage/store.ts`:

```ts
import type { AppData } from "../domain/types";

const STORAGE_KEY = "crystal-inventory-system:v1";

export function createEmptyData(): AppData {
  return {
    materials: [],
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyData();
  }

  try {
    return { ...createEmptyData(), ...JSON.parse(raw) };
  } catch {
    return createEmptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

- [ ] **Step 4: 添加示例数据**

`src/domain/sampleData.ts`:

```ts
import type { AppData } from "./types";

export function createSampleData(): AppData {
  return {
    materials: [
      {
        id: "material-rose-quartz",
        name: "粉晶",
        category: "crystal",
        specification: "8mm",
        currentQuantity: 100,
        remainingTotalCost: 50,
        averageUnitCost: 0.5,
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例材料"
      },
      {
        id: "material-spacer",
        name: "金色隔片",
        category: "spacer",
        specification: "4mm",
        currentQuantity: 60,
        remainingTotalCost: 18,
        averageUnitCost: 0.3,
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例隔片"
      }
    ],
    purchases: [],
    recipes: [
      {
        id: "recipe-rose-bracelet",
        name: "粉晶温柔款",
        materialLines: [
          { materialId: "material-rose-quartz", quantity: 18 },
          { materialId: "material-spacer", quantity: 4 }
        ],
        packagingCostPerUnit: 3,
        laborCostPerUnit: 8,
        suggestedSalePrice: 68,
        imageDataUrl: "",
        notes: "示例款式"
      }
    ],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test`

Expected: PASS。

- [ ] **Step 6: 提交存储层**

```bash
git add src/storage/store.ts src/storage/store.test.ts src/domain/sampleData.ts
git commit -m "feat: add local app data store"
```

---

### Task 5: 搭建应用外壳、导航和全局状态

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/pages/DashboardPage.tsx`
- Create: `src/components/MetricCard.tsx`

- [ ] **Step 1: 创建仪表盘指标组件**

`src/components/MetricCard.tsx`:

```tsx
interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <section className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </section>
  );
}
```

- [ ] **Step 2: 创建仪表盘页面**

`src/pages/DashboardPage.tsx`:

```tsx
import { MetricCard } from "../components/MetricCard";
import type { AppData } from "../domain/types";

interface DashboardPageProps {
  data: AppData;
}

export function DashboardPage({ data }: DashboardPageProps) {
  const materialValue = data.materials.reduce(
    (sum, item) => sum + item.remainingTotalCost,
    0
  );
  const finishedValue = data.finishedGoods.reduce(
    (sum, item) => sum + item.quantityRemaining * item.unitCost,
    0
  );
  const revenue = data.sales.reduce((sum, item) => sum + item.totalRevenue, 0);
  const profit = data.sales.reduce((sum, item) => sum + item.profit, 0);
  const lowStock = data.materials.filter(
    (item) => item.currentQuantity <= item.lowStockThreshold
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2>总览</h2>
        <p>查看库存价值、销售收入、利润和低库存材料。</p>
      </div>
      <div className="metric-grid">
        <MetricCard label="材料库存价值" value={`¥${materialValue.toFixed(2)}`} />
        <MetricCard label="成品库存价值" value={`¥${finishedValue.toFixed(2)}`} />
        <MetricCard label="累计销售收入" value={`¥${revenue.toFixed(2)}`} />
        <MetricCard label="累计利润" value={`¥${profit.toFixed(2)}`} />
      </div>
      <section className="panel">
        <h3>低库存材料</h3>
        {lowStock.length === 0 ? (
          <p className="muted">暂无低库存材料。</p>
        ) : (
          <ul className="plain-list">
            {lowStock.map((item) => (
              <li key={item.id}>
                {item.name}：剩余 {item.currentQuantity}，提醒线 {item.lowStockThreshold}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: 修改 App 加载存储和导航**

`src/App.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChartColumn,
  ClipboardList,
  Gem,
  Home,
  PackagePlus,
  ReceiptText,
  ShoppingBag
} from "lucide-react";
import { DashboardPage } from "./pages/DashboardPage";
import { createSampleData } from "./domain/sampleData";
import type { AppData } from "./domain/types";
import { loadData, saveData } from "./storage/store";

type PageKey =
  | "dashboard"
  | "materials"
  | "purchases"
  | "recipes"
  | "production"
  | "finished"
  | "sales"
  | "reports";

const navItems = [
  { key: "dashboard", label: "总览", icon: Home },
  { key: "materials", label: "材料", icon: Gem },
  { key: "purchases", label: "进货", icon: PackagePlus },
  { key: "recipes", label: "配方", icon: ClipboardList },
  { key: "production", label: "制作", icon: Boxes },
  { key: "finished", label: "成品", icon: ShoppingBag },
  { key: "sales", label: "销售", icon: ReceiptText },
  { key: "reports", label: "报表", icon: ChartColumn }
] satisfies { key: PageKey; label: string; icon: typeof Home }[];

export function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const pageTitle = useMemo(
    () => navItems.find((item) => item.key === activePage)?.label ?? "总览",
    [activePage]
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Gem size={24} />
          <div>
            <strong>水晶库存</strong>
            <span>成本与利润</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={activePage === item.key ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => setActivePage(item.key)}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="secondary-button" type="button" onClick={() => setData(createSampleData())}>
          载入示例数据
        </button>
      </aside>
      <main className="content-area">
        <header className="topbar">
          <h1>{pageTitle}</h1>
        </header>
        {activePage === "dashboard" ? (
          <DashboardPage data={data} />
        ) : (
          <section className="panel">
            <h2>{pageTitle}</h2>
            <p className="muted">请先使用总览页确认应用外壳和数据加载正常。</p>
          </section>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 添加全局样式**

`src/styles.css` 需要替换为完整应用样式，包含 `.sidebar`、`.nav-item`、`.content-area`、`.panel`、`.metric-grid`、`.metric-card`、`.secondary-button`、`.muted`、`.plain-list`、表单和表格基础样式。

- [ ] **Step 5: 构建验证**

Run: `npm run build`

Expected: PASS。

- [ ] **Step 6: 提交应用外壳**

```bash
git add src/App.tsx src/styles.css src/pages/DashboardPage.tsx src/components/MetricCard.tsx
git commit -m "feat: add app shell and dashboard"
```

---

### Task 6: 实现通用表单、表格和图片组件

**Files:**
- Create: `src/components/FormField.tsx`
- Create: `src/components/DataTable.tsx`
- Create: `src/components/ImageInput.tsx`
- Create: `src/utils/image.ts`

- [ ] **Step 1: 实现图片压缩工具**

`src/utils/image.ts`:

```ts
export async function resizeImageFile(file: File, maxWidth = 800): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法处理图片");
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = src;
  });
}
```

- [ ] **Step 2: 创建表单字段组件**

`src/components/FormField.tsx`:

```tsx
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
```

- [ ] **Step 3: 创建表格组件**

`src/components/DataTable.tsx`:

```tsx
import type { ReactNode } from "react";

interface DataTableProps<T> {
  rows: T[];
  emptyText: string;
  columns: {
    header: string;
    render: (row: T) => ReactNode;
  }[];
}

export function DataTable<T>({ rows, emptyText, columns }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: 创建图片输入组件**

`src/components/ImageInput.tsx`:

```tsx
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { resizeImageFile } from "../utils/image";

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageInput({ value, onChange }: ImageInputProps) {
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      setError("");
      onChange(await resizeImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片处理失败");
    }
  }

  return (
    <div className="image-input">
      {value ? <img src={value} alt="预览" /> : <div className="image-placeholder">无图片</div>}
      <div className="inline-actions">
        <label className="icon-button" title="上传图片">
          <ImagePlus size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {value ? (
          <button className="icon-button" type="button" title="移除图片" onClick={() => onChange("")}>
            <X size={18} />
          </button>
        ) : null}
      </div>
      {error ? <small className="error-text">{error}</small> : null}
    </div>
  );
}
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`

Expected: PASS。

- [ ] **Step 6: 提交通用组件**

```bash
git add src/components/FormField.tsx src/components/DataTable.tsx src/components/ImageInput.tsx src/utils/image.ts src/styles.css
git commit -m "feat: add shared form table and image components"
```

---

### Task 7: 实现材料和进货页面

**Files:**
- Create: `src/pages/MaterialsPage.tsx`
- Create: `src/pages/PurchasesPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建材料页面**

`MaterialsPage` 应支持新增材料、上传材料图片、查看库存颗数、平均单颗成本、剩余总成本、低库存状态。

关键行为：

```tsx
const newMaterial = {
  id: createId("material"),
  name,
  category,
  specification,
  currentQuantity: 0,
  remainingTotalCost: 0,
  averageUnitCost: 0,
  lowStockThreshold,
  imageDataUrl,
  notes
};
```

- [ ] **Step 2: 创建进货页面**

`PurchasesPage` 应选择已有材料，填写数量、总成本、日期、备注，保存时调用 `applyPurchase(data, input)`。

关键行为：

```tsx
setData((current) =>
  applyPurchase(current, {
    materialId,
    quantity,
    totalCost,
    purchaseDate,
    notes
  })
);
```

- [ ] **Step 3: 接入 App 页面切换**

`App.tsx` 应在 `materials` 时渲染 `MaterialsPage`，在 `purchases` 时渲染 `PurchasesPage`，并把 `data` 和 `setData` 传入。

- [ ] **Step 4: 手动验收**

Run: `npm run dev`

Expected:

- 可以新增“粉晶 8mm”材料。
- 可以为材料上传图片并看到预览。
- 可以录入进货 100 颗、50 元。
- 材料库存变成 100，平均成本为 0.50 元。

- [ ] **Step 5: 构建和测试**

Run: `npm test && npm run build`

Expected: PASS。

- [ ] **Step 6: 提交材料和进货页面**

```bash
git add src/pages/MaterialsPage.tsx src/pages/PurchasesPage.tsx src/App.tsx src/styles.css
git commit -m "feat: add materials and purchases pages"
```

---

### Task 8: 实现配方和制作页面

**Files:**
- Create: `src/pages/RecipesPage.tsx`
- Create: `src/pages/ProductionPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建配方页面**

`RecipesPage` 应支持新增常卖款，选择多行材料和每条用量，填写包装成本、手工成本、建议售价、图片和备注。

配方预计成本展示：

```tsx
const materialCost = calculateRecipeMaterialCost(data.materials, materialLines);
const totalCost = calculateFinishedUnitCost(materialCost, packagingCostPerUnit, laborCostPerUnit);
const estimatedProfit = suggestedSalePrice - totalCost;
```

- [ ] **Step 2: 创建制作页面**

`ProductionPage` 应支持两种模式：

- 选择配方制作。
- 临时定制制作。

保存时调用 `applyProduction(data, input)`，并捕获库存不足错误显示给用户。

- [ ] **Step 3: 接入 App 页面切换**

`App.tsx` 应在 `recipes` 时渲染 `RecipesPage`，在 `production` 时渲染 `ProductionPage`。

- [ ] **Step 4: 手动验收**

Run: `npm run dev`

Expected:

- 可以新增“粉晶温柔款”配方。
- 每条用粉晶 18 颗、隔片 4 个。
- 制作 2 条后，材料库存扣减 36 颗粉晶和 8 个隔片。
- 成品库存新增一个批次，剩余数量为 2，单条成本包含材料、包装、手工。

- [ ] **Step 5: 构建和测试**

Run: `npm test && npm run build`

Expected: PASS。

- [ ] **Step 6: 提交配方和制作页面**

```bash
git add src/pages/RecipesPage.tsx src/pages/ProductionPage.tsx src/App.tsx src/styles.css
git commit -m "feat: add recipes and production workflow"
```

---

### Task 9: 实现成品、销售和报表页面

**Files:**
- Create: `src/pages/FinishedGoodsPage.tsx`
- Create: `src/pages/SalesPage.tsx`
- Create: `src/pages/ReportsPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建成品库存页面**

`FinishedGoodsPage` 应显示成品批次、图片、制作日期、制作数量、剩余数量、单条成本和备注。

- [ ] **Step 2: 创建销售页面**

`SalesPage` 应选择有库存的成品批次，填写数量、售价、日期、渠道/客户备注、可选销售图片。保存时调用 `applySale(data, input)`。

- [ ] **Step 3: 创建报表页面**

`ReportsPage` 应显示：

- 每笔销售利润。
- `summarizeByStyle(data.sales)` 款式汇总。
- `summarizeByMonth(data.sales)` 月度汇总。

- [ ] **Step 4: 接入 App 页面切换**

`App.tsx` 应渲染 `FinishedGoodsPage`、`SalesPage`、`ReportsPage`。

- [ ] **Step 5: 手动验收**

Run: `npm run dev`

Expected:

- 成品库存能看到已制作批次。
- 售出 1 条 68 元后，成品库存剩余数量减少 1。
- 销售记录显示收入、成本、利润、利润率。
- 报表按款式和月份正确汇总。

- [ ] **Step 6: 构建和测试**

Run: `npm test && npm run build`

Expected: PASS。

- [ ] **Step 7: 提交销售和报表**

```bash
git add src/pages/FinishedGoodsPage.tsx src/pages/SalesPage.tsx src/pages/ReportsPage.tsx src/App.tsx src/styles.css
git commit -m "feat: add finished goods sales and reports"
```

---

### Task 10: 最终体验打磨和浏览器验证

**Files:**
- Modify: `src/styles.css`
- Modify as needed: `src/App.tsx`
- Modify as needed: page files under `src/pages/`

- [ ] **Step 1: 检查中文界面文案**

确认页面标题、按钮、错误提示、空状态都使用中文，且不出现开发占位文案。

- [ ] **Step 2: 检查响应式布局**

Run: `npm run dev`

Expected:

- 桌面宽度下左侧导航和主内容不重叠。
- 窄屏下页面可滚动，表格可横向滚动。
- 按钮文字不溢出。

- [ ] **Step 3: 使用浏览器做完整业务流验收**

在浏览器里依次完成：

1. 新增材料“粉晶 8mm”和“金色隔片 4mm”。
2. 分别录入进货。
3. 新增一个配方。
4. 按配方制作 2 条成品。
5. 售出 1 条。
6. 查看总览、成品库存、销售记录、款式报表、月度报表。

Expected:

- 进货增加材料库存。
- 制作扣减材料库存并增加成品库存。
- 销售扣减成品库存并计算利润。
- 图片预览可显示。

- [ ] **Step 4: 最终命令验证**

Run: `npm test && npm run build`

Expected: PASS。

- [ ] **Step 5: 提交最终打磨**

```bash
git add src
git commit -m "polish: refine crystal inventory experience"
```

---

## 自查结果

- 设计文档中的材料库存、进货、配方、制作、成品、销售、报表、图片都在任务中覆盖。
- 核心成本规则由 `calculations.ts` 和 `inventory.ts` 测试覆盖。
- 本地存储由 `store.ts` 覆盖。
- 第一版明确不做登录、云同步、供应商管理、客户会员、店铺同步、完整会计流水、扫码。
- 计划没有保留 TBD/TODO 占位项。
