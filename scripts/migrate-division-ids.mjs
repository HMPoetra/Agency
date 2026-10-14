import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .split("/")[0]
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const divs = await sql`SELECT id, name FROM divisions ORDER BY id`;
const normMap = Object.fromEntries(divs.map((d) => [norm(d.name), d.id]));
const byId = Object.fromEntries(divs.map((d) => [d.id, d.name]));

const officers = await sql`SELECT id, division FROM officers ORDER BY id`;
let changed = 0;
for (const o of officers) {
  const tokens = (o.division || "").split(",").map((t) => t.trim()).filter(Boolean);
  const ids = tokens.map((t) => normMap[norm(t)] ?? t);
  const joined = ids.join(", ");
  const unknown = ids.filter((id) => !byId[id]);
  if (unknown.length) console.log(`  !! ${o.id} unknown token(s): ${unknown.join(", ")}`);
  if (joined !== o.division) {
    await sql`UPDATE officers SET division = ${joined}, updated_at = NOW() WHERE id = ${o.id}`;
    changed++;
    console.log(`  ${o.id}: "${o.division}"  ->  "${joined}"`);
  }
}
console.log(`Done. ${changed}/${officers.length} officers updated.`);
