import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Memperbarui password...");
  const hash = await bcrypt.hash("password123", 12);

  await sql`UPDATE users SET password_hash = ${hash} WHERE username IN ('admin_utama', 'anggota1', 'klien1')`;

  console.log("Berhasil memperbarui password menjadi password123!");
}

main().catch(console.error);
