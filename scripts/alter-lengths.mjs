import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Altering columns to be longer...");
  
  try {
    await sql`ALTER TABLE divisions ALTER COLUMN id TYPE VARCHAR(100)`;
    console.log("divisions.id -> VARCHAR(100)");
  } catch(e) { console.error(e.message); }

  try {
    await sql`ALTER TABLE divisions ALTER COLUMN name TYPE VARCHAR(255)`;
    console.log("divisions.name -> VARCHAR(255)");
  } catch(e) { console.error(e.message); }

  try {
    await sql`ALTER TABLE officers ALTER COLUMN division TYPE VARCHAR(255)`;
    console.log("officers.division -> VARCHAR(255)");
  } catch(e) { console.error(e.message); }

  console.log("Done!");
}

main().catch(console.error);
