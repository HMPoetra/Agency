import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const divisionsCols = await sql`SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'divisions'`;
  const officersCols = await sql`SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'officers'`;

  console.log("=== DIVISIONS TABLE ===");
  console.log(divisionsCols);
  
  console.log("\n=== OFFICERS TABLE ===");
  console.log(officersCols);
}

main().catch(console.error);
