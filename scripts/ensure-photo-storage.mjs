import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Memastikan kolom foto bertipe TEXT/JSONB agar bisa menyimpan data URL (base64)...");

  await sql`ALTER TABLE divisions ALTER COLUMN photo_url TYPE TEXT`;
  console.log("OK: divisions.photo_url -> TEXT");

  await sql`ALTER TABLE contracts ALTER COLUMN photo_url TYPE TEXT`;
  console.log("OK: contracts.photo_url -> TEXT");

  await sql`ALTER TABLE products ALTER COLUMN photo_urls TYPE JSONB USING photo_urls::jsonb`;
  console.log("OK: products.photo_urls -> JSONB");

  console.log("Selesai.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
