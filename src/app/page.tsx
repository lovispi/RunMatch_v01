"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=30`);
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

  // Carica "top shoes" all'apertura (q vuota)
  useEffect(() => {
    runSearch("");
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Shoe Search</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Cerca per brand, model, category, terrain, use type. (Se vuoto: top per display_score)
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Es: Nike, Pegasus, trail, stability..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => runSearch(q)}
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
