"use client";

import { useEffect, useMemo, useState } from "react";

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
};

type Facets = {
  brands: string[];
  categories: string[];
  terrains: string[];
  use_types: string[];
};

export default function Page() {
  const [q, setQ] = useState("");

  // filtri dropdown
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");
  const [plate, setPlate] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState<
    "display_desc" | "proxy_desc" | "weight_asc" | "drop_asc"
  >("display_desc");

  // facets per dropdown
  const [facets, setFacets] = useState<Facets>({
    brands: [],
    categories: [],
    terrains: [],
    use_types: [],
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carica facets all’avvio
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/facets");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Errore facets");
        setFacets({
          brands: json.brands || [],
          categories: json.categories || [],
          terrains: json.terrains || [],
          use_types: json.use_types || [],
        });
      } catch (e) {
        // Non blocchiamo la pagina se facets fallisce
        console.warn("Facets error:", e);
      }
    })();
  }, []);

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
      setError(e.message || "Errore sconosciuto");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ auto-search con debounce
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
  }

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Shoe Search</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Cerca per brand/model + filtri. La ricerca parte automaticamente quando cambi qualcosa.
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
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
            color: "white",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "..." : "Cerca"}
        </button>

        <button
          onClick={resetFilters}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          Reset
        </button>
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
        <FilterSelect
          label="Brand"
          value={brand}
          onChange={setBrand}
          options={facets.brands}
          placeholder="Tutti"
        />

        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={facets.categories}
          placeholder="Tutte"
        />

        <FilterSelect
          label="Terrain"
          value={terrain}
          onChange={setTerrain}
          options={facets.terrains}
          placeholder="Tutti"
        />

        <FilterSelect
          label="Use type"
          value={useType}
          onChange={setUseType}
          options={facets.use_types}
          placeholder="Tutti"
        />

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13, opacity: 0.8 }}>Plate</label>
          <select
            value={plate}
            onChange={(e) => setPlate(e.target.value as any)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
            }}
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
            onChange={(e) => setSort(e.target.value as any)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
            }}
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

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
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
  );
}
