import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Altering columns to TEXT...");
  try {
    await sql`ALTER TABLE contracts ALTER COLUMN photo_url TYPE TEXT`;
    console.log("contracts.photo_url changed to TEXT.");
  } catch(e) { 
    console.error("Error on contracts.photo_url:", e.message); 
  }
  
  try {
    await sql`ALTER TABLE contracts ALTER COLUMN detail TYPE TEXT`;
    console.log("contracts.detail changed to TEXT.");
  } catch(e) { 
    console.error("Error on contracts.detail:", e.message); 
  }

  try {
    await sql`ALTER TABLE divisions ALTER COLUMN photo_url TYPE TEXT`;
    console.log("divisions.photo_url changed to TEXT.");
  } catch(e) { 
    console.error("Error on divisions.photo_url:", e.message); 
  }

  console.log("Done.");
}

main().catch(console.error);
