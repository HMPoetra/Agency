import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
async function run() {
  const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'divisions'`;
  console.log(res);
}
run().catch(console.error);
