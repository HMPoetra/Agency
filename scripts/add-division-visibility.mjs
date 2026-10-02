import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding is_visible_on_dashboard to divisions...");
  try {
    await sql`ALTER TABLE divisions ADD COLUMN IF NOT EXISTS is_visible_on_dashboard BOOLEAN DEFAULT true`;
    console.log("Column added successfully.");
  } catch(e) { 
    console.error(e.message); 
  }
}

main().catch(console.error);
