/**
 * Parents Health OS
 * Offline Resilience & Local Persistence Utility (Phase 2B.1)
 *
 * Provides safe, robust client-side storage operations, handling corruption, scoping records
 * by parent profile, and tracking local modification metrics to support simulated offline states.
 */

const METADATA_KEYS = {
  LAST_SAVED: "parents_health_last_saved",
  PENDING_CHANGES: "parents_health_pending_changes"
};

/**
 * Safely reads and parses JSON from browser localStorage.
 * If the key does not exist or has corrupted data, it returns the default value without crashing.
 */
export function safeReadJSON<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[LocalPersistence] Failed to parse key "${key}". Data may be corrupted. Resetting to default.`, error);
    return defaultValue;
  }
}

/**
 * Safely writes JSON content to browser localStorage.
 * Handles exceptions, updates last-saved timestamp, and increments simulated local-only pending edits.
 */
export function safeWriteJSON<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    
    // Update local persistence synchronization metadata
    updateSyncMetadata();
    return true;
  } catch (error) {
    console.error(`[LocalPersistence] Write failed for key "${key}":`, error);
    return false;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    updateSyncMetadata();
  } catch (error) {
    console.error(`[LocalPersistence] Remove failed for key "${key}":`, error);
  }
}

/**
 * Registers a manual or custom local modification, updating the last-saved timestamp
 * and incrementing the pending local changes counter.
 */
export function registerLocalChange(): void {
  updateSyncMetadata();
}

/**
 * Private helper to update the local timestamp and modification counter.
 */
function updateSyncMetadata(): void {
  if (typeof window === "undefined") return;
  try {
    // 1. Log exact timestamp of this operation
    const nowIso = new Date().toISOString();
    localStorage.setItem(METADATA_KEYS.LAST_SAVED, nowIso);

    // 2. Increment pending local-only changes counter (sandbox simulation)
    const currentPending = Number(localStorage.getItem(METADATA_KEYS.PENDING_CHANGES)) || 0;
    localStorage.setItem(METADATA_KEYS.PENDING_CHANGES, String(currentPending + 1));
  } catch (e) {
    console.warn("[LocalPersistence] Failed to write sync metadata:", e);
  }
}

/**
 * Retrieves the timestamp of the last successful local write.
 */
export function getLastSavedTimestamp(): string {
  if (typeof window === "undefined") return "Never";
  return localStorage.getItem(METADATA_KEYS.LAST_SAVED) || "Never";
}

/**
 * Retrieves the count of unsynced changes accumulated locally in the browser sandbox.
 */
export function getPendingLocalChangesCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(METADATA_KEYS.PENDING_CHANGES)) || 0;
}

/**
 * Resets the pending local changes counter (e.g., after an export/import or a simulated sync).
 */
export function resetPendingLocalChanges(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(METADATA_KEYS.PENDING_CHANGES, "0");
  } catch (e) {}
}

/**
 * Helper to build parent-scoped keys to ensure namespace isolation.
 */
export function getParentScopedKey(baseKey: string, parentId: string): string {
  return `${baseKey}_${parentId}`;
}
