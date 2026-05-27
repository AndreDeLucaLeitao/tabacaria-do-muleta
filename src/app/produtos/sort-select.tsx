"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_FIELDS, type SortField, type SortDir } from "./sort";

export function SortSelect({
  currentField,
  currentDir,
}: {
  currentField: SortField;
  currentDir: SortDir;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function update(field: SortField, dir: SortDir) {
    const params = new URLSearchParams(search.toString());
    params.set("sort", field);
    params.set("dir", dir);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-cream-300">Ordenar</span>
      <select
        value={currentField}
        onChange={(e) => update(e.target.value as SortField, currentDir)}
        className="!w-auto !py-2 !pr-8 text-sm"
      >
        {SORT_FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => update(currentField, currentDir === "asc" ? "desc" : "asc")}
        aria-label={
          currentDir === "asc"
            ? "Ordem crescente — clique pra inverter"
            : "Ordem decrescente — clique pra inverter"
        }
        title={currentDir === "asc" ? "Crescente" : "Decrescente"}
        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-base text-cream-100 transition hover:border-gold-500/50 hover:text-gold-500"
      >
        <span aria-hidden className={`transition ${currentDir === "asc" ? "" : "rotate-180"}`}>
          ↑
        </span>
      </button>
    </div>
  );
}
