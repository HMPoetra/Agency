import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Menambahkan kolom youtube_url dan tiktok_url ke tabel officers...");

  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE officers ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT ''`;

  // Migrasi data live_url yang sudah ada
  await sql`
    UPDATE officers 
    SET youtube_url = live_url 
    WHERE (youtube_url IS NULL OR youtube_url = '') 
      AND (live_url LIKE '%youtu%')
  `;

  await sql`
    UPDATE officers 
    SET tiktok_url = live_url 
    WHERE (tiktok_url IS NULL OR tiktok_url = '') 
      AND (live_url LIKE '%tiktok%')
  `;

  console.log("Migrasi selesai!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
