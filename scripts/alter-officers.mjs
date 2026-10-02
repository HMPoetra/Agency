import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Mengubah struktur tabel officers...");

  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT '-'`;
  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS unit_task TEXT DEFAULT '-'`;
  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '-'`;

  await sql`ALTER TABLE officers DROP COLUMN IF EXISTS experience_hours`;
  await sql`ALTER TABLE officers DROP COLUMN IF EXISTS age_ooc`;
  await sql`ALTER TABLE officers DROP COLUMN IF EXISTS division_tag`;

  try {
    await sql`ALTER TABLE officers RENAME COLUMN division_name TO division`;
  } catch (e) {}

  console.log("Berhasil!");
}

main().catch(console.error);
