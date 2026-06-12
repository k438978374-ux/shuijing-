import { useEffect, useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { Modal } from "../components/Modal";
import {
  formatMaterialName,
  getColorById,
  getMaterialColors,
  getMaterialGroups,
  getMaterialSubtypes,
  getSubtypesForGroup
} from "../domain/materialCatalog";
import { applyMaterialStatusChange, createId } from "../domain/inventory";
import type { AppData, Material, MaterialColor, MaterialGroup, MaterialSubtype } from "../domain/types";

type MaterialSection = "groups" | "subtypes" | "colors" | "items";

interface MaterialsPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
  activeSection?: MaterialSection;
}

export function MaterialsPage({ data, setData, activeSection = "items" }: MaterialsPageProps) {
  const groups = getMaterialGroups(data);
  const subtypes = getMaterialSubtypes(data);
  const colors = getMaterialColors(data);
  const [showInactive, setShowInactive] = useState(false);
  const [subtypeFilterGroupId, setSubtypeFilterGroupId] = useState("");
  const [materialFilterColorId, setMaterialFilterColorId] = useState("");

  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");

  const [isSubtypeOpen, setIsSubtypeOpen] = useState(false);
  const [subtypeGroupId, setSubtypeGroupId] = useState(groups[0]?.id ?? "");
  const [subtypeCode, setSubtypeCode] = useState("");
  const [subtypeName, setSubtypeName] = useState("");

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");

  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [materialGroupId, setMaterialGroupId] = useState(groups[0]?.id ?? "");
  const [materialSubtypeId, setMaterialSubtypeId] = useState(getSubtypesForGroup(data, groups[0]?.id)[0]?.id ?? "");
  const [materialColorId, setMaterialColorId] = useState(colors[0]?.id ?? "");
  const [materialName, setMaterialName] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [statusTargetId, setStatusTargetId] = useState("");
  const [imageTargetId, setImageTargetId] = useState("");
  const [editingImageDataUrl, setEditingImageDataUrl] = useState("");
  const [detailMaterialId, setDetailMaterialId] = useState("");
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [detailGroupId, setDetailGroupId] = useState("");
  const [detailSubtypeId, setDetailSubtypeId] = useState("");
  const [detailColorId, setDetailColorId] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailLowStockThreshold, setDetailLowStockThreshold] = useState(10);
  const [detailImageDataUrl, setDetailImageDataUrl] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const [employeeName, setEmployeeName] = useState((data.employees ?? [])[0]?.name ?? "");
  const [statusReason, setStatusReason] = useState("");
  const [statusPassword, setStatusPassword] = useState("");

  useEffect(() => {
    if (!subtypeGroupId && groups[0]) {
      setSubtypeGroupId(groups[0].id);
    }
    if (!materialGroupId && groups[0]) {
      setMaterialGroupId(groups[0].id);
    }
    if (!materialColorId && colors[0]) {
      setMaterialColorId(colors[0].id);
    }
  }, [colors, groups, materialColorId, materialGroupId, subtypeGroupId]);

  useEffect(() => {
    const subtypeOptions = getSubtypesForGroup(data, materialGroupId);
    if (subtypeOptions.length === 0) {
      setMaterialSubtypeId("");
      return;
    }
    if (!subtypeOptions.some((item) => item.id === materialSubtypeId)) {
      setMaterialSubtypeId(subtypeOptions[0].id);
    }
  }, [data, materialGroupId, materialSubtypeId]);

  useEffect(() => {
    if (!detailMaterialId) {
      return;
    }
    const subtypeOptions = getSubtypesForGroup(data, detailGroupId);
    if (subtypeOptions.length === 0) {
      setDetailSubtypeId("");
      return;
    }
    if (!subtypeOptions.some((item) => item.id === detailSubtypeId)) {
      setDetailSubtypeId(subtypeOptions[0].id);
    }
  }, [data, detailGroupId, detailMaterialId, detailSubtypeId]);

  const inactiveCount = data.materials.filter((item) => !(item.isActive ?? true)).length;
  const visibleMaterials = showInactive
    ? data.materials.filter((item) => !(item.isActive ?? true))
    : data.materials.filter((item) => item.isActive ?? true);
  const filteredSubtypes = subtypeFilterGroupId
    ? subtypes.filter((item) => item.groupId === subtypeFilterGroupId)
    : subtypes;
  const filteredMaterials = materialFilterColorId
    ? visibleMaterials.filter((item) => item.colorId === materialFilterColorId)
    : visibleMaterials;
  const targetMaterial = data.materials.find((item) => item.id === statusTargetId);
  const imageTargetMaterial = data.materials.find((item) => item.id === imageTargetId);
  const detailMaterial = data.materials.find((item) => item.id === detailMaterialId);
  const materialSubtypeOptions = getSubtypesForGroup(data, materialGroupId);
  const detailSubtypeOptions = getSubtypesForGroup(data, detailGroupId);
  const pageTitle =
    activeSection === "groups"
      ? "材料大类"
      : activeSection === "subtypes"
        ? "材料小类"
        : activeSection === "colors"
          ? "颜色目录"
        : showInactive
          ? "停用货品"
          : "货品目录";

  function resetMaterialForm() {
    setMaterialName("");
    setLowStockThreshold(10);
    setImageDataUrl("");
    setNotes("");
    setError("");
  }

  function resetGroupForm() {
    setGroupCode("");
    setGroupName("");
    setError("");
  }

  function resetSubtypeForm() {
    setSubtypeCode("");
    setSubtypeName("");
    setError("");
  }

  function resetColorForm() {
    setColorCode("");
    setColorName("");
    setError("");
  }

  function openImageEditor(material: Material) {
    setImageTargetId(material.id);
    setEditingImageDataUrl(material.imageDataUrl);
  }

  function openMaterialDetail(material: Material) {
    setDetailMaterialId(material.id);
    setDetailEditMode(false);
    setDetailGroupId(material.groupId ?? "");
    setDetailSubtypeId(material.subtypeId ?? "");
    setDetailColorId(material.colorId ?? "");
    setDetailName(material.name);
    setDetailLowStockThreshold(material.lowStockThreshold);
    setDetailImageDataUrl(material.imageDataUrl);
    setDetailNotes(material.notes);
    setError("");
  }

  function closeMaterialDetail() {
    setDetailMaterialId("");
    setDetailEditMode(false);
    setError("");
  }

  function handleCreateGroup(event: FormEvent) {
    event.preventDefault();
    if (!groupCode.trim() || !groupName.trim()) {
      setError("请填写大类代号和名称");
      return;
    }
    if (hasDuplicateCode(groups, groupCode)) {
      setError("代号已存在");
      return;
    }

    const nextGroup: MaterialGroup = {
      id: createId("group"),
      code: groupCode.trim(),
      name: groupName.trim(),
      isActive: true
    };

    setData((current) => ({
      ...current,
      materialGroups: [...(current.materialGroups ?? []), nextGroup]
    }));
    setSubtypeGroupId(nextGroup.id);
    setMaterialGroupId(nextGroup.id);
    resetGroupForm();
    setIsGroupOpen(false);
  }

  function handleCreateSubtype(event: FormEvent) {
    event.preventDefault();
    if (!subtypeGroupId) {
      setError("请先选择所属大类");
      return;
    }
    if (!subtypeCode.trim() || !subtypeName.trim()) {
      setError("请填写小类代号和名称");
      return;
    }
    if (hasDuplicateCode(subtypes, subtypeCode)) {
      setError("代号已存在");
      return;
    }

    const nextSubtype: MaterialSubtype = {
      id: createId("subtype"),
      groupId: subtypeGroupId,
      code: subtypeCode.trim(),
      name: subtypeName.trim(),
      isActive: true
    };

    setData((current) => ({
      ...current,
      materialSubtypes: [...(current.materialSubtypes ?? []), nextSubtype]
    }));
    setMaterialGroupId(subtypeGroupId);
    setMaterialSubtypeId(nextSubtype.id);
    resetSubtypeForm();
    setIsSubtypeOpen(false);
  }

  function handleCreateColor(event: FormEvent) {
    event.preventDefault();
    if (!colorCode.trim() || !colorName.trim()) {
      setError("请填写颜色代号和名称");
      return;
    }
    if (hasDuplicateCode(colors, colorCode)) {
      setError("代号已存在");
      return;
    }

    const nextColor: MaterialColor = {
      id: createId("color"),
      code: colorCode.trim(),
      name: colorName.trim(),
      isActive: true
    };

    setData((current) => ({
      ...current,
      materialColors: [...(current.materialColors ?? []), nextColor]
    }));
    setMaterialColorId(nextColor.id);
    resetColorForm();
    setIsColorOpen(false);
  }

  function handleCreateMaterial(event: FormEvent) {
    event.preventDefault();
    if (!materialGroupId || !materialSubtypeId || !materialColorId) {
      setError("请先选好大类、小类和颜色");
      return;
    }
    if (!materialName.trim()) {
      setError("请填写货品名称");
      return;
    }

    const material: Material = {
      id: createId("material"),
      name: materialName.trim(),
      groupId: materialGroupId,
      subtypeId: materialSubtypeId,
      colorId: materialColorId,
      lowStockThreshold,
      imageDataUrl,
      notes: notes.trim(),
      isActive: true
    };

    setData((current) => ({ ...current, materials: [...current.materials, material] }));
    resetMaterialForm();
    setIsMaterialOpen(false);
  }

  function handleDeleteGroup(group: MaterialGroup) {
    const linkedMaterials = data.materials.filter(
      (material) => material.groupId === group.id || subtypes.some((subtype) => subtype.groupId === group.id && subtype.id === material.subtypeId)
    );
    if (linkedMaterials.length > 0) {
      setError("已有货品使用，不能删除");
      return;
    }

    setData((current) => ({
      ...current,
      materialGroups: (current.materialGroups ?? []).filter((item) => item.id !== group.id),
      materialSubtypes: (current.materialSubtypes ?? []).filter((item) => item.groupId !== group.id)
    }));
    setError("");
  }

  function handleDeleteSubtype(subtype: MaterialSubtype) {
    if (data.materials.some((material) => material.subtypeId === subtype.id)) {
      setError("已有货品使用，不能删除");
      return;
    }

    setData((current) => ({
      ...current,
      materialSubtypes: (current.materialSubtypes ?? []).filter((item) => item.id !== subtype.id)
    }));
    setError("");
  }

  function handleDeleteColor(color: MaterialColor) {
    if (data.materials.some((material) => material.colorId === color.id)) {
      setError("已有货品使用，不能删除");
      return;
    }

    setData((current) => ({
      ...current,
      materialColors: (current.materialColors ?? []).filter((item) => item.id !== color.id)
    }));
    setError("");
  }

  function handleDetailSave(event: FormEvent) {
    event.preventDefault();
    if (!detailMaterial) {
      return;
    }

    setData((current) => ({
      ...current,
      materials: current.materials.map((material) =>
        material.id === detailMaterial.id
          ? {
              ...material,
              name: detailMaterial.name,
              groupId: detailGroupId,
              subtypeId: detailSubtypeId,
              colorId: detailColorId,
              lowStockThreshold: detailLowStockThreshold,
              imageDataUrl: detailImageDataUrl,
              notes: detailNotes.trim()
            }
          : material
      )
    }));
    setDetailEditMode(false);
    setError("");
  }

  function handleImageSubmit(event: FormEvent) {
    event.preventDefault();
    if (!imageTargetMaterial) {
      return;
    }

    setData((current) => ({
      ...current,
      materials: current.materials.map((material) =>
        material.id === imageTargetMaterial.id ? { ...material, imageDataUrl: editingImageDataUrl } : material
      )
    }));
    setImageTargetId("");
    setEditingImageDataUrl("");
  }

  function handleStatusSubmit(event: FormEvent) {
    event.preventDefault();
    if (!targetMaterial) {
      return;
    }

    try {
      setData((current) => {
        const next = applyMaterialStatusChange(current, {
          materialId: targetMaterial.id,
          isActive: !(targetMaterial.isActive ?? true),
          employeeName,
          reason: statusReason,
          password: statusPassword
        });
        const exists = next.employees.some((item) => item.name === employeeName.trim());
        return exists || !employeeName.trim()
          ? next
          : {
              ...next,
              employees: [...next.employees, { id: createId("employee"), name: employeeName.trim(), isActive: true }]
            };
      });
      setStatusTargetId("");
      setStatusReason("");
      setStatusPassword("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{pageTitle}</h2>
        </div>
        <div className="inline-actions">
          {activeSection === "items" ? (
            <button className="secondary-button" type="button" onClick={() => setShowInactive((current) => !current)}>
              {showInactive ? "查看在用" : `查看停用 (${inactiveCount})`}
            </button>
          ) : null}
          {activeSection === "groups" ? (
            <button className="primary-button" type="button" onClick={() => setIsGroupOpen(true)}>
              + 新增大类
            </button>
          ) : null}
          {activeSection === "subtypes" ? (
            <label className="compact-filter">
              <span>筛选大类</span>
              <select value={subtypeFilterGroupId} onChange={(event) => setSubtypeFilterGroupId(event.target.value)}>
                <option value="">全部</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {activeSection === "items" ? (
            <label className="compact-filter">
              <span>筛选颜色</span>
              <select value={materialFilterColorId} onChange={(event) => setMaterialFilterColorId(event.target.value)}>
                <option value="">全部</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {activeSection === "subtypes" ? (
            <button className="primary-button" type="button" onClick={() => setIsSubtypeOpen(true)}>
              + 新增小类
            </button>
          ) : null}
          {activeSection === "colors" ? (
            <button className="primary-button" type="button" onClick={() => setIsColorOpen(true)}>
              + 新增颜色
            </button>
          ) : null}
          {activeSection === "items" ? (
            <button className="primary-button" type="button" onClick={() => setIsMaterialOpen(true)}>
              + 新增货品
            </button>
          ) : null}
        </div>
      </div>
      {error && !isGroupOpen && !isSubtypeOpen && !isColorOpen && !isMaterialOpen && !targetMaterial && !imageTargetMaterial && !detailMaterial ? (
        <p className="error-text panel-error">{error}</p>
      ) : null}

      {activeSection === "groups" ? (
        <DataTable
          rows={groups}
          emptyText="还没有大类。先新增大类。"
          exportFileName="材料大类"
          columns={[
            { header: "代号", render: (row) => <strong>{row.code}</strong>, exportValue: (row) => row.code },
            { header: "名称", render: (row) => row.name, exportValue: (row) => row.name },
            {
              header: "小类数",
              render: (row) => subtypes.filter((item) => item.groupId === row.id).length,
              exportValue: (row) => subtypes.filter((item) => item.groupId === row.id).length
            },
            {
              header: "货品数",
              render: (row) => data.materials.filter((item) => item.groupId === row.id).length,
              exportValue: (row) => data.materials.filter((item) => item.groupId === row.id).length
            },
            {
              header: "操作",
              render: (row) => (
                <button className="text-button" type="button" onClick={() => handleDeleteGroup(row)} aria-label={`删除${row.name}`}>
                  删除
                </button>
              )
            }
          ]}
        />
      ) : null}

      {activeSection === "subtypes" ? (
        <DataTable
          rows={filteredSubtypes}
          emptyText="还没有小类。先新增小类。"
          exportFileName="材料小类"
          columns={[
            {
              header: "所属大类",
              render: (row) => groups.find((item) => item.id === row.groupId)?.name ?? "-",
              exportValue: (row) => groups.find((item) => item.id === row.groupId)?.name ?? ""
            },
            { header: "代号", render: (row) => <strong>{row.code}</strong>, exportValue: (row) => row.code },
            { header: "名称", render: (row) => row.name, exportValue: (row) => row.name },
            {
              header: "货品数",
              render: (row) => data.materials.filter((item) => item.subtypeId === row.id).length,
              exportValue: (row) => data.materials.filter((item) => item.subtypeId === row.id).length
            },
            {
              header: "操作",
              render: (row) => (
                <button className="text-button" type="button" onClick={() => handleDeleteSubtype(row)} aria-label={`删除${row.name}`}>
                  删除
                </button>
              )
            }
          ]}
        />
      ) : null}

      {activeSection === "colors" ? (
        <DataTable
          rows={colors}
          emptyText="还没有颜色。"
          exportFileName="颜色目录"
          columns={[
            { header: "代号", render: (row) => <strong>{row.code}</strong>, exportValue: (row) => row.code },
            { header: "名称", render: (row) => row.name, exportValue: (row) => row.name },
            {
              header: "货品数",
              render: (row) => data.materials.filter((item) => item.colorId === row.id).length,
              exportValue: (row) => data.materials.filter((item) => item.colorId === row.id).length
            },
            {
              header: "操作",
              render: (row) => (
                <button className="text-button" type="button" onClick={() => handleDeleteColor(row)} aria-label={`删除${row.name}`}>
                  删除
                </button>
              )
            }
          ]}
        />
      ) : null}

      {activeSection === "items" ? (
        <DataTable
          rows={filteredMaterials}
          emptyText={showInactive ? "没有停用货品。" : "还没有在用货品。点右上角新增货品录入。"}
          exportFileName={showInactive ? "停用货品" : "货品目录"}
          columns={[
            {
              header: "图片",
              render: (row) => (
                <button
                  aria-label={`修改${row.name}图片`}
                  className="image-edit-button"
                  title="修改图片"
                  type="button"
                  onClick={() => openImageEditor(row)}
                >
                  <Thumb src={row.imageDataUrl} />
                </button>
              ),
              exportValue: () => ""
            },
            {
              header: "货品名称",
              render: (row) => (
                <button className="text-button material-name-button" type="button" onClick={() => openMaterialDetail(row)}>
                  <strong>{row.name}</strong>
                </button>
              ),
              exportValue: (row) => row.name
            },
            {
              header: "大类",
              render: (row) => groups.find((item) => item.id === row.groupId)?.name ?? "-",
              exportValue: (row) => groups.find((item) => item.id === row.groupId)?.name ?? ""
            },
            {
              header: "小类",
              render: (row) => (subtypes.find((item) => item.id === row.subtypeId)?.name ?? row.subtype) || "-",
              exportValue: (row) => (subtypes.find((item) => item.id === row.subtypeId)?.name ?? row.subtype) ?? ""
            },
            {
              header: "颜色",
              render: (row) => getColorById(data, row.colorId)?.name ?? "-",
              exportValue: (row) => getColorById(data, row.colorId)?.name ?? ""
            },
            {
              header: "总库存",
              render: (row) => getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0),
              exportValue: (row) => getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0)
            },
            {
              header: "库存成本",
              render: (row) => `¥${getStocks(data, row.id).reduce((sum, stock) => sum + stock.remainingTotalCost, 0).toFixed(2)}`,
              exportValue: (row) => getStocks(data, row.id).reduce((sum, stock) => sum + stock.remainingTotalCost, 0).toFixed(2)
            },
            {
              header: "状态",
              render: (row) => {
                if (!(row.isActive ?? true)) {
                  return <span className="status muted-status">已停用</span>;
                }
                const quantity = getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0);
                return quantity <= row.lowStockThreshold ? <span className="status danger">低库存</span> : <span className="status">正常</span>;
              },
              exportValue: (row) => {
                if (!(row.isActive ?? true)) {
                  return "已停用";
                }
                const quantity = getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0);
                return quantity <= row.lowStockThreshold ? "低库存" : "正常";
              }
            },
            {
              header: "操作",
              render: (row) => (
                <button className="text-button" type="button" onClick={() => setStatusTargetId(row.id)}>
                  {row.isActive ?? true ? "停用" : "恢复"}
                </button>
              )
            }
          ]}
        />
      ) : null}

      <Modal title="新增大类" isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)}>
        <form className="form-grid" onSubmit={handleCreateGroup}>
          <FormField label="大类代号">
            <input value={groupCode} onChange={(event) => setGroupCode(event.target.value)} />
          </FormField>
          <FormField label="大类名称">
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存大类
          </button>
        </form>
      </Modal>

      <Modal title="新增小类" isOpen={isSubtypeOpen} onClose={() => setIsSubtypeOpen(false)}>
        <form className="form-grid" onSubmit={handleCreateSubtype}>
          <FormField label="所属大类">
            <select value={subtypeGroupId} onChange={(event) => setSubtypeGroupId(event.target.value)}>
              <option value="">请选择</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} / {group.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="小类代号">
            <input value={subtypeCode} onChange={(event) => setSubtypeCode(event.target.value)} />
          </FormField>
          <FormField label="小类名称">
            <input value={subtypeName} onChange={(event) => setSubtypeName(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存小类
          </button>
        </form>
      </Modal>

      <Modal title="新增颜色" isOpen={isColorOpen} onClose={() => setIsColorOpen(false)}>
        <form className="form-grid" onSubmit={handleCreateColor}>
          <FormField label="颜色代号">
            <input value={colorCode} onChange={(event) => setColorCode(event.target.value)} />
          </FormField>
          <FormField label="颜色名称">
            <input value={colorName} onChange={(event) => setColorName(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存颜色
          </button>
        </form>
      </Modal>

      <Modal title="新增货品" isOpen={isMaterialOpen} onClose={() => setIsMaterialOpen(false)}>
        <form className="form-grid" onSubmit={handleCreateMaterial}>
          <FormField label="选择大类">
            <select value={materialGroupId} onChange={(event) => setMaterialGroupId(event.target.value)}>
              <option value="">请选择</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} / {group.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="选择小类">
            <select value={materialSubtypeId} onChange={(event) => setMaterialSubtypeId(event.target.value)}>
              <option value="">请选择</option>
              {materialSubtypeOptions.map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.code} / {subtype.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="选择颜色">
            <select value={materialColorId} onChange={(event) => setMaterialColorId(event.target.value)}>
              <option value="">请选择</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.code} / {color.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="货品名称">
            <input value={materialName} onChange={(event) => setMaterialName(event.target.value)} />
          </FormField>
          <FormField label="低库存提醒">
            <input min="0" type="number" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(Number(event.target.value))} />
          </FormField>
          <FormField label="图片">
            <ImageInput value={imageDataUrl} onChange={setImageDataUrl} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存货品
          </button>
        </form>
      </Modal>

      <Modal title="修改货品图片" description={imageTargetMaterial ? formatMaterialName(imageTargetMaterial, data) : ""} isOpen={Boolean(imageTargetMaterial)} onClose={() => setImageTargetId("")}>
        <form className="form-grid" onSubmit={handleImageSubmit}>
          <FormField label="图片">
            <ImageInput value={editingImageDataUrl} onChange={setEditingImageDataUrl} />
          </FormField>
          <div className="inline-actions">
            <button className="primary-button" type="submit">
              保存图片
            </button>
            <button className="secondary-button" type="button" onClick={() => setEditingImageDataUrl("")}>
              清空图片
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="货品详情" description={detailMaterial ? formatMaterialName(detailMaterial, data) : ""} isOpen={Boolean(detailMaterial)} onClose={closeMaterialDetail}>
        <form className="form-grid" onSubmit={handleDetailSave}>
          <FormField label="选择大类">
            <select disabled={!detailEditMode} value={detailGroupId} onChange={(event) => setDetailGroupId(event.target.value)}>
              <option value="">请选择</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} / {group.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="选择小类">
            <select disabled={!detailEditMode} value={detailSubtypeId} onChange={(event) => setDetailSubtypeId(event.target.value)}>
              <option value="">请选择</option>
              {detailSubtypeOptions.map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.code} / {subtype.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="选择颜色">
            <select disabled={!detailEditMode} value={detailColorId} onChange={(event) => setDetailColorId(event.target.value)}>
              <option value="">请选择</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.code} / {color.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="货品名称">
            <input disabled value={detailName} readOnly />
          </FormField>
          <FormField label="低库存提醒">
            <input
              disabled={!detailEditMode}
              min="0"
              type="number"
              value={detailLowStockThreshold}
              onChange={(event) => setDetailLowStockThreshold(Number(event.target.value))}
            />
          </FormField>
          <FormField label="图片">
            {detailEditMode ? <ImageInput value={detailImageDataUrl} onChange={setDetailImageDataUrl} /> : <Thumb src={detailImageDataUrl} />}
          </FormField>
          <FormField label="备注">
            <textarea disabled={!detailEditMode} value={detailNotes} onChange={(event) => setDetailNotes(event.target.value)} />
          </FormField>
          <FormField label="状态">
            <input disabled value={detailMaterial && (detailMaterial.isActive ?? true) ? "在用" : "停用"} readOnly />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="inline-actions">
            {detailEditMode ? (
              <button className="primary-button" type="submit">
                保存
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={() => setDetailEditMode(true)}>
                修改
              </button>
            )}
            <button className="secondary-button" type="button" onClick={closeMaterialDetail}>
              关闭
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={targetMaterial && (targetMaterial.isActive ?? true) ? "停用货品" : "恢复货品"}
        description={targetMaterial ? formatMaterialName(targetMaterial, data) : ""}
        isOpen={Boolean(targetMaterial)}
        onClose={() => setStatusTargetId("")}
      >
        <form className="form-grid" onSubmit={handleStatusSubmit}>
          <FormField label="操作员工">
            <input list="material-employee-list" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} />
          </FormField>
          <datalist id="material-employee-list">
            {(data.employees ?? []).map((employee) => (
              <option key={employee.id} value={employee.name} />
            ))}
          </datalist>
          <FormField label="原因">
            <textarea value={statusReason} onChange={(event) => setStatusReason(event.target.value)} />
          </FormField>
          <FormField label="操作密码">
            <input type="password" value={statusPassword} onChange={(event) => setStatusPassword(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="inline-actions">
            <button className="primary-button" type="submit">
              确认
            </button>
            <button className="secondary-button" type="button" onClick={() => setStatusTargetId("")}>
              取消
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function Thumb({ src }: { src: string }) {
  return src ? <img className="table-thumb" src={src} alt="" /> : <span className="table-thumb image-placeholder tiny-placeholder">无</span>;
}

function getStocks(data: AppData, materialId: string) {
  return data.materialStocks.filter((stock) => stock.materialId === materialId);
}

function hasDuplicateCode(items: Array<{ code: string }>, code: string) {
  const normalizedCode = code.trim().toLowerCase();
  return items.some((item) => item.code.trim().toLowerCase() === normalizedCode);
}
