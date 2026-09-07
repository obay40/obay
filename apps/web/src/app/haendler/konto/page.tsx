import { redirect } from "next/navigation";
import { prisma, DealerStatus } from "@autoklick24/database";
import { getAuthContext, DEALER_ROLES } from "@autoklick24/auth";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Händlerkonto" };

/**
 * Deutsche Statustexte zum Verifizierungsstatus (siehe Aufgabenstellung
 * "STATUSMODELL") - niemals "Verifizierter Händler" anzeigen, solange
 * status nicht wirklich VERIFIED ist (siehe Abschnitt "VERIFIZIERTER
 * HÄNDLER").
 */
const STATUS_LABELS: Record<DealerStatus, string> = {
  PENDING: "Prüfung läuft",
  VERIFIED: "Händler verifiziert",
  REJECTED: "Verifizierung abgelehnt",
  NEEDS_MORE_INFORMATION: "Weitere Unterlagen erforderlich",
  SUSPENDED: "Konto gesperrt",
};

const STATUS_STYLES: Record<DealerStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  NEEDS_MORE_INFORMATION: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
};

export default async function DealerAccountPage() {
  const ctx = await getAuthContext();
  if (!ctx.userId || !DEALER_ROLES.includes(ctx.role)) {
    redirect("/haendler/login");
  }

  const dealer = await prisma.dealer.findFirst({
    where: { OR: [{ ownerUserId: ctx.userId }, { employees: { some: { userId: ctx.userId } } }] },
    include: { verificationDocuments: { select: { id: true, originalFileName: true, uploadedAt: true } } },
  });

  if (!dealer) {
    redirect("/haendler/registrieren");
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-navy-900 text-2xl font-bold">{dealer.companyName}</h1>

        <div className="mt-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[dealer.status]}`}
          >
            {dealer.status === "VERIFIED" ? "✓ " : ""}
            {STATUS_LABELS[dealer.status]}
          </span>
        </div>

        {dealer.status === "REJECTED" && dealer.rejectionReason && (
          <p className="text-navy-600 mt-4 text-sm">Grund: {dealer.rejectionReason}</p>
        )}

        {dealer.status === "PENDING" && (
          <p className="text-navy-600 mt-4 text-sm">
            Ihre Händlerdaten werden von Autoklick24 geprüft. Sie erhalten eine Nachricht, sobald
            Ihr Händlerkonto freigeschaltet wurde.
          </p>
        )}

        {dealer.status === "NEEDS_MORE_INFORMATION" && (
          <p className="text-navy-600 mt-4 text-sm">
            Für die Prüfung Ihres Händlerkontos werden noch weitere Unterlagen benötigt. Wir
            melden uns bei Ihnen.
          </p>
        )}

        <div className="border-navy-100 mt-8 border-t pt-6">
          <h2 className="text-navy-900 text-sm font-semibold">Gewerbenachweis</h2>
          <ul className="mt-2 space-y-1">
            {dealer.verificationDocuments.map((doc) => (
              <li key={doc.id} className="text-navy-600 text-sm">
                {doc.originalFileName} · hochgeladen am{" "}
                {doc.uploadedAt.toLocaleDateString("de-DE")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
