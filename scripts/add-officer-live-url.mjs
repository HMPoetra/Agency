import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding live_url to officers...");
  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT ''`;
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
