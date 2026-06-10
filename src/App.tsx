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
import { FinishedGoodsPage } from "./pages/FinishedGoodsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProductionPage } from "./pages/ProductionPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { RecipesPage } from "./pages/RecipesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesPage } from "./pages/SalesPage";
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
  const [data, setDataState] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const pageTitle = useMemo(
    () => navItems.find((item) => item.key === activePage)?.label ?? "总览",
    [activePage]
  );

  function setData(updater: (data: AppData) => AppData) {
    setDataState((current) => updater(current));
  }

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
        <button className="secondary-button" type="button" onClick={() => setDataState(createSampleData())}>
          载入示例数据
        </button>
      </aside>
      <main className="content-area">
        <header className="topbar">
          <h1>{pageTitle}</h1>
        </header>
        {activePage === "dashboard" ? <DashboardPage data={data} /> : null}
        {activePage === "materials" ? <MaterialsPage data={data} setData={setData} /> : null}
        {activePage === "purchases" ? <PurchasesPage data={data} setData={setData} /> : null}
        {activePage === "recipes" ? <RecipesPage data={data} setData={setData} /> : null}
        {activePage === "production" ? <ProductionPage data={data} setData={setData} /> : null}
        {activePage === "finished" ? <FinishedGoodsPage data={data} /> : null}
        {activePage === "sales" ? <SalesPage data={data} setData={setData} /> : null}
        {activePage === "reports" ? <ReportsPage data={data} /> : null}
      </main>
    </div>
  );
}
