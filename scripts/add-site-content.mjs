import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const seeds = {
  hero_title: "Personil *Polisi* Siap Diterjunkan",
  hero_subtitle:
    "Agensi penyedia personil kepolisian profesional untuk server FiveM. Personil bersertifikat, radio etiquette teruji, dan siap diterjunkan sesuai kebutuhan Server Roleplay Anda.",
  profile_title: "COP-S — COPS ON SUPPLY",
  profile_intro:
    "COP-S didukung oleh personel yang memiliki pengalaman dalam dunia FiveM Roleplay, khususnya di bidang Police Roleplay.\n\nPersonel kami telah memiliki pengalaman bermain di berbagai server Roleplay, di antaranya (MORP, IDP, Kisah Tanah Air, Garuda Prime) di server LSPD (NusaV, Exodus, IME, serta beberapa server lainnya). Dengan pengalaman bermain sekitar 1 tahun di setiap server, personel kami telah terbiasa beradaptasi dengan berbagai sistem pemerintahan, peraturan kota, standar operasional kepolisian, serta dinamika roleplay yang berbeda-beda.",
  profile_commitment_title: "Komitmen COP-S untuk Klien",
  profile_commitment_body:
    "Kami memahami bahwa setiap server memiliki kebutuhan dan standar roleplay yang berbeda. Oleh karena itu, COP-S mengutamakan penyesuaian personel dengan regulasi server klien, penerapan SOP yang disepakati, serta koordinasi yang jelas antara personel dan pihak manajemen.",
  profile_goal:
    "Tujuan kami bukan sekadar menyediakan personel, tetapi membantu membangun departemen kepolisian yang aktif, terorganisir, disiplin, dan mampu memberikan pengalaman roleplay yang berkualitas bagi seluruh pemain.",
};

async function main() {
  console.log("Creating site_content table...");
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key text PRIMARY KEY,
      value text NOT NULL DEFAULT '',
      updated_at timestamp with time zone DEFAULT now()
    )`;

  for (const [key, value] of Object.entries(seeds)) {
    await sql`
      INSERT INTO site_content (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO NOTHING`;
  }
  console.log("Seeded:", Object.keys(seeds).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
