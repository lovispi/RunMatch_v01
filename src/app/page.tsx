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

export default function Page() {
  const [q, setQ] = useState("");

  // filtri dropdown
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");
  const [plate, setPlate] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState("display_desc");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // ✅ auto-search con debounce (450ms) su query + filtri
  useEffect(() => {
    const t = setTimeout(() => runSearch(url), 450);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Shoe Search</h1>

      {/* INPUT QUERY */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Es: Nike, Pegasus, trail..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
        />

        {/* il bottone resta, ma non è più necessario */}
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
      </div>

      {/* QUI TU CI METTI I TUOI DROPDOWN ESISTENTI:
          basta che al loro onChange setti:
          setBrand / setCategory / setTerrain / setUseType / setPlate / setSort
      */}

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
            style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12, display: "grid", gap: 6 }}
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
