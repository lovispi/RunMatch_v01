"use client";

import { useEffect, useMemo, useState } from "react";
import MatrixChart from "@/components/MatrixChart";

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
  runrepeat_url: string | null;
  speed_score: number | null;
  cushion_score: number | null;
  stability_score: number | null;
};

type Facets = {
  brands: string[];
  categories: string[];
  terrains: string[];
  use_types: string[];
};

type SortKey = "display_desc" | "proxy_desc" | "weight_asc" | "drop_asc";

function distanceToUser(s: Shoe, ux: number, uy: number) {
  if (typeof s.cushion_score !== "number" || typeof s.speed_score !== "number") {
    return Number.POSITIVE_INFINITY;
  }
  const dx = s.cushion_score - ux;
  const dy = s.speed_score - uy;
  return Math.sqrt(dx * dx + dy * dy);
}

function safeGetSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export default function Page() {
  // ✅ punto utente (mock per ora)
  const userX = 6.5;
  const userY = 7.2;

  // ✅ stato UI + filtri
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "matrix">("list");

  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");
  const [plate, setPlate] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState<SortKey>("display_desc");

  // facets dropdown
  const [facets, setFacets] = useState<Facets>({
    brands: [],
    categories: [],
    terrains: [],
    use_types: [],
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ (STEP 4) Leggi querystring SOLO lato client all’avvio
  useEffect(() => {
    const sp = safeGetSearchParams();

    setQ(sp.get("q") || "");
    setView(sp.get("view") === "matrix" ? "matrix" : "list");

    setBrand(sp.get("brand") || "");
    setCategory(sp.get("category") || "");
    setTerrain(sp.get("terrain") || "");
    setUseType(sp.get("use_type") || "");

    const p = sp.get("plate");
    setPlate(p === "true" ? "true" : p === "false" ? "false" : "");

    const s = sp.get("sort") as SortKey | null;
    setSort(s && ["display_desc", "proxy_desc", "weight_asc", "drop_asc"].includes(s) ? s : "display_desc");
  }, []);

  // ✅ (STEP 4) Sync stato -> URL (SOLO client) con debounce
  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = setTimeout(() => {
      const p = new URLSearchParams();

      if (q.trim()) p.set("q", q.trim());
      if (view) p.set("view", view);

      if (brand) p.set("brand", brand);
      if (category) p.set("category", category);
      if (terrain) p.set("terrain", terrain);
      if (useType) p.set("use_type", useType);
      if (plate) p.set("plate", plate);
      if (sort) p.set("sort", sort);

      const qs = p.toString();
      const newUrl = qs ? `/?${qs}` : `/`;
      window.history.replaceState({}, "", newUrl);
    }, 250);

    return () => clearTimeout(t);
  }, [q, view, brand, category, terrain, useType, plate, sort]);

  // ✅ carica facets all’avvio
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
        console.warn("Filters error:", e);
      }
    })();
  }, []);

  // costruisci URL di ricerca
  const url = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "30");

    if (q.trim()) p.set("q", q.trim());
    if (brand) p.set("brand", brand);
    if (category) p.set("category", category);
    if (terrain) p.set("terrain", terrain);
    if (useType) p.set("use_type", useType);
    if (plate) p.set("plate", plate);
    if (sort) p.set("sort", sort);

    return `/api/search?${p.toString()}`;
  }, [q, brand, category, terrain, useType, plate, sort]);

  async function runSearch(finalUrl: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(finalUrl);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore API");
      setResults(json.results || []);
    } catch (e: any) {
      setError(e?.message || "Errore sconosciuto");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // auto-search con debounce
  useEffect(() => {
    const t = setTimeout(() => runSearch(url), 450);
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
    setView("list");
  }

  // ✅ (STEP 3) Top picks (distanza al punto utente)
  const topPicks = useMemo(() => {
    return [...results]
      .sort((a, b) => distanceToUser(a, userX, userY) - distanceToUser(b, userX, userY))
      .slice(0, 3);
  }, [results]);

  return (
    <main
  style={{
  padding: 14,
  borderRadius: 14,
  background: "linear-gradient(135deg, #4f5cff, #7b4bff)",
  color: "white",
  boxShadow: "0 8px 24px rgba(79,92,255,0.35)",
}}
>
  <div
    style={{
      maxWidth: 1100,
      margin: "0 auto",
      background: "white",
      borderRadius: 20,
      padding: 24,
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    }}
  >

      <h1 style={{ fontSize: 28, marginBottom: 4, fontWeight: 800 }}>
  RunMatch
</h1>
<p style={{ marginTop: 0, opacity: 0.75 }}>
  Trova le scarpe perfette per il tuo stile di corsa
</p>


      {/* QUERY + BOTTONI */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Es: Nike, Pegasus, trail..."
          style={{
            flex: "1 1 320px",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={() => runSearch(url)}
          style={{
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: view === "list" ? "#4f5cff" : "#eef0ff",
  color: view === "list" ? "white" : "#4f5cff",
  fontWeight: 600,
  cursor: "pointer",
}}
          disabled={loading}
        >
          {loading ? "..." : "Cerca"}
        </button>

        <button
          onClick={resetFilters}
          style={{
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: view === "list" ? "#4f5cff" : "#eef0ff",
  color: view === "list" ? "white" : "#4f5cff",
  fontWeight: 600,
  cursor: "pointer",
}}
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {/* Toggle vista */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setView("list")}
          style={{
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: view === "list" ? "#4f5cff" : "#eef0ff",
  color: view === "list" ? "white" : "#4f5cff",
  fontWeight: 600,
  cursor: "pointer",
}}
        >
          Lista
        </button>
        <button
          onClick={() => setView("matrix")}
          style={{
  borderRadius: 16,
  padding: 16,
  display: "grid",
  gap: 8,
  background: "white",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
}}
        >
          Matrice
        </button>
        style={{
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: view === "list" ? "#4f5cff" : "#eef0ff",
  color: view === "list" ? "white" : "#4f5cff",
  fontWeight: 600,
  cursor: "pointer",
}}
      </div>

      {/* DROPDOWN FILTRI */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <FilterSelect label="Brand" value={brand} onChange={setBrand} options={facets.brands} placeholder="Tutti" />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={facets.categories} placeholder="Tutte" />
        <FilterSelect label="Terrain" value={terrain} onChange={setTerrain} options={facets.terrains} placeholder="Tutti" />
        <FilterSelect label="Use type" value={useType} onChange={setUseType} options={facets.use_types} placeholder="Tutti" />

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13, opacity: 0.8 }}>Plate</label>
          <select
            value={plate}
            onChange={(e) => setPlate(e.target.value as any)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
          >
            <option value="">Tutte</option>
            <option value="true">Solo con piastra</option>
            <option value="false">Solo senza piastra</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13, opacity: 0.8 }}>Ordina per</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
          >
            <option value="display_desc">display_score ↓</option>
            <option value="proxy_desc">proxy_score ↓</option>
            <option value="weight_asc">peso ↑</option>
            <option value="drop_asc">drop ↑</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Errore:</b> {error}
        </div>
      )}

      <div style={{ marginTop: 18, opacity: 0.8 }}>
        {loading ? "Caricamento..." : <>Risultati: <b>{results.length}</b></>}
      </div>

      {/* Top picks */}
      {view === "matrix" && topPicks.length > 0 && (
        <div style={{ marginTop: 14, marginBottom: 12 }}>
          <h3 style={{ margin: "6px 0 10px 0" }}>Top picks per te</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {topPicks.map((s, i) => (
              <div key={(s.id ?? i).toString()} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 10 }}>
                <b>
                  {s.brand} {s.model}
                </b>{" "}
                <span style={{ opacity: 0.75 }}>
                  — cushion {s.cushion_score ?? "-"}, speed {s.speed_score ?? "-"}
                </span>
                {s.runrepeat_url && (
                  <div style={{ marginTop: 4 }}>
                    <a href={s.runrepeat_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                      RunRepeat →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTA / MATRICE */}
      <div style={{ marginTop: 12 }}>
        {view === "matrix" ? (
          <MatrixChart data={results as any} userPoint={{ x: userX, y: userY }} />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {results.map((s, idx) => (
              <div
                key={(s.id ?? idx).toString()}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {(s.brand ?? "").toUpperCase()} — {s.model}
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 14 }}>
                      {s.category} · {s.terrain} · {s.use_type} {s.year ? `· ${s.year}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>display_score</div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{s.display_score ?? "-"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>
                    proxy_score: <b>{s.proxy_score ?? "-"}</b>
                  </div>
                  {s.runrepeat_url && (
                    <a href={s.runrepeat_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                      RunRepeat →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterSelect(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const { label, value, onChange, options, placeholder } = props;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 13, opacity: 0.8 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "white",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </main> 
);
}
