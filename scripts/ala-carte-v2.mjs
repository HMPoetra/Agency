import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Upgrading ala_carte → pricing model…");
  await sql`ALTER TABLE ala_carte ADD COLUMN IF NOT EXISTS price_per_person bigint NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE ala_carte DROP COLUMN IF EXISTS quantity`;
  await sql`ALTER TABLE ala_carte DROP COLUMN IF EXISTS service`;

  console.log("Creating ala_carte_ranks table…");
  await sql`
    CREATE TABLE IF NOT EXISTS ala_carte_ranks (
      id           text PRIMARY KEY,
      name         text NOT NULL DEFAULT '',
      description  text NOT NULL DEFAULT '',
      price_idr    bigint NOT NULL DEFAULT 0,
      is_active    boolean NOT NULL DEFAULT true,
      sort_order   integer NOT NULL DEFAULT 0,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now()
    )`;

  const [ac, rk] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM ala_carte`,
    sql`SELECT COUNT(*)::int AS n FROM ala_carte_ranks`,
  ]);
  console.log("done. ala_carte:", ac[0].n, "ranks:", rk[0].n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
