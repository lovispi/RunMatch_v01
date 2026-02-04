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
  display_score: number | null;
  proxy_score: number | null;
  runrepeat_url: string | null;
};

type FiltersResponse = {
  brands: string[];
  categories: string[];
  terrains: string[];
  use_types: string[];
  error?: string;
};

export default function Page() {
  // testo libero
  const [q, setQ] = useState("");

  // filtri dropdown
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");

  // opzioni dropdown
  const [filters, setFilters] = useState<FiltersResponse>({
    brands: [],
    categories: [],
    terrains: [],
    use_types: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [results, setResults] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);
    if (terrain) params.set("terrain", terrain);
    if (useType) params.set("use_type", useType);
    params.set("limit", "30");
    return params.toString();
  }, [q, brand, category, terrain, useType]);

  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?${queryString}`);
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

  async function loadFilters() {
    setLoadingFilters(true);
    try {
      const res = await fetch("/api/filters");
      const json = (await res.json()) as FiltersResponse;
      if (!res.ok) throw new Error((json as any)?.error || "Errore API filters");
      setFilters({
        brands: json.brands || [],
        categories: json.categories || [],
        terrains: json.terrains || [],
        use_types: json.use_types || [],
      });
    } catch (e: any) {
      // non blocca l'app: semplicemente niente dropdown
      setFilters({ brands: [], categories: [], terrains: [], use_types: [] });
    } finally {
      setLoadingFilters(false);
    }
  }

  function resetFilters() {
    setQ("");
    setBrand("");
    setCategory("");
    setTerrain("");
    setUseType("");
  }

  // all'apertura: carico filtri + prima ricerca (top shoes)
  useEffect(() => {
    loadFilters();
    // top shoes (nessun filtro, q vuota)
    setTimeout(() => runSearch(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Shoe Search</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Usa i filtri (dropdown) e/o testo libero. Se tutto vuoto: top per display_score.
      </p>

      {/* FILTRI */}
      <div
        style={{
          marginTop: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            disabled={loadingFilters}
          >
            <option value="">{loadingFilters ? "Brand (carico...)" : "Brand (tutti)"}</option>
            {filters.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            disabled={loadingFilters}
          >
            <option value="">{loadingFilters ? "Category (carico...)" : "Category (tutte)"}</option>
            {filters.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={terrain}
            onChange={(e) => setTerrain(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            disabled={loadingFilters}
          >
            <option value="">{loadingFilters ? "Terrain (carico...)" : "Terrain (tutti)"}</option>
            {filters.terrains.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={useType}
            onChange={(e) => setUseType(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            disabled={loadingFilters}
          >
            <option value="">{loadingFilters ? "Use type (carico...)" : "Use type (tutti)"}</option>
            {filters.use_types.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* INPUT TESTO + BOTTONI */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Testo libero (es: Pegasus, stability, 2023...)"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => runSearch()}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#111",
              color: "white",
              cursor: "pointer",
              minWidth: 110,
            }}
            disabled={loading}
          >
            {loading ? "..." : "Cerca"}
          </button>

          <button
            onClick={() => {
              resetFilters();
              // dopo reset, ricarico top shoes
              setTimeout(() => runSearch(), 0);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              minWidth: 110,
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Query attiva: <code>{`/api/search?${queryString}`}</code>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Errore:</b> {error}
        </div>
      )}

      <div style={{ marginTop: 18, opacity: 0.8 }}>
        Risultati: <b>{results.length}</b>
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
