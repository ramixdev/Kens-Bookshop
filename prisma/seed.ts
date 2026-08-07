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
