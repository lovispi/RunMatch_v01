import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type Row = {
  brand: string | null;
  category: string | null;
  terrain: string | null;
  use_type: string | null;
};

function uniqSorted(values: (string | null | undefined)[]) {
  return Array.from(
    new Set(values.map((v) => (v || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  // prendo solo le colonne necessarie e poi faccio uniq lato server
  const { data, error } = await supabaseServer
    .from("shoes")
    .select("brand, category, terrain, use_type")
    .limit(1000); // 393 record: basta e avanza

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];

  return NextResponse.json({
    brands: uniqSorted(rows.map((r) => r.brand)),
    categories: uniqSorted(rows.map((r) => r.category)),
    terrains: uniqSorted(rows.map((r) => r.terrain)),
    use_types: uniqSorted(rows.map((r) => r.use_type)),
  });
}
