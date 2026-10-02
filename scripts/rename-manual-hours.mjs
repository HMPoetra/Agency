import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Renaming manual_hours to manual_minutes...");
  try {
    await sql`ALTER TABLE officers RENAME COLUMN manual_hours TO manual_minutes`;
  } catch (e) {
    // maybe it doesn't exist or already renamed
    console.log(e.message);
    await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS manual_minutes INT DEFAULT 0`;
  }
  console.log("Done!");
}

main().catch(console.error);
