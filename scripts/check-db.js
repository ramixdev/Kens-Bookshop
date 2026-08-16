const { Pool } = require("pg");
const fs = require("fs");

// Load .env.local manually
const envFile = fs.readFileSync(".env.local", "utf8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const [books, papers, stationery, bundles, total] = await Promise.all([
    pool.query("SELECT COUNT(*) as n FROM products WHERE category = 'book'"),
    pool.query("SELECT COUNT(*) as n FROM products WHERE category = 'past_paper'"),
    pool.query("SELECT COUNT(*) as n FROM products WHERE category = 'stationery'"),
    pool.query("SELECT COUNT(*) as n FROM bundles"),
    pool.query("SELECT COUNT(*) as n FROM products"),
  ]);

  // Sample rows to verify they're real
  const sample = await pool.query(
    "SELECT name, category, availability, stock_qty FROM products LIMIT 5"
  );

  console.log("=== ROW COUNTS ===");
  console.log("books:        ", books.rows[0].n);
  console.log("past_papers:  ", papers.rows[0].n);
  console.log("stationery:   ", stationery.rows[0].n);
  console.log("bundles:      ", bundles.rows[0].n);
  console.log("total products:", total.rows[0].n);
  console.log("");
  console.log("=== SAMPLE ROWS (first 5 products) ===");
  sample.rows.forEach((r) => console.log(JSON.stringify(r)));

  await pool.end();
}

main().catch((e) => {
  console.error("DB ERROR:", e.message);
  process.exit(1);
});
