import { PrismaClient } from "../generated/client/index";

declare global {
  // eslint-disable-next-line no-var
  var __autoklick24Prisma: PrismaClient | undefined;
}

/**
 * Ein einziger PrismaClient pro Prozess. Im Next.js-Dev-Server wird das
 * Modul bei Hot-Reload neu ausgewertet – ohne den globalThis-Cache würden
 * bei jedem Reload neue Connection-Pools entstehen.
 *
 * Eigenes Modul (statt in index.ts), damit vehicle-catalog/queries.ts den
 * Client importieren kann, ohne einen Zirkelbezug über index.ts zu erzeugen.
 */
export const prisma: PrismaClient = globalThis.__autoklick24Prisma ?? new PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__autoklick24Prisma = prisma;
}
