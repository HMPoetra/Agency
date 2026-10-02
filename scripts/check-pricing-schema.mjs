import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const p = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'pricing_tiers'`;
  const p2 = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`;
  
  console.log("pricing_tiers:", p.map(c => c.column_name));
  console.log("products:", p2.map(c => c.column_name));
}

main().catch(console.error);
