import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating content table...");
  await sql`
    CREATE TABLE IF NOT EXISTS content (
      id          text PRIMARY KEY,
      officer_id  text REFERENCES officers(id) ON DELETE SET NULL,
      title       text NOT NULL DEFAULT '',
      url         text NOT NULL DEFAULT '',
      category    text NOT NULL DEFAULT 'Konten',
      is_active   boolean NOT NULL DEFAULT true,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )`;

  const rows = await sql`SELECT COUNT(*)::int AS n FROM content`;
  console.log("content table ready. rows:", rows[0].n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
