import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding photo_url to divisions...");
  try {
    await sql`ALTER TABLE divisions ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT ''`;
    console.log("Column added or already exists.");
  } catch (e) {
    console.error(e.message);
  }
}

main().catch(console.error);
