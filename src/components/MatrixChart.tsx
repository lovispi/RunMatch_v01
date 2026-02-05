"use client";

import React from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export default function MatrixChart({
  data,
  userPoint,
}: {
  data: Shoe[];
  userPoint?: { x: number; y: number };
}) {
  // normalizza i punti (Recharts vuole chiavi numeriche consistenti)
  const points = (data || [])
    .filter((s) => typeof s?.cushion_score === "number" && typeof s?.speed_score === "number")
    .map((s) => ({
      id: s.id,
      brand: s.brand,
      model: s.model,
      category: (s.category || "").toLowerCase(),
      _x: Number(s.cushion_score),
      _y: Number(s.speed_score),
    }));

  // palette (blu → viola → magenta)
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

  return (
    <div style={{ width: "100%", height: 520, border: "1px solid #eee", borderRadius: 14, padding: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 18, bottom: 10, left: 18 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            dataKey="_x"
            domain={[0, 10]}
            tickCount={11}
            name="Cushion"
            label={{ value: "Cushion", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="_y"
            domain={[0, 10]}
            tickCount={11}
            name="Speed"
            label={{ value: "Speed", angle: -90, position: "insideLeft" }}
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: any, name: any, props: any) => {
              return [value, name];
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload;
              if (!p) return "";
              const title = `${(p.brand || "").toUpperCase()} — ${p.model || ""}`;
              const cat = p.category ? ` (${p.category})` : "";
              return `${title}${cat}`;
            }}
          />

          {/* Scarpe */}
          <Scatter
            data={points}
            shape={(props: any) => {
              const cat = props?.payload?.category || "default";
              const fill = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
              return <circle {...props} fill={fill} r={6} />;
            }}
          />

          {/* Punto utente */}
          {userPoint && (
            <Scatter
              data={[{ _x: userPoint.x, _y: userPoint.y }]}
              fill="#8884d8"
              shape={(props: any) => (
                <circle {...props} r={10} fill="white" stroke="black" strokeWidth={2} />
              )}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
