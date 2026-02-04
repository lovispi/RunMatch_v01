import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || 30), 50);

  // Se non c'è query, mostra i "top" per display_score
  if (!q) {
    const { data, error } = await supabaseServer
      .from("shoes")
      .select(
        "id, brand, model, year, category, terrain, use_type, display_score, proxy_score, runrepeat_url"
      )
      .order("display_score", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ query: q, count: data?.length ?? 0, results: data ?? [] });
  }

  // Ricerca testuale base su brand/model/category (+ pros/cons se vuoi)
  const like = `%${q}%`;

  const { data, error } = await supabaseServer
    .from("shoes")
    .select(
      "id, brand, model, year, category, terrain, use_type, display_score, proxy_score, runrepeat_url"
    )
    .or(
      [
        `brand.ilike.${like}`,
        `model.ilike.${like}`,
        `category.ilike.${like}`,
        `terrain.ilike.${like}`,
        `use_type.ilike.${like}`,
        // Se vuoi includere anche pros/cons, scommenta:
        // `pros.ilike.${like}`,
        // `cons.ilike.${like}`,
      ].join(",")
    )
    .order("display_score", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ query: q, count: data?.length ?? 0, results: data ?? [] });
}
