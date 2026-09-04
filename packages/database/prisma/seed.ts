/**
 * Entwicklungs-Seed. Erzeugt klar als Demo gekennzeichnete Datensätze
 * (siehe DEMO_MARKER) – niemals als Produktionsdaten verwenden.
 */
import { PrismaClient, Role, DealerStatus, DealerEmployeeRole } from "../generated/client/index";
import { hashPassword } from "../src/password";

const prisma = new PrismaClient();

const DEMO_MARKER = "[DEMO]";
const DEMO_PASSWORD = "Demo1234!"; // nur für lokale Entwicklung

async function main() {
  console.log("Seeding Autoklick24 Entwicklungsdaten...");

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.autoklick24.local" },
    update: {},
    create: {
      email: "admin@demo.autoklick24.local",
      passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerifiedAt: new Date(),
      profile: {
        create: { firstName: `${DEMO_MARKER} Admin`, lastName: "Autoklick24" },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "kunde@demo.autoklick24.local" },
    update: {},
    create: {
      email: "kunde@demo.autoklick24.local",
      passwordHash,
      role: Role.CUSTOMER,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: `${DEMO_MARKER} Max`,
          lastName: "Mustermann",
          phone: "+49 151 00000000",
        },
      },
      addresses: {
        create: {
          street: "Musterstraße",
          houseNumber: "12",
          postalCode: "50667",
          city: "Köln",
          country: "DE",
          isDefault: true,
        },
      },
    },
  });

  const dealerOwner = await prisma.user.upsert({
    where: { email: "haendler@demo.autoklick24.local" },
    update: {},
    create: {
      email: "haendler@demo.autoklick24.local",
      passwordHash,
      role: Role.DEALER,
      emailVerifiedAt: new Date(),
      profile: {
        create: { firstName: `${DEMO_MARKER} Julia`, lastName: "Beispielhändler" },
      },
    },
  });

  const dealerAddress = await prisma.address.create({
    data: {
      userId: dealerOwner.id,
      type: "BUSINESS",
      street: "Autohausallee",
      houseNumber: "7",
      postalCode: "50823",
      city: "Köln",
      country: "DE",
    },
  });

  const dealer = await prisma.dealer.upsert({
    where: { ownerUserId: dealerOwner.id },
    update: {},
    create: {
      ownerUserId: dealerOwner.id,
      companyName: `${DEMO_MARKER} Beispiel Automobile GmbH`,
      contactFirstName: "Julia",
      contactLastName: "Beispielhändler",
      contactEmail: "haendler@demo.autoklick24.local",
      contactPhone: "+49 221 0000000",
      status: DealerStatus.VERIFIED,
      verificationSubmittedAt: new Date(),
      verifiedAt: new Date(),
      addressId: dealerAddress.id,
      employees: {
        create: { userId: dealerOwner.id, role: DealerEmployeeRole.OWNER },
      },
    },
  });

  console.log("Fertig:", {
    admin: admin.email,
    customer: customer.email,
    dealer: dealer.companyName,
    demoPassword: DEMO_PASSWORD,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
