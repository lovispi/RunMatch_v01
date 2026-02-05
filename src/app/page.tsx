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

export default function Page() {
  const userX = 6.5;
  const userY = 7.2;

  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "matrix">("list");

  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [terrain, setTerrain] = useState("");
  const [useType, setUseType] = useState("");
  const [plate, setPlate] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState<SortKey>("display_desc");

  const [facets, setFacets] = useState<Facets>({
    brands: [],
    categories: [],
    terrains: [],
    use_types: [],
  });

  const [results, setResults] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((j) =>
        setFacets({
          brands: j.brands || [],
          categories: j.categories || [],
          terrains: j.terrains || [],
          use_types: j.use_types || [],
        })
      );
  }, []);

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

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(url);
      const json = await res.json();
      setResults(json.results || []);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [url]);

  const topPicks = useMemo(() => {
    return [...results]
      .sort((a, b) => distanceToUser(a, userX, userY) - distanceToUser(b, userX, userY))
      .slice(0, 3);
  }, [results]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", padding: 32 }}>
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
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>RunMatch</h1>
        <p style={{ opacity: 0.7 }}>Trova le scarpe perfette per il tuo stile di corsa</p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nike, Pegasus, trail..."
          style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 10 }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => setView("list")}>Lista</button>
          <button onClick={() => setView("matrix")}>Matrice</button>
        </div>

        {view === "matrix" && topPicks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Top picks per te</h3>
            {topPicks.map((s, i) => (
              <div key={i}>
                {s.brand} {s.model}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {view === "matrix" ? (
            <MatrixChart data={results as any} userPoint={{ x: userX, y: userY }} />
          ) : (
            results.map((s, i) => (
              <div key={i}>
                {s.brand} — {s.model}
              </div>
            ))
          )}
        </div>

        {loading && <p>Caricamento…</p>}
      </div>
    </main>
  );
}
