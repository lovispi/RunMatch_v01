"use client";

import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  daily: "#4f83ff",
  trainer: "#4f83ff",
  stability: "#5a6cff",
  max_cushion: "#6a5cff",
  speed: "#7b4bff",
  race: "#8b3dff",
  trail: "#6b4c8a",
  default: "#7a7a7a",
};

type Shoe = {
  id?: string | number;
  brand: string | null;
  model: string | null;
  category: string | null;
  terrain: string | null;
  use_type: string | null;
  speed_score: number | null;
  cushion_score: number | null;
  stability_score: number | null;
  display_score: number | null;
  proxy_score: number | null;
  weight_g: number | null;
  runrepeat_url: string | null;
};

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function MatrixChart({ data }: { data: Shoe[] }) {
  // punti validi solo se hanno X e Y
  const points = (data || [])
    .map((s, idx) => ({
      ...s,
      _x: toNum(s.cushion_score),
      _y: toNum(s.speed_score),
      _key: (s.id ?? idx).toString(),
      _label: `${(s.brand ?? "").toUpperCase()} — ${s.model ?? ""}`,
    }))
    .filter((p) => p._x !== null && p._y !== null);

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Matrice (Cushion vs Speed)</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Click su un punto per aprire RunRepeat. Punti: <b>{points.length}</b>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 520 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="_x"
              name="Cushion"
              domain={[0, 10]}
              tickCount={6}
              label={{ value: "cushion_score", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="_y"
              name="Speed"
              domain={[0, 10]}
              tickCount={6}
              label={{ value: "speed_score", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value: any, name: any, props: any) => value}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const p: any = payload[0].payload;
                return (
                  <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 10, maxWidth: 320 }}>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>{p._label}</div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      category: <b>{p.category ?? "-"}</b> · terrain: <b>{p.terrain ?? "-"}</b>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      cushion: <b>{p._x}</b> · speed: <b>{p._y}</b>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      stability: <b>{p.stability_score ?? "-"}</b> · weight: <b>{p.weight_g ?? "-"}</b>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
                      (clicca il punto per aprire RunRepeat)
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
  data={points}
  fill="#8884d8"
  shape={(props: any) => {
    const c = CATEGORY_COLORS[props.payload.category] || CATEGORY_COLORS.default;
    return <circle {...props} fill={c} r={6} />;
  }}
/>

          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
