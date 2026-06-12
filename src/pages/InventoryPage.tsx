import { useMemo, useState } from "react";
import { exportCsv } from "../utils/csvExport";
import { todayDateString } from "../utils/dateFilter";
import {
  getColorById,
  getGroupById,
  getMaterialColors,
  getMaterialGroups,
  getMaterialSubtypes,
  getSubtypeById,
  getSubtypesForGroup
} from "../domain/materialCatalog";
import type { AppData, Material, MaterialBatch } from "../domain/types";

type SortKey =
  | "purchaseDate-desc"
  | "purchaseDate-asc"
  | "currentQuantity-desc"
  | "currentQuantity-asc"
  | "remainingTotalCost-desc"
  | "remainingTotalCost-asc";

export function InventoryPage({ data }: { data: AppData }) {
  const groups = getMaterialGroups(data);
  const allSubtypes = getMaterialSubtypes(data);
  const colors = getMaterialColors(data);
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [groupId, setGroupId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");
  const [colorId, setColorId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("purchaseDate-desc");

  const availableSubtypes = groupId ? getSubtypesForGroup(data, groupId) : allSubtypes;
  const availableMaterials = data.materials.filter((material) => {
    if (groupId && material.groupId !== groupId) {
      return false;
    }
    if (subtypeId && material.subtypeId !== subtypeId) {
      return false;
    }
    if (colorId && material.colorId !== colorId) {
      return false;
    }
    return true;
  });

  const rows = useMemo(() => {
    const filteredRows = (data.materialBatches ?? []).filter((batch) => {
      const material = getBatchMaterial(data, batch);
      if (selectedDate && batch.purchaseDate !== selectedDate) {
        return false;
      }
      if (groupId && material?.groupId !== groupId) {
        return false;
      }
      if (subtypeId && material?.subtypeId !== subtypeId) {
        return false;
      }
      if (colorId && material?.colorId !== colorId) {
        return false;
      }
      if (materialId && batch.materialId !== materialId) {
        return false;
      }
      return true;
    });

    return [...filteredRows].sort((left, right) => compareBatch(left, right, sortKey));
  }, [colorId, data, groupId, materialId, selectedDate, sortKey, subtypeId]);

  function handleGroupChange(nextGroupId: string) {
    setGroupId(nextGroupId);
    setSubtypeId("");
    setMaterialId("");
  }

  function handleSubtypeChange(nextSubtypeId: string) {
    setSubtypeId(nextSubtypeId);
    setMaterialId("");
  }

  function handleColorChange(nextColorId: string) {
    setColorId(nextColorId);
    setMaterialId("");
  }

  function handleExport() {
    exportCsv(
      rows,
      [
        { header: "入库日期", value: (row) => row.purchaseDate },
        { header: "大类", value: (row) => getMaterialGroupName(data, getBatchMaterial(data, row)) },
        { header: "小类", value: (row) => getMaterialSubtypeName(data, getBatchMaterial(data, row)) },
        { header: "颜色", value: (row) => getMaterialColorName(data, getBatchMaterial(data, row)) },
        { header: "货品名称", value: (row) => getBatchMaterial(data, row)?.name ?? "已删除货品" },
        { header: "尺寸/mm", value: (row) => stripMm(row.specification) },
        { header: "原数量", value: (row) => row.originalQuantity },
        { header: "当前库存", value: (row) => row.currentQuantity },
        { header: "单颗成本", value: (row) => row.unitCost.toFixed(2) },
        { header: "剩余成本", value: (row) => row.remainingTotalCost.toFixed(2) },
        { header: "备注", value: (row) => row.notes }
      ],
      "库存明细"
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>库存明细</h2>
        </div>
        <button className="secondary-button table-export-button" type="button" onClick={handleExport}>
          导出 Excel
        </button>
      </div>

      <div className="inventory-filter-row">
        <label className="compact-filter">
          <span>入库日期</span>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.currentTarget.value)} />
        </label>
        <button className="text-button subtle-text-button" type="button" onClick={() => setSelectedDate("")}>
          全部
        </button>
        <label className="compact-filter">
          <span>筛选大类</span>
          <select value={groupId} onChange={(event) => handleGroupChange(event.currentTarget.value)}>
            <option value="">全部</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-filter">
          <span>筛选小类</span>
          <select value={subtypeId} onChange={(event) => handleSubtypeChange(event.currentTarget.value)}>
            <option value="">全部</option>
            {availableSubtypes.map((subtype) => (
              <option key={subtype.id} value={subtype.id}>
                {subtype.name}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-filter">
          <span>筛选颜色</span>
          <select value={colorId} onChange={(event) => handleColorChange(event.currentTarget.value)}>
            <option value="">全部</option>
            {colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-filter">
          <span>筛选货品</span>
          <select value={materialId} onChange={(event) => setMaterialId(event.currentTarget.value)}>
            <option value="">全部</option>
            {availableMaterials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-filter">
          <span>排序</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.currentTarget.value as SortKey)}>
            <option value="purchaseDate-desc">日期倒序</option>
            <option value="purchaseDate-asc">日期正序</option>
            <option value="currentQuantity-desc">库存从高到低</option>
            <option value="currentQuantity-asc">库存从低到高</option>
            <option value="remainingTotalCost-desc">成本从高到低</option>
            <option value="remainingTotalCost-asc">成本从低到高</option>
          </select>
        </label>
      </div>

      <div className="table-card inventory-table-card">
        {rows.length === 0 ? (
          <div className="empty-table-card">
            <p className="muted">没有符合条件的库存记录。</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>入库日期</th>
                  <th>大类</th>
                  <th>小类</th>
                  <th>颜色</th>
                  <th>货品名称</th>
                  <th>尺寸/mm</th>
                  <th>原数量</th>
                  <th>当前库存</th>
                  <th>单颗成本</th>
                  <th>剩余成本</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const material = getBatchMaterial(data, row);
                  return (
                    <tr key={row.id}>
                      <td>{row.purchaseDate}</td>
                      <td>{getMaterialGroupName(data, material)}</td>
                      <td>{getMaterialSubtypeName(data, material)}</td>
                      <td>{getMaterialColorName(data, material)}</td>
                      <td>
                        <strong>{material?.name ?? "已删除货品"}</strong>
                      </td>
                      <td>{stripMm(row.specification)}</td>
                      <td>{row.originalQuantity}</td>
                      <td>{row.currentQuantity}</td>
                      <td>¥{row.unitCost.toFixed(2)}</td>
                      <td>¥{row.remainingTotalCost.toFixed(2)}</td>
                      <td>{row.notes || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            显示 {rows.length} 条 / 共 {(data.materialBatches ?? []).length} 条
          </span>
          <span>按入库批次保留成本</span>
        </div>
      </div>
    </section>
  );
}

function compareBatch(left: MaterialBatch, right: MaterialBatch, sortKey: SortKey) {
  const [key, direction] = sortKey.split("-") as [keyof MaterialBatch, "asc" | "desc"];
  const leftValue = left[key];
  const rightValue = right[key];
  const comparison = typeof leftValue === "number" && typeof rightValue === "number"
    ? leftValue - rightValue
    : String(leftValue ?? "").localeCompare(String(rightValue ?? ""));

  return direction === "asc" ? comparison : -comparison;
}

function getBatchMaterial(data: AppData, batch: MaterialBatch): Material | undefined {
  return data.materials.find((item) => item.id === batch.materialId);
}

function stripMm(value: string) {
  return value.replace(/mm$/i, "");
}

function getMaterialGroupName(data: AppData, material: Material | undefined) {
  return getGroupById(data, material?.groupId)?.name ?? "-";
}

function getMaterialSubtypeName(data: AppData, material: Material | undefined) {
  return getSubtypeById(data, material?.subtypeId)?.name ?? material?.subtype ?? "-";
}

function getMaterialColorName(data: AppData, material: Material | undefined) {
  return getColorById(data, material?.colorId)?.name ?? "-";
}
