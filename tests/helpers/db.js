import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function resetDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.cardQrToken.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.pointsTransaction.deleteMany();
  await prisma.customerVoucher.deleteMany();
  await prisma.rewardItem.deleteMany();
  await prisma.card.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.ad.deleteMany();
}

export async function seedBaseData() {
  const store = await prisma.store.create({
    data: {
      name_ar: "متجر التجربة",
      name_en: "Test Store",
      max_discount_percent: new Prisma.Decimal(20),
      commission_percent: new Prisma.Decimal(5)
    }
  });

  const adminPassword = await bcrypt.hash("Admin12345", 12);
  const storePassword = await bcrypt.hash("Store12345", 12);
  const customerPassword = await bcrypt.hash("Customer12345", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@test.local",
      password_hash: adminPassword,
      role: "admin"
    }
  });

  const storeUser = await prisma.user.create({
    data: {
      name: "Store User",
      email: "store@test.local",
      password_hash: storePassword,
      role: "store",
      store_id: store.id
    }
  });

  const customer = await prisma.customer.create({
    data: {
      name_ar: "عميل تجريبي",
      email: "customer@test.local",
      password_hash: customerPassword,
      default_discount_percent: new Prisma.Decimal(10),
      preferred_lang: "ar"
    }
  });

  return {
    store,
    admin,
    storeUser,
    customer,
    passwords: {
      admin: "Admin12345",
      store: "Store12345",
      customer: "Customer12345"
    }
  };
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
