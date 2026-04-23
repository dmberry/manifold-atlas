/**
 * User-defined Negation Batteries.
 *
 * Users can save their own named sets of statements so they appear in
 * the Negation Battery dropdown alongside the built-in batteries and
 * are addressable by name from protocol steps (`preset: ...`). Storage
 * is a single JSON blob in localStorage; schema changes would be
 * additive.
 */

const STORAGE_KEY = "manifold-atlas.user-batteries";

export type UserBatteries = Record<string, string[]>;

function safeRead(): UserBatteries {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: UserBatteries = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k !== "string") continue;
      if (!Array.isArray(v)) continue;
      const statements = (v as unknown[]).filter(
        (s): s is string => typeof s === "string" && s.length > 0
      );
      if (statements.length > 0) out[k] = statements;
    }
    return out;
  } catch {
    return {};
  }
}

function safeWrite(batteries: UserBatteries): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batteries));
  } catch {
    // Storage disabled or quota; silently drop.
  }
}

/** Load the user's batteries map. Safe on SSR; returns {}. */
export function loadUserBatteries(): UserBatteries {
  return safeRead();
}

/** Save (or overwrite) a named battery. Returns the stored statements. */
export function saveUserBattery(name: string, statements: string[]): string[] {
  const clean = statements.map(s => s.trim()).filter(s => s.length > 0);
  if (clean.length === 0) throw new Error("A battery must contain at least one statement.");
  const trimmedName = name.trim();
  if (trimmedName.length === 0) throw new Error("Battery name cannot be empty.");
  const all = safeRead();
  all[trimmedName] = clean;
  safeWrite(all);
  return clean;
}

/** Remove a named battery. No-op if missing. */
export function removeUserBattery(name: string): void {
  const all = safeRead();
  if (name in all) {
    delete all[name];
    safeWrite(all);
  }
}

/** Look up a user battery by name. Returns null if not found. */
export function resolveUserBattery(name: string | undefined): string[] | null {
  if (!name) return null;
  const all = safeRead();
  return all[name] ?? null;
}
