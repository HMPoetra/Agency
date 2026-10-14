import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating ala_carte table...");
  await sql`
    CREATE TABLE IF NOT EXISTS ala_carte (
      id                text PRIMARY KEY,
      division_id       text NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
      name              text NOT NULL DEFAULT '',
      description       text NOT NULL DEFAULT '',
      price_idr         bigint NOT NULL DEFAULT 0,
      price_per_person  bigint NOT NULL DEFAULT 0,
      is_active         boolean NOT NULL DEFAULT true,
      sort_order        integer NOT NULL DEFAULT 0,
      created_at        timestamptz NOT NULL DEFAULT now(),
      updated_at        timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`ALTER TABLE ala_carte ADD COLUMN IF NOT EXISTS price_per_person bigint NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE ala_carte DROP COLUMN IF EXISTS quantity`;
  await sql`ALTER TABLE ala_carte DROP COLUMN IF EXISTS service`;

  console.log("Creating ala_carte_ranks table...");
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

  const rows = await sql`SELECT COUNT(*)::int AS n FROM ala_carte`;
  console.log("ala_carte table ready. rows:", rows[0].n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
