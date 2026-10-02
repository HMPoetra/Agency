import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding manual_hours to officers...");
  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS manual_hours INT DEFAULT 0`;
  console.log("Done!");
}

main().catch(console.error);
