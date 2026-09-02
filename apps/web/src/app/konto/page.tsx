import { redirect } from "next/navigation";
import { getAuthContext } from "@autoklick24/auth";
import { prisma } from "@autoklick24/database";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Mein Konto" };

const dashboardSections = [
  "Meine Fahrzeuge",
  "Meine Inserate",
  "Ankaufangebote",
  "Vermittlungsanfragen",
  "Favoriten",
  "Suchaufträge",
  "Nachrichten",
  "Termine",
  "Dokumente",
  "Profil",
  "Einstellungen",
];

export default async function AccountPage() {
  const ctx = await getAuthContext();
  if (!ctx.userId) {
    redirect("/anmelden");
  }

  const profile = await prisma.profile.findUnique({ where: { userId: ctx.userId } });

  return (
    <Container className="py-12">
      <h1 className="text-navy-900 text-2xl font-bold">
        Hallo{profile ? `, ${profile.firstName}` : ""}
      </h1>
      <p className="text-navy-600 mt-1 text-sm">
        Dein Autoklick24-Dashboard. Die einzelnen Bereiche werden schrittweise in den kommenden
        Entwicklungsphasen umgesetzt.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardSections.map((section) => (
          <div
            key={section}
            className="border-navy-100 text-navy-700 shadow-card rounded-xl border bg-white p-5 text-sm font-medium"
          >
            {section}
          </div>
        ))}
      </div>
    </Container>
  );
}
