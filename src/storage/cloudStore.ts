import { createClient } from "@supabase/supabase-js";
import type { AppData } from "../domain/types";
import { createEmptyData } from "./store";

export interface CloudConfig {
  url: string;
  anonKey: string;
  table: string;
  recordId: string;
}

interface CloudRow {
  id: string;
  payload: AppData;
  updated_at?: string;
}

export function isCloudSyncEnabled(): boolean {
  return getCloudConfig() !== null;
}

export function getCloudConfig(): CloudConfig | null {
  if (import.meta.env.VITE_CLOUD_SYNC_ENABLED !== "true") {
    return null;
  }

  const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !anonKey) {
    return null;
  }

  return {
    url: normalizeSupabaseUrl(rawUrl),
    anonKey,
    table: import.meta.env.VITE_SUPABASE_TABLE?.trim() || "app_state",
    recordId: import.meta.env.VITE_SUPABASE_RECORD_ID?.trim() || "shared"
  };
}

export function mergeRemoteData(payload: Partial<AppData> | null | undefined): AppData {
  return {
    ...createEmptyData(),
    ...(payload ?? {})
  };
}

export async function loadCloudData(): Promise<AppData | null> {
  const config = getCloudConfig();

  if (!config) {
    return null;
  }

  const client = createClient(config.url, config.anonKey);
  const { data, error } = await client
    .from(config.table)
    .select("payload")
    .eq("id", config.recordId)
    .maybeSingle<{ payload: AppData }>();

  if (error) {
    throw error;
  }

  return data ? mergeRemoteData(data.payload) : null;
}

export async function saveCloudData(payload: AppData): Promise<void> {
  const config = getCloudConfig();

  if (!config) {
    return;
  }

  const client = createClient(config.url, config.anonKey);
  const row: CloudRow = {
    id: config.recordId,
    payload
  };

  const { error } = await client.from(config.table).upsert(row).select("id");

  if (error) {
    throw error;
  }
}

function normalizeSupabaseUrl(value: string): string {
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
