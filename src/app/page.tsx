import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data, error, count } = await supabase
    .from("shoes")          // ⚠️ nome tabella
    .select("*", { count: "exact" })
    .limit(5);

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Supabase error</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Supabase OK</h1>
      <p>Record totali: {count}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
