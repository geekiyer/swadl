import { useOnboardingStore, useUnitStore, useOfflineQueue, useAuthStore } from "../../lib/store";
import { ozToMl, mlToOz, displayVolume, parseInputToOz } from "../../lib/store";
import type { QueuedLogEntry } from "../../lib/store";

// Reset all stores between tests
beforeEach(() => {
  useOnboardingStore.setState({
    babyName: "",
    dateOfBirth: "",
    feedingMethod: "",
    partnerEmail: "",
    careMode: "together",
  });
  useUnitStore.setState({ unit: "oz" });
  useOfflineQueue.setState({ queue: [] });
  useAuthStore.setState({ session: null });
});

// ============================================================
// Unit Conversion Helpers
// ============================================================

describe("ozToMl", () => {
  it("converts 1 oz to ~29.6 ml", () => {
    expect(ozToMl(1)).toBeCloseTo(29.6, 0);
  });

  it("converts 0 oz to 0 ml", () => {
    expect(ozToMl(0)).toBe(0);
  });

  it("converts 4 oz correctly", () => {
    expect(ozToMl(4)).toBeCloseTo(118.3, 0);
  });
});

describe("mlToOz", () => {
  it("converts 29.6 ml to ~1 oz", () => {
    expect(mlToOz(29.6)).toBeCloseTo(1, 0);
  });

  it("converts 0 ml to 0 oz", () => {
    expect(mlToOz(0)).toBe(0);
  });

  it("round-trips correctly", () => {
    const original = 6;
    const ml = ozToMl(original);
    const backToOz = mlToOz(ml);
    expect(backToOz).toBeCloseTo(original, 0);
  });
});

describe("displayVolume", () => {
  it("displays oz correctly", () => {
    expect(displayVolume(4, "oz")).toBe("4 oz");
  });

  it("displays ml correctly", () => {
    const result = displayVolume(4, "ml");
    expect(result).toMatch(/ml$/);
    expect(result).toContain("118");
  });

  it("rounds to 1 decimal place", () => {
    expect(displayVolume(3.333, "oz")).toBe("3.3 oz");
  });
});

describe("parseInputToOz", () => {
  it("parses oz input as-is", () => {
    expect(parseInputToOz("4.5", "oz")).toBe(4.5);
  });

  it("converts ml input to oz", () => {
    expect(parseInputToOz("29.6", "ml")).toBeCloseTo(1, 0);
  });

  it("returns 0 for invalid input", () => {
    expect(parseInputToOz("abc", "oz")).toBe(0);
    expect(parseInputToOz("", "oz")).toBe(0);
  });
});

// ============================================================
// Onboarding Store
// ============================================================

describe("useOnboardingStore", () => {
  it("has correct initial state", () => {
    const state = useOnboardingStore.getState();
    expect(state.babyName).toBe("");
    expect(state.dateOfBirth).toBe("");
    expect(state.feedingMethod).toBe("");
    expect(state.partnerEmail).toBe("");
    expect(state.careMode).toBe("together");
  });

  it("sets baby info", () => {
    useOnboardingStore.getState().setBabyInfo("Luna", "2025-06-15", "bottle");
    const state = useOnboardingStore.getState();
    expect(state.babyName).toBe("Luna");
    expect(state.dateOfBirth).toBe("2025-06-15");
    expect(state.feedingMethod).toBe("bottle");
  });

  it("sets partner email", () => {
    useOnboardingStore.getState().setPartnerEmail("partner@test.com");
    expect(useOnboardingStore.getState().partnerEmail).toBe("partner@test.com");
  });

  it("sets care mode", () => {
    useOnboardingStore.getState().setCareMode("shifts");
    expect(useOnboardingStore.getState().careMode).toBe("shifts");

    useOnboardingStore.getState().setCareMode("nanny");
    expect(useOnboardingStore.getState().careMode).toBe("nanny");
  });

  it("resets all fields", () => {
    useOnboardingStore.getState().setBabyInfo("Luna", "2025-06-15", "bottle");
    useOnboardingStore.getState().setPartnerEmail("test@test.com");
    useOnboardingStore.getState().setCareMode("shifts");

    useOnboardingStore.getState().reset();

    const state = useOnboardingStore.getState();
    expect(state.babyName).toBe("");
    expect(state.dateOfBirth).toBe("");
    expect(state.feedingMethod).toBe("");
    expect(state.partnerEmail).toBe("");
    expect(state.careMode).toBe("together");
  });
});

// ============================================================
// Unit Store
// ============================================================

describe("useUnitStore", () => {
  it("defaults to oz", () => {
    expect(useUnitStore.getState().unit).toBe("oz");
  });

  it("toggles between oz and ml", () => {
    useUnitStore.getState().toggleUnit();
    expect(useUnitStore.getState().unit).toBe("ml");

    useUnitStore.getState().toggleUnit();
    expect(useUnitStore.getState().unit).toBe("oz");
  });
});

// ============================================================
// Auth Store
// ============================================================

describe("useAuthStore", () => {
  it("defaults to null session", () => {
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("sets and clears session", () => {
    const mockSession = { access_token: "abc", user: { id: "123" } } as any;
    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).toBe(mockSession);

    useAuthStore.getState().setSession(null);
    expect(useAuthStore.getState().session).toBeNull();
  });
});

// ============================================================
// Offline Queue
// ============================================================

describe("useOfflineQueue", () => {
  const mockEntry: QueuedLogEntry = {
    id: "entry-1",
    table: "feed_logs",
    payload: { baby_id: "baby-1", type: "bottle", amount_oz: 4 },
    createdAt: new Date().toISOString(),
  };

  it("starts with empty queue", () => {
    expect(useOfflineQueue.getState().queue).toEqual([]);
  });

  it("pushes entries to queue", () => {
    useOfflineQueue.getState().push(mockEntry);
    expect(useOfflineQueue.getState().queue).toHaveLength(1);
    expect(useOfflineQueue.getState().queue[0].id).toBe("entry-1");
  });

  it("pushes multiple entries preserving order", () => {
    const entry2: QueuedLogEntry = {
      id: "entry-2",
      table: "diaper_logs",
      payload: { baby_id: "baby-1", type: "wet" },
      createdAt: new Date().toISOString(),
    };

    useOfflineQueue.getState().push(mockEntry);
    useOfflineQueue.getState().push(entry2);

    const queue = useOfflineQueue.getState().queue;
    expect(queue).toHaveLength(2);
    expect(queue[0].id).toBe("entry-1");
    expect(queue[1].id).toBe("entry-2");
  });

  it("removes entry by id", () => {
    useOfflineQueue.getState().push(mockEntry);
    useOfflineQueue.getState().push({
      ...mockEntry,
      id: "entry-2",
      table: "diaper_logs",
    });

    useOfflineQueue.getState().remove("entry-1");

    const queue = useOfflineQueue.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe("entry-2");
  });

  it("clears all entries", () => {
    useOfflineQueue.getState().push(mockEntry);
    useOfflineQueue.getState().push({ ...mockEntry, id: "entry-2" });

    useOfflineQueue.getState().clear();
    expect(useOfflineQueue.getState().queue).toEqual([]);
  });

  it("remove is a no-op for non-existent id", () => {
    useOfflineQueue.getState().push(mockEntry);
    useOfflineQueue.getState().remove("non-existent");
    expect(useOfflineQueue.getState().queue).toHaveLength(1);
  });
});
