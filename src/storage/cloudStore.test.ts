import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmptyData } from "./store";
import {
  getCloudConfig,
  isCloudSyncEnabled,
  mergeRemoteData
} from "./cloudStore";

describe("cloudStore", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disables cloud sync when env vars are missing", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    expect(isCloudSyncEnabled()).toBe(false);
    expect(getCloudConfig()).toBeNull();
  });

  it("normalizes the project url from a rest endpoint", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://demo.supabase.co/rest/v1/");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "demo-key");

    expect(getCloudConfig()).toMatchObject({
      url: "https://demo.supabase.co",
      anonKey: "demo-key",
      table: "app_state",
      recordId: "shared"
    });
  });

  it("merges remote payloads with the default app shape", () => {
    expect(
      mergeRemoteData({
        materials: [{ id: "m1", name: "粉水晶", category: "crystal", lowStockThreshold: 1, imageDataUrl: "", notes: "" }]
      })
    ).toEqual({
      ...createEmptyData(),
      materials: [
        {
          id: "m1",
          name: "粉水晶",
          category: "crystal",
          lowStockThreshold: 1,
          imageDataUrl: "",
          notes: ""
        }
      ]
    });
  });
});
