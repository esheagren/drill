// node --env-file=.env.local scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../lib/db.ts", import.meta.url), "utf8");
const schema = src.match(/SCHEMA = `([\s\S]*?)`;/)[1];
const sql = neon(process.env.DATABASE_URL);
for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) await sql.query(stmt);
const t = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1`;
console.log("tables:", t.map((r) => r.table_name).join(", "));
