export const SORT_FIELDS = [
  { value: "name", label: "Nome" },
  { value: "price_cents", label: "Preço" },
] as const;

export type SortField = (typeof SORT_FIELDS)[number]["value"];
export type SortDir = "asc" | "desc";

export function parseSortField(raw?: string): SortField {
  return raw === "price_cents" ? "price_cents" : "name";
}

export function parseSortDir(raw?: string): SortDir {
  return raw === "desc" ? "desc" : "asc";
}
