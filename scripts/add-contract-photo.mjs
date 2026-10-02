import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding photo_url to contracts...");
  try {
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255)`;
    console.log("Column added successfully.");
  } catch(e) { 
    console.error(e.message); 
  }
}

main().catch(console.error);
