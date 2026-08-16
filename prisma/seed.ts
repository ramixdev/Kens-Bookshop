import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH environment variables.");
  }

  await prisma.admin.upsert({
    where: { id: 1 },
    update: { email: adminEmail, password_hash: adminPasswordHash },
    create: { email: adminEmail, password_hash: adminPasswordHash },
  });

  console.log(`✅  Admin upserted: ${adminEmail}`);

  // ── Branches (13 Leeds International locations across Sri Lanka) ───────────
  const branches = [
    {
      name: "Leeds International – Colombo 3",
      address: "42 Galle Road, Colombo 03, Western Province",
      phone: "+94 11 257 8800",
      email: "colombo3@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:30 PM",
    },
    {
      name: "Leeds International – Kandy",
      address: "18 Dalada Veediya, Kandy 20000, Central Province",
      phone: "+94 81 222 4567",
      email: "kandy@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:00 PM",
    },
    {
      name: "Leeds International – Galle",
      address: "76 Wakwella Road, Galle 80000, Southern Province",
      phone: "+94 91 224 3399",
      email: "galle@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:00 PM",
    },
    {
      name: "Leeds International – Negombo",
      address: "33 St. Joseph's Street, Negombo 11500, Western Province",
      phone: "+94 31 222 7711",
      email: "negombo@kens.lk",
      hours: "Mon–Sat 9:00 AM – 6:00 PM",
    },
    {
      name: "Leeds International – Kurunegala",
      address: "12 Rajapihilla Mawatha, Kurunegala 60000, North Western Province",
      phone: "+94 37 222 5580",
      email: "kurunegala@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:00 PM",
    },
    {
      name: "Leeds International – Ratnapura",
      address: "55 Colombo Road, Ratnapura 70000, Sabaragamuwa Province",
      phone: "+94 45 222 3344",
      email: "ratnapura@kens.lk",
      hours: "Mon–Sat 9:00 AM – 5:30 PM",
    },
    {
      name: "Leeds International – Matara",
      address: "28 Anagarika Dharmapala Mawatha, Matara 81000, Southern Province",
      phone: "+94 41 222 6690",
      email: "matara@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:00 PM",
    },
    {
      name: "Leeds International – Jaffna",
      address: "14 Hospital Road, Jaffna 40000, Northern Province",
      phone: "+94 21 222 4488",
      email: "jaffna@kens.lk",
      hours: "Mon–Fri 8:30 AM – 5:30 PM, Sat 9:00 AM – 3:00 PM",
    },
    {
      name: "Leeds International – Anuradhapura",
      address: "66 Maithripala Senanayake Mawatha, Anuradhapura 50000, North Central Province",
      phone: "+94 25 222 3377",
      email: "anuradhapura@kens.lk",
      hours: "Mon–Sat 9:00 AM – 5:30 PM",
    },
    {
      name: "Leeds International – Batticaloa",
      address: "22 Bar Road, Batticaloa 30000, Eastern Province",
      phone: "+94 65 222 5566",
      email: "batticaloa@kens.lk",
      hours: "Mon–Sat 9:00 AM – 5:30 PM",
    },
    {
      name: "Leeds International – Badulla",
      address: "9 Bandaranayake Mawatha, Badulla 90000, Uva Province",
      phone: "+94 55 222 4422",
      email: "badulla@kens.lk",
      hours: "Mon–Sat 9:00 AM – 5:30 PM",
    },
    {
      name: "Leeds International – Nuwara Eliya",
      address: "37 New Bazaar Street, Nuwara Eliya 22200, Central Province",
      phone: "+94 52 222 2299",
      email: "nuwaraeliya@kens.lk",
      hours: "Mon–Sat 9:00 AM – 5:00 PM",
    },
    {
      name: "Leeds International – Nugegoda",
      address: "5 High Level Road, Nugegoda 10250, Western Province",
      phone: "+94 11 285 6633",
      email: "nugegoda@kens.lk",
      hours: "Mon–Sat 8:30 AM – 6:30 PM",
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branches.indexOf(branch) + 1 },
      update: branch,
      create: branch,
    });
  }

  console.log(`✅  ${branches.length} branches seeded`);

  // ── Products — skip if already seeded ─────────────────────────────────────
  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    console.log(`⏭️   Products already seeded (${existingCount} rows) — skipping`);
  } else {
    // ── Books (20) ────────────────────────────────────────────────────────────
    const books = [
      {
        name: "Mathematics for Grade 6",
        isbn: "978-955-20-1001-1",
        author: "S. Wijesinghe",
        grade: "Grade 6",
        subject: "Mathematics",
        price: 850,
        stock_qty: 45,
        product_code: "BK-G6-MATH-01",
      },
      {
        name: "Science Explorer Grade 7",
        isbn: "978-955-20-1002-2",
        author: "R. Perera",
        grade: "Grade 7",
        subject: "Science",
        price: 920,
        stock_qty: 38,
        product_code: "BK-G7-SCI-01",
      },
      {
        name: "English Grammar & Composition Grade 8",
        isbn: "978-955-20-1003-3",
        author: "D. Fernando",
        grade: "Grade 8",
        subject: "English",
        price: 780,
        stock_qty: 52,
        product_code: "BK-G8-ENG-01",
      },
      {
        name: "History of Sri Lanka Grade 9",
        isbn: "978-955-20-1004-4",
        author: "M. Jayasena",
        grade: "Grade 9",
        subject: "History",
        price: 690,
        stock_qty: 30,
        product_code: "BK-G9-HIS-01",
      },
      {
        name: "Advanced Mathematics Grade 10",
        isbn: "978-955-20-1005-5",
        author: "P. Mendis",
        grade: "Grade 10",
        subject: "Mathematics",
        price: 1150,
        stock_qty: 60,
        product_code: "BK-G10-MATH-01",
      },
      {
        name: "Physics Fundamentals Grade 11",
        isbn: "978-955-20-1006-6",
        author: "A. Rathnayake",
        grade: "Grade 11",
        subject: "Physics",
        price: 1250,
        stock_qty: 35,
        product_code: "BK-G11-PHY-01",
      },
      {
        name: "Chemistry Lab Manual Grade 11",
        isbn: "978-955-20-1007-7",
        author: "C. Bandara",
        grade: "Grade 11",
        subject: "Chemistry",
        price: 950,
        stock_qty: 28,
        product_code: "BK-G11-CHEM-01",
      },
      {
        name: "Biology in Focus Grade 12",
        isbn: "978-955-20-1008-8",
        author: "N. Dissanayake",
        grade: "Grade 12",
        subject: "Biology",
        price: 1380,
        stock_qty: 20,
        product_code: "BK-G12-BIO-01",
      },
      {
        name: "Sinhala Literature Grade 10",
        isbn: "978-955-20-1009-9",
        author: "K. Gunawardena",
        grade: "Grade 10",
        subject: "Sinhala",
        price: 720,
        stock_qty: 42,
        product_code: "BK-G10-SIN-01",
      },
      {
        name: "ICT Workbook Grade 9",
        isbn: "978-955-20-1010-0",
        author: "T. Silva",
        grade: "Grade 9",
        subject: "ICT",
        price: 880,
        stock_qty: 55,
        product_code: "BK-G9-ICT-01",
      },
      {
        name: "Commerce for Beginners Grade 10",
        isbn: "978-955-20-1011-1",
        author: "L. Senanayake",
        grade: "Grade 10",
        subject: "Commerce",
        price: 790,
        stock_qty: 33,
        product_code: "BK-G10-COM-01",
      },
      {
        name: "Accounting Principles Grade 12",
        isbn: "978-955-20-1012-2",
        author: "S. Karunaratne",
        grade: "Grade 12",
        subject: "Accounting",
        price: 1450,
        stock_qty: 18,
        product_code: "BK-G12-ACC-01",
      },
      {
        name: "Economics & Society Grade 11",
        isbn: "978-955-20-1013-3",
        author: "B. Hettige",
        grade: "Grade 11",
        subject: "Economics",
        price: 1100,
        stock_qty: 25,
        product_code: "BK-G11-ECO-01",
      },
      {
        name: "Geography of Sri Lanka Grade 8",
        isbn: "978-955-20-1014-4",
        author: "V. Rajapaksa",
        grade: "Grade 8",
        subject: "Geography",
        price: 760,
        stock_qty: 40,
        product_code: "BK-G8-GEO-01",
      },
      {
        name: "Grade 1 Reading & Writing",
        isbn: "978-955-20-1015-5",
        author: "M. Pathirana",
        grade: "Grade 1",
        subject: "English",
        price: 550,
        stock_qty: 70,
        product_code: "BK-G1-ENG-01",
      },
      {
        name: "KG1 Number Fun",
        isbn: "978-955-20-1016-6",
        author: "T. Abeywickrama",
        grade: "KG1",
        subject: "Mathematics",
        price: 480,
        stock_qty: 80,
        product_code: "BK-KG1-MATH-01",
      },
      {
        name: "Tamil Language Grade 7",
        isbn: "978-955-20-1017-7",
        author: "R. Murugan",
        grade: "Grade 7",
        subject: "Tamil",
        price: 670,
        stock_qty: 22,
        product_code: "BK-G7-TAM-01",
      },
      {
        name: "Grade 5 Scholarship Mathematics",
        isbn: "978-955-20-1018-8",
        author: "P. Wickramasinghe",
        grade: "Grade 5",
        subject: "Mathematics",
        price: 990,
        stock_qty: 48,
        product_code: "BK-G5-MATH-01",
      },
      {
        name: "Grade 5 Scholarship Science",
        isbn: "978-955-20-1019-9",
        author: "H. Fonseka",
        grade: "Grade 5",
        subject: "Science",
        price: 950,
        stock_qty: 44,
        product_code: "BK-G5-SCI-01",
      },
      {
        name: "Advanced Level Combined Mathematics",
        isbn: "978-955-20-1020-0",
        author: "W. Ekanayake",
        grade: "Grade 13",
        subject: "Mathematics",
        price: 1850,
        stock_qty: 15,
        product_code: "BK-G13-CMATH-01",
      },
    ];

    for (const book of books) {
      await prisma.product.create({
        data: {
          category: "book",
          availability: true,
          photo: null,
          ...book,
          price: book.price,
        },
      });
    }
    console.log(`✅  ${books.length} books seeded`);

    // ── Past Papers (15) ──────────────────────────────────────────────────────
    const pastPapers = [
      {
        name: "Mathematics Grade 10 Past Papers 2019–2023",
        grade: "Grade 10",
        subject: "Mathematics",
        price: 350,
        stock_qty: 60,
        product_code: "PP-G10-MATH-01",
      },
      {
        name: "Science Grade 9 Past Papers 2020–2023",
        grade: "Grade 9",
        subject: "Science",
        price: 320,
        stock_qty: 55,
        product_code: "PP-G9-SCI-01",
      },
      {
        name: "English Grade 11 Past Papers 2018–2023",
        grade: "Grade 11",
        subject: "English",
        price: 380,
        stock_qty: 50,
        product_code: "PP-G11-ENG-01",
      },
      {
        name: "Physics A/L Past Papers 2015–2023",
        grade: "Grade 13",
        subject: "Physics",
        price: 450,
        stock_qty: 40,
        product_code: "PP-G13-PHY-01",
      },
      {
        name: "Chemistry A/L Past Papers 2015–2023",
        grade: "Grade 13",
        subject: "Chemistry",
        price: 450,
        stock_qty: 38,
        product_code: "PP-G13-CHEM-01",
      },
      {
        name: "Biology A/L Past Papers 2016–2023",
        grade: "Grade 13",
        subject: "Biology",
        price: 420,
        stock_qty: 35,
        product_code: "PP-G13-BIO-01",
      },
      {
        name: "Grade 5 Scholarship Exam Papers 2018–2023",
        grade: "Grade 5",
        subject: "Mathematics",
        price: 490,
        stock_qty: 65,
        product_code: "PP-G5-SCH-01",
      },
      {
        name: "O/L Mathematics Past Papers 2019–2023",
        grade: "Grade 11",
        subject: "Mathematics",
        price: 420,
        stock_qty: 70,
        product_code: "PP-G11-MATH-01",
      },
      {
        name: "O/L Science Past Papers 2019–2023",
        grade: "Grade 11",
        subject: "Science",
        price: 400,
        stock_qty: 68,
        product_code: "PP-G11-SCI-01",
      },
      {
        name: "O/L Sinhala Past Papers 2020–2023",
        grade: "Grade 11",
        subject: "Sinhala",
        price: 360,
        stock_qty: 45,
        product_code: "PP-G11-SIN-01",
      },
      {
        name: "History Grade 9 Past Papers 2020–2023",
        grade: "Grade 9",
        subject: "History",
        price: 310,
        stock_qty: 30,
        product_code: "PP-G9-HIS-01",
      },
      {
        name: "Geography Grade 10 Past Papers 2020–2023",
        grade: "Grade 10",
        subject: "Geography",
        price: 330,
        stock_qty: 28,
        product_code: "PP-G10-GEO-01",
      },
      {
        name: "ICT Grade 10 Past Papers 2021–2023",
        grade: "Grade 10",
        subject: "ICT",
        price: 340,
        stock_qty: 33,
        product_code: "PP-G10-ICT-01",
      },
      {
        name: "Economics A/L Past Papers 2017–2023",
        grade: "Grade 13",
        subject: "Economics",
        price: 460,
        stock_qty: 25,
        product_code: "PP-G13-ECO-01",
      },
      {
        name: "Accounting A/L Past Papers 2017–2023",
        grade: "Grade 13",
        subject: "Accounting",
        price: 460,
        stock_qty: 22,
        product_code: "PP-G13-ACC-01",
      },
    ];

    for (const pp of pastPapers) {
      await prisma.product.create({
        data: {
          category: "past_paper",
          availability: true,
          photo: null,
          ...pp,
          price: pp.price,
        },
      });
    }
    console.log(`✅  ${pastPapers.length} past papers seeded`);

    // ── Stationery (15) ───────────────────────────────────────────────────────
    const stationery = [
      {
        name: "Camlin Ball Point Pens (10 pack)",
        brand: "Camlin",
        type: "Pens",
        price: 290,
        stock_qty: 120,
        product_code: "ST-PEN-CAM-01",
      },
      {
        name: "Staedtler HB Pencils (12 pack)",
        brand: "Staedtler",
        type: "Pencils",
        price: 350,
        stock_qty: 95,
        product_code: "ST-PEN-STA-01",
      },
      {
        name: "Faber-Castell Colour Pencils (24 colours)",
        brand: "Faber-Castell",
        type: "Pencils",
        price: 680,
        stock_qty: 60,
        product_code: "ST-CPE-FAB-01",
      },
      {
        name: "Classmate Plastic Eraser (5 pack)",
        brand: "Classmate",
        type: "Erasers",
        price: 120,
        stock_qty: 200,
        product_code: "ST-ERA-CLA-01",
      },
      {
        name: "Maped 30cm Transparent Ruler",
        brand: "Maped",
        type: "Rulers",
        price: 180,
        stock_qty: 150,
        product_code: "ST-RUL-MAP-01",
      },
      {
        name: "Stabilo Boss Highlighters (4 colours)",
        brand: "Stabilo",
        type: "Highlighters",
        price: 520,
        stock_qty: 75,
        product_code: "ST-HLT-STA-01",
      },
      {
        name: "Artline Permanent Markers (4 pack)",
        brand: "Artline",
        type: "Markers",
        price: 390,
        stock_qty: 85,
        product_code: "ST-MAR-ART-01",
      },
      {
        name: "Casio FX-991EX Scientific Calculator",
        brand: "Casio",
        type: "Calculators",
        price: 3850,
        stock_qty: 30,
        product_code: "ST-CAL-CAS-01",
      },
      {
        name: "Casio FX-82MS Scientific Calculator",
        brand: "Casio",
        type: "Calculators",
        price: 2450,
        stock_qty: 40,
        product_code: "ST-CAL-CAS-02",
      },
      {
        name: "Treeline A4 Display Book (40 pockets)",
        brand: "Treeline",
        type: "Folders",
        price: 450,
        stock_qty: 55,
        product_code: "ST-FOL-TRE-01",
      },
      {
        name: "Pilot G-2 Gel Pens (3 pack)",
        brand: "Pilot",
        type: "Pens",
        price: 480,
        stock_qty: 90,
        product_code: "ST-PEN-PIL-01",
      },
      {
        name: "Staedtler Compass & Geometry Set",
        brand: "Staedtler",
        type: "Rulers",
        price: 750,
        stock_qty: 45,
        product_code: "ST-GEO-STA-01",
      },
      {
        name: "Faber-Castell Erasable Coloured Pencils (12 pack)",
        brand: "Faber-Castell",
        type: "Pencils",
        price: 890,
        stock_qty: 35,
        product_code: "ST-CPE-FAB-02",
      },
      {
        name: "Stabilo Point 88 Fineliner Pens (10 pack)",
        brand: "Stabilo",
        type: "Pens",
        price: 1250,
        stock_qty: 28,
        product_code: "ST-FIN-STA-01",
      },
      {
        name: "Treeline Cardboard A4 Folder (5 pack)",
        brand: "Treeline",
        type: "Folders",
        price: 320,
        stock_qty: 70,
        product_code: "ST-FOL-TRE-02",
      },
    ];

    for (const item of stationery) {
      await prisma.product.create({
        data: {
          category: "stationery",
          availability: true,
          photo: null,
          ...item,
          price: item.price,
        },
      });
    }
    console.log(`✅  ${stationery.length} stationery items seeded`);
  }

  // ── Bundles — skip if already seeded ──────────────────────────────────────
  const existingBundles = await prisma.bundle.count();
  if (existingBundles > 0) {
    console.log(`⏭️   Bundles already seeded (${existingBundles} rows) — skipping`);
  } else {
    // Sample bundle — Grade 10 core subjects
    const g10Books = await prisma.product.findMany({
      where: { category: "book", grade: "Grade 10" },
      select: { id: true, price: true },
    });

    if (g10Books.length > 0) {
      await prisma.bundle.create({
        data: {
          name: "Grade 10 Core Booklist Bundle 2025",
          product_code: "BDL-G10-2025",
          price: Math.round(g10Books.reduce((s, b) => s + Number(b.price), 0) * 0.9),
          grade: "Grade 10",
          availability: true,
          photo: null,
          bundle_items: {
            create: g10Books.map((b) => ({ product_id: b.id })),
          },
        },
      });
      console.log(`✅  Grade 10 bundle seeded (${g10Books.length} books)`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
