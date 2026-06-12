import type { AppData, Material, MaterialColor, MaterialGroup, MaterialSubtype } from "./types";

export function getMaterialGroups(data: AppData): MaterialGroup[] {
  return data.materialGroups ?? [];
}

export function getMaterialSubtypes(data: AppData): MaterialSubtype[] {
  return data.materialSubtypes ?? [];
}

export function getMaterialColors(data: AppData): MaterialColor[] {
  return data.materialColors ?? [];
}

export function getGroupById(data: AppData, groupId?: string): MaterialGroup | undefined {
  if (!groupId) {
    return undefined;
  }
  return getMaterialGroups(data).find((item) => item.id === groupId);
}

export function getSubtypeById(data: AppData, subtypeId?: string): MaterialSubtype | undefined {
  if (!subtypeId) {
    return undefined;
  }
  return getMaterialSubtypes(data).find((item) => item.id === subtypeId);
}

export function getColorById(data: AppData, colorId?: string): MaterialColor | undefined {
  if (!colorId) {
    return undefined;
  }
  return getMaterialColors(data).find((item) => item.id === colorId);
}

export function getSubtypesForGroup(data: AppData, groupId?: string): MaterialSubtype[] {
  if (!groupId) {
    return [];
  }
  return getMaterialSubtypes(data).filter((item) => item.groupId === groupId);
}

export function formatMaterialName(material: Material | undefined, data: AppData): string {
  if (!material) {
    return "已删除材料";
  }

  const group = getGroupById(data, material.groupId);
  const subtype = getSubtypeById(data, material.subtypeId);
  const color = getColorById(data, material.colorId);
  const legacySubtype = material.subtype?.trim();

  if (!group && !subtype && !color) {
    return [material.name, legacySubtype].filter(Boolean).join(" / ");
  }

  return [group?.name, subtype?.name ?? legacySubtype, color?.name, material.name]
    .filter(Boolean)
    .filter((part, index, list) => list.indexOf(part) === index)
    .join(" / ");
}

export function formatMaterialShortName(material: Material | undefined, data: AppData): string {
  if (!material) {
    return "未知材料";
  }

  const group = getGroupById(data, material.groupId);
  const subtype = getSubtypeById(data, material.subtypeId);
  const color = getColorById(data, material.colorId);
  const legacySubtype = material.subtype?.trim();

  if (!group && !subtype && !color) {
    return [material.name, legacySubtype].filter(Boolean).join(" / ");
  }

  return [group?.name, subtype?.name ?? legacySubtype, color?.name].filter(Boolean).join(" / ") || material.name;
}
