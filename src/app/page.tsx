"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
const MatrixChart = dynamic(() => import("@/components/MatrixChart"), { ssr: false });

/* =========================
   Types
========================= */
type Shoe = {
  id?: string | number;
  brand: string | null;
  model: string | null;
  year: number | null;
  category: string | null;
  terrain: string | null;
  use_type: string | null;
  plate?: boolean | null;
  weight_g?: number | null;
  drop_mm?: number | null;
  stack_mm?: number | null;
  display_score: number | null;
  proxy_score: number | null;
  speed_score: number | null;
  cushion_score: number | null;
  stability_score: number | null;
  runrepeat_url: string | null;
};

type Facets = {
  brands: string[];
  categories: string[];
  terrains: string[];
  use_types: string[];
};

/* =========================
   Page
========================= */
export default function Page() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "matrix">("list");

  // filters
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");
  const [plate, setPlate] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState<
    "display_desc" | "proxy_desc" | "weight_asc" | "drop_asc"
  >("display_desc");

  // facets
  const [facets, setFacets] = useState<Facets>({
    brands: [],
    categories: [],
    terrains: [],
    use_types: [],
  });

  const [results, setResults] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Load filters
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/filters");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Errore filters");
        setFacets({
          brands: json.brands || [],
          categories: json.categories || [],
          terrains: json.terrains || [],
          use_types: json.use_types || [],
        });
      } catch (e) {
        console.warn("Filters error", e);
      }
    })();
  }, []);

  /* =========================
     Build search URL
  ========================= */
  const url = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "30");

    if (q) p.set("q", q);
    if (brand) p.set("brand", brand);
    if (category) p.set("category", category);
    if (terrain) p.set("terrain", terrain);
    if (useType) p.set("use_type", useType);
    if (plate) p.set("plate", plate);
    if (sort) p.set("sort", sort);

    return `/api/search?${p.toString()}`;
  }, [q, brand, category, terrain, useType, plate, sort]);

  /* =========================
     Search
  ========================= */
  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore API");
      setResults(json.results || []);
    } catch (e: any) {
      setError(e.message || "Errore sconosciuto");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // auto-search debounce
  useEffect(() => {
    const t = setTimeout(runSearch, 400);
    return () => clearTimeout(t);
  }, [url]);

  function resetFilters() {
    setQ("");
    setBrand("");
    setCategory("");
    setTerrain("");
    setUseType("");
    setPlate("");
    setSort("display_desc");
  }

  /* =========================
     Render
  ========================= */
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1>RunMatch</h1>
      <p style={{ opacity: 0.8 }}>
        Ricerca e confronto scarpe running · Lista / Matrice
      </p>

      {/* Search */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nike, Pegasus, trail..."
          style={{ flex: "1 1 300px", padding: 10 }}
        />
        <button onClick={runSearch} disabled={loading}>
          Cerca
        </button>
        <button onClick={resetFilters}>Reset</button>
      </div>

      {/* View toggle */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => setView("list")}>Lista</button>
        <button onClick={() => setView("matrix")}>Matrice</button>
      </div>

      {/* Filters */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <FilterSelect label="Brand" value={brand} onChange={setBrand} options={facets.brands} />
        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={facets.categories}
        />
        <FilterSelect
          label="Terrain"
          value={terrain}
          onChange={setTerrain}
          options={facets.terrains}
        />
        <FilterSelect
          label="Use type"
          value={useType}
          onChange={setUseType}
          options={facets.use_types}
        />
      </div>

      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <div style={{ marginTop: 16 }}>Risultati: {results.length}</div>

      {/* Results */}
      <div style={{ marginTop: 16 }}>
        {view === "matrix" ? (
          <MatrixChart data={results as any} />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {results.map((s, i) => (
              <div
                key={(s.id ?? i).toString()}
                style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}
              >
                <b>
                  {(s.brand ?? "").toUpperCase()} — {s.model}
                </b>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  {s.category} · {s.terrain} · {s.use_type}
                </div>
                <div>
                  display: <b>{s.display_score ?? "-"}</b> · proxy:{" "}
                  <b>{s.proxy_score ?? "-"}</b>
                </div>
                {s.runrepeat_url && (
                  <a href={s.runrepeat_url} target="_blank" rel="noreferrer">
                    RunRepeat →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================
   Filter select
========================= */
function FilterSelect(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const { label, value, onChange, options } = props;
  return (
    <div>
      <label style={{ fontSize: 13 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Tutti</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
