/**
 * usePersistedState — Saves and restores user data from localStorage.
 * 
 * Usage:
 *   const { save, load, clear } = usePersistedState();
 *   // On mount: const saved = load(); if (saved) { setAge(saved.age); ... }
 *   // On change: save({ age, monthlyIncome, ... });
 *   // On reset: clear();
 */

const STORAGE_KEY = 'manu_pro_user_data';
const STORAGE_VERSION = 1;

/**
 * Collects all persistable state into a plain object.
 * Called by the component to snapshot current state.
 */
export function saveState(state) {
  try {
    const data = { _v: STORAGE_VERSION, _ts: Date.now(), ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage full or unavailable — fail silently
    console.warn('MaNu: Could not save state', e);
  }
}

/**
 * Loads persisted state from localStorage.
 * Returns the saved object or null if nothing saved / version mismatch.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data._v !== STORAGE_VERSION) return null;
    return data;
  } catch (e) {
    console.warn('MaNu: Could not load state', e);
    return null;
  }
}

/**
 * Clears all persisted state.
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // fail silently
  }
}
