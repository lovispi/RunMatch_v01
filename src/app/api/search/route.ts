import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || 30), 50);

  const brand = (searchParams.get("brand") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const terrain = (searchParams.get("terrain") || "").trim();
  const use_type = (searchParams.get("use_type") || "").trim();

  const min_display = searchParams.get("min_display");
  const min_proxy = searchParams.get("min_proxy");

  const plateParam = (searchParams.get("plate") || "").trim(); // "true" | "false" | ""
  const sort = (searchParams.get("sort") || "display_desc").trim();

  let query = supabaseServer
    .from("shoes")
    .select(
      "id, brand, model, year, category, terrain, use_type, plate, weight_g, drop_mm, stack_mm, display_score, proxy_score, runrepeat_url, speed_score, cushion_score, stability_score"
    );

  // Full-text "basic" su alcune colonne
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      [
        `brand.ilike.${like}`,
        `model.ilike.${like}`,
        `category.ilike.${like}`,
        `terrain.ilike.${like}`,
        `use_type.ilike.${like}`,
      ].join(",")
    );
  }

// Filtri esatti (valori arrivano dal dropdown -> match esatto)
if (brand) query = query.eq("brand", brand);
if (category) query = query.eq("category", category);
if (terrain) query = query.eq("terrain", terrain);
if (use_type) query = query.eq("use_type", use_type);

  // Filtri numerici
  if (min_display) query = query.gte("display_score", Number(min_display));
  if (min_proxy) query = query.gte("proxy_score", Number(min_proxy));

  // Plate
  if (plateParam === "true") query = query.eq("plate", true);
  if (plateParam === "false") query = query.eq("plate", false);

  // Sort
  switch (sort) {
    case "display_desc":
      query = query.order("display_score", { ascending: false });
      break;
    case "proxy_desc":
      query = query.order("proxy_score", { ascending: false });
      break;
    case "weight_asc":
      query = query.order("weight_g", { ascending: true, nullsFirst: false });
      break;
    case "drop_asc":
      query = query.order("drop_mm", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("display_score", { ascending: false });
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    query: q,
    filters: { brand, category, terrain, use_type, min_display, min_proxy, plate: plateParam, sort },
    count: data?.length ?? 0,
    results: data ?? [],
  });
}
