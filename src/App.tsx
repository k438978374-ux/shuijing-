import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileClock,
  Gem,
  Home,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Search,
  ShoppingBag
} from "lucide-react";
import { AccessGate } from "./components/AccessGate";
import { createSampleData } from "./domain/sampleData";
import type { AppData } from "./domain/types";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FinishedGoodsPage } from "./pages/FinishedGoodsPage";
import { InventoryAdjustmentsPage } from "./pages/InventoryAdjustmentsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProductionPage } from "./pages/ProductionPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { RecipesPage } from "./pages/RecipesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesPage } from "./pages/SalesPage";
import { isCloudSyncEnabled, loadCloudData, saveCloudData } from "./storage/cloudStore";
import { loadData, saveData } from "./storage/store";

type PageKey =
  | "dashboard"
  | "materials"
  | "purchases"
  | "recipes"
  | "production"
  | "adjustments"
  | "finished"
  | "sales"
  | "audit"
  | "reports";

type MaterialSectionKey = "groups" | "subtypes" | "colors" | "items";

type NavItem = {
  key: PageKey;
  label: string;
  icon: typeof Home;
};

type SearchTarget = {
  key: string;
  label: string;
  page: PageKey;
  section?: MaterialSectionKey;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "总览", icon: Home },
  { key: "materials", label: "材料", icon: Gem },
  { key: "purchases", label: "进货", icon: PackagePlus },
  { key: "recipes", label: "配方", icon: ClipboardList },
  { key: "production", label: "制作", icon: Boxes },
  { key: "adjustments", label: "调库", icon: PackageCheck },
  { key: "finished", label: "成品", icon: ShoppingBag },
  { key: "sales", label: "销售", icon: ReceiptText },
  { key: "audit", label: "记录", icon: FileClock },
  { key: "reports", label: "报表", icon: ChartColumn }
];

const materialChildren: Array<{ key: MaterialSectionKey; label: string }> = [
  { key: "groups", label: "大类" },
  { key: "subtypes", label: "小类" },
  { key: "colors", label: "颜色" },
  { key: "items", label: "货品" }
];

const LOCAL_TEST_GOODS_CLEANUP_KEY = "crystal-inventory-system:cleared-test-goods-2026-06-12-v3";

export function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [activeMaterialSection, setActiveMaterialSection] = useState<MaterialSectionKey>("items");
  const [isMaterialsExpanded, setIsMaterialsExpanded] = useState(true);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [data, setDataState] = useState<AppData>(() => clearLocalTestGoodsOnce(loadData()));
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncMessage, setSyncMessage] = useState(() =>
    isCloudSyncEnabled() ? "正在连接云端存储..." : "当前仅使用本地存储"
  );
  const accessPassword = import.meta.env.VITE_ACCESS_PASSWORD ?? "";

  useEffect(() => {
    setDataState((current) => clearLocalTestGoodsOnce(current));
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromCloud() {
      if (!isCloudSyncEnabled()) {
        setIsHydrated(true);
        return;
      }

      try {
        const cloudData = await loadCloudData();
        if (cancelled) {
          return;
        }

        if (cloudData) {
          setDataState(cloudData);
          saveData(cloudData);
          setSyncMessage("已连接云端存储");
        } else {
          setSyncMessage("云端已连接，首次保存后会自动建档");
        }
      } catch {
        if (!cancelled) {
          setSyncMessage("云端连接失败，当前先使用本地存储");
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateFromCloud();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveData(data);

    if (!isCloudSyncEnabled()) {
      return;
    }

    let cancelled = false;

    async function syncToCloud() {
      try {
        await saveCloudData(data);
        if (!cancelled) {
          setSyncMessage("已同步到云端");
        }
      } catch {
        if (!cancelled) {
          setSyncMessage("云端同步失败，数据仍已保存在本机");
        }
      }
    }

    void syncToCloud();

    return () => {
      cancelled = true;
    };
  }, [data, isHydrated]);

  const pageTitle = useMemo(
    () => navItems.find((item) => item.key === activePage)?.label ?? "总览",
    [activePage]
  );

  const searchTargets = useMemo<SearchTarget[]>(
    () => [
      ...navItems
        .filter((item) => item.key !== "materials")
        .map((item) => ({ key: item.key, label: item.label, page: item.key })),
      { key: "materials", label: "材料", page: "materials" },
      ...materialChildren.map((item) => ({
        key: `materials-${item.key}`,
        label: `材料 / ${item.label}`,
        page: "materials" as const,
        section: item.key
      }))
    ],
    []
  );

  const filteredTargets = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }
    return searchTargets.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 6);
  }, [catalogQuery, searchTargets]);

  function setData(updater: (current: AppData) => AppData) {
    setDataState((current) => updater(current));
  }

  function openPage(page: PageKey) {
    setActivePage(page);
    if (page === "materials") {
      setIsMaterialsExpanded(true);
    }
  }

  function handleMaterialsClick() {
    if (activePage !== "materials") {
      setActivePage("materials");
      setIsMaterialsExpanded(true);
      return;
    }
    setIsMaterialsExpanded((current) => !current);
  }

  function openMaterialSection(section: MaterialSectionKey) {
    setActivePage("materials");
    setActiveMaterialSection(section);
    setIsMaterialsExpanded(true);
  }

  function handleSearchTargetClick(target: SearchTarget) {
    setCatalogQuery("");
    if (target.page === "materials" && target.section) {
      openMaterialSection(target.section);
      return;
    }
    openPage(target.page);
  }

  return (
    <AccessGate password={accessPassword}>
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

              if (item.key === "materials") {
                return (
                  <div className="nav-group" key={item.key}>
                    <button
                      className={activePage === item.key ? "nav-item active" : "nav-item"}
                      type="button"
                      onClick={handleMaterialsClick}
                      title={item.label}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {isMaterialsExpanded ? <ChevronDown className="nav-chevron" size={16} /> : <ChevronRight className="nav-chevron" size={16} />}
                    </button>
                    {isMaterialsExpanded ? (
                      <div className="nav-sublist">
                        {materialChildren.map((child) => (
                          <button
                            key={child.key}
                            className={
                              activePage === "materials" && activeMaterialSection === child.key
                                ? "nav-subitem active"
                                : "nav-subitem"
                            }
                            type="button"
                            onClick={() => openMaterialSection(child.key)}
                          >
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  className={activePage === item.key ? "nav-item active" : "nav-item"}
                  type="button"
                  onClick={() => openPage(item.key)}
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
            <div>
              <h1>{pageTitle}</h1>
              <p className="muted topbar-subtext">{syncMessage}</p>
            </div>
            <div className="catalog-search-wrap">
              <label className="catalog-search" aria-label="搜索目录标题">
                <Search size={16} />
                <input
                  type="search"
                  value={catalogQuery}
                  onChange={(event) => setCatalogQuery(event.target.value)}
                />
              </label>
              {filteredTargets.length > 0 ? (
                <div className="catalog-search-results">
                  {filteredTargets.map((target) => (
                    <button key={target.key} type="button" className="catalog-search-item" onClick={() => handleSearchTargetClick(target)}>
                      {target.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          {activePage === "dashboard" ? <DashboardPage data={data} /> : null}
          {activePage === "materials" ? (
            <MaterialsPage data={data} setData={setData} activeSection={activeMaterialSection} />
          ) : null}
          {activePage === "purchases" ? <PurchasesPage data={data} setData={setData} /> : null}
          {activePage === "recipes" ? <RecipesPage data={data} setData={setData} /> : null}
          {activePage === "production" ? <ProductionPage data={data} setData={setData} /> : null}
          {activePage === "adjustments" ? <InventoryAdjustmentsPage data={data} setData={setData} /> : null}
          {activePage === "finished" ? <FinishedGoodsPage data={data} /> : null}
          {activePage === "sales" ? <SalesPage data={data} setData={setData} /> : null}
          {activePage === "audit" ? <AuditLogsPage data={data} /> : null}
          {activePage === "reports" ? <ReportsPage data={data} /> : null}
        </main>
      </div>
    </AccessGate>
  );
}

function clearLocalTestGoodsOnce(data: AppData): AppData {
  if (isCloudSyncEnabled() || localStorage.getItem(LOCAL_TEST_GOODS_CLEANUP_KEY) === "done") {
    return data;
  }

  const clearedData = {
    ...data,
    materials: [],
    materialStocks: [],
    materialBatches: [],
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };

  saveData(clearedData);
  localStorage.setItem(LOCAL_TEST_GOODS_CLEANUP_KEY, "done");

  return clearedData;
}
