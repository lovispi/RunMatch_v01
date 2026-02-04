import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function uniqSorted(arr: (string | null)[]) {
  return Array.from(new Set(arr.filter(Boolean).map((x) => String(x).trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export async function GET() {
  // prendiamo solo le colonne utili
  const { data, error } = await supabaseServer
    .from("shoes")
    .select("brand, category, terrain, use_type");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const brands = uniqSorted(data?.map((r: any) => r.brand) ?? []);
  const categories = uniqSorted(data?.map((r: any) => r.category) ?? []);
  const terrains = uniqSorted(data?.map((r: any) => r.terrain) ?? []);
  const use_types = uniqSorted(data?.map((r: any) => r.use_type) ?? []);

  return NextResponse.json({ brands, categories, terrains, use_types });
}
