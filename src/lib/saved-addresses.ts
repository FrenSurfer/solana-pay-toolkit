const STORAGE_KEY = "solana-pay-saved-addresses";
const MAX_SAVED = 5;

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
}

function getStored(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is SavedAddress =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as SavedAddress).id === "string" &&
          typeof (x as SavedAddress).label === "string" &&
          typeof (x as SavedAddress).address === "string" &&
          (x as SavedAddress).address.length >= 32
      )
      .slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

function setStored(items: SavedAddress[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_SAVED)));
  } catch {
    // ignore
  }
}

export function getSavedAddresses(): SavedAddress[] {
  return getStored();
}

export function addSavedAddress(label: string, address: string): SavedAddress[] {
  const trimmed = address.trim();
  if (trimmed.length < 32) return getStored();
  const list = getStored();
  const existing = list.find((a) => a.address === trimmed);
  if (existing) {
    const next = list.map((a) =>
      a.id === existing.id ? { ...a, label: label.trim() || a.label } : a
    );
    setStored(next);
    return next;
  }
  const newItem: SavedAddress = {
    id: crypto.randomUUID(),
    label: label.trim() || "Saved address",
    address: trimmed,
  };
  const next = [newItem, ...list].slice(0, MAX_SAVED);
  setStored(next);
  return next;
}

export function removeSavedAddress(id: string): SavedAddress[] {
  const next = getStored().filter((a) => a.id !== id);
  setStored(next);
  return next;
}
