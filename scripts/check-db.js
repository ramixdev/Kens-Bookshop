const { Pool } = require("pg");
const fs = require("fs");

const envFile = fs.readFileSync(".env.local", "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const [counts, stationeryTypes, nullTypes] = await Promise.all([
    pool.query(`
      SELECT
        SUM(CASE WHEN category='book' THEN 1 ELSE 0 END) AS books,
        SUM(CASE WHEN category='past_paper' THEN 1 ELSE 0 END) AS past_papers,
        SUM(CASE WHEN category='stationery' THEN 1 ELSE 0 END) AS stationery,
        COUNT(*) AS total
      FROM products
    `),
    pool.query(`
      SELECT type, COUNT(*) AS n
      FROM products
      WHERE category = 'stationery'
      GROUP BY type
      ORDER BY type
    `),
    pool.query(`
      SELECT name, product_code
      FROM products
      WHERE category = 'stationery' AND type IS NULL
    `),
  ]);

  const bundleCount = await pool.query("SELECT COUNT(*) AS n FROM bundles");
  const bundles = await pool.query(
    "SELECT name, product_code, grade, price FROM bundles ORDER BY grade"
  );

  console.log("=== ROW COUNTS ===");
  const c = counts.rows[0];
  console.log(`books:         ${c.books}`);
  console.log(`past_papers:   ${c.past_papers}`);
  console.log(`stationery:    ${c.stationery}`);
  console.log(`total products:${c.total}`);
  console.log(`bundles:       ${bundleCount.rows[0].n}`);
  console.log("");

  console.log("=== STATIONERY TYPE BREAKDOWN ===");
  stationeryTypes.rows.forEach((r) => console.log(`  ${String(r.type).padEnd(15)} : ${r.n}`));
  console.log("");

  if (nullTypes.rows.length > 0) {
    console.log("⚠️  STATIONERY WITH NULL TYPE:");
    nullTypes.rows.forEach((r) => console.log(`  ${r.product_code} — ${r.name}`));
  } else {
    console.log("✅  All stationery rows have non-null type");
  }
  console.log("");

  console.log("=== BUNDLES ===");
  bundles.rows.forEach((r) =>
    console.log(`  [${r.grade}] ${r.name} — LKR ${r.price}  (${r.product_code})`)
  );

  await pool.end();
}

main().catch((e) => {
  console.error("DB ERROR:", e.message);
  process.exit(1);
});
