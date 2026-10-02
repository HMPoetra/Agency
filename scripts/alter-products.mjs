import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Altering products table...");
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]'::jsonb`;
    console.log("Added photo_urls JSONB column.");
  } catch(e) { console.error("Error photo_urls:", e.message); }

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT`;
    console.log("Added video_url TEXT column.");
  } catch(e) { console.error("Error video_url:", e.message); }
  
  // also alter to make sure we have category constraint if needed, but we don't strictly need it in DB if app enforces it
  // Kategori: Script, MLO, Clothing, Vehicle
  console.log("Done.");
}

main().catch(console.error);
