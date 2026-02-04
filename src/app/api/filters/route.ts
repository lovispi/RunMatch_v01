import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function uniqSorted(arr: (string | null)[]) {
  return Array.from(new Set(arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export async function GET() {
  // Prendiamo solo le colonne utili ai filtri (puoi aumentare limit se vuoi)
  const { data, error } = await supabaseServer
    .from("shoes")
    .select("brand, category, terrain, use_type, plate")
    .limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const brands = uniqSorted(data?.map((r) => r.brand) ?? []);
  const categories = uniqSorted(data?.map((r) => r.category) ?? []);
  const terrains = uniqSorted(data?.map((r) => r.terrain) ?? []);
  const use_types = uniqSorted(data?.map((r) => r.use_type) ?? []);

  // plate non serve come lista (è boolean), ma puoi usare un conteggio se ti interessa
  return NextResponse.json({
    brands,
    categories,
    terrains,
    use_types,
  });
}
