import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating ranks table...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS ranks (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Seed default ranks if empty
  const existingRanks = await sql`SELECT count(*) FROM ranks`;
  if (existingRanks[0].count == 0) {
    console.log("Seeding default ranks...");
    const defaultRanks = [
      "All Rank", "01. CHIEF", "02. ASSISTANT CHIEF", "03. COMMANDER", "04. CAPTAIN",
      "05. LIEUTENANT II", "06. LIEUTENANT", "07. SERGEANT II", "08. SERGEANT",
      "09. SENIOR POLICE OFFICER", "10. POLICE OFFICER III", "11. POLICE OFFICER II",
      "12. POLICE OFFICER", "13. CADET"
    ];
    for (const r of defaultRanks) {
      const id = r.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await sql`INSERT INTO ranks (id, name) VALUES (${id}, ${r})`;
    }
  }

  console.log("Done creating ranks table!");
}

main().catch(console.error);
