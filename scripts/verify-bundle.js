const { config } = require("dotenv");
config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

pool
  .query(
    `
  SELECT bi.id, b.name AS bundle, p.name AS product, p.category,
         p.grade, p.subject, p.brand, p.type
  FROM bundle_items bi
  JOIN bundles b ON bi.bundle_id = b.id
  JOIN products p ON bi.product_id = p.id
  WHERE b.product_code = 'BDL-G6-2025'
  ORDER BY p.category, p.name
`
  )
  .then((r) => {
    console.log("--- BDL-G6-2025 bundle_items ---");
    r.rows.forEach((row) => console.log(JSON.stringify(row)));
    console.log("\nTotal rows:", r.rows.length);
    const cats = [...new Set(r.rows.map((row) => row.category))];
    console.log("Categories present:", cats.join(", "));
    pool.end();
  })
  .catch((e) => {
    console.error(e);
    pool.end();
    process.exit(1);
  });
