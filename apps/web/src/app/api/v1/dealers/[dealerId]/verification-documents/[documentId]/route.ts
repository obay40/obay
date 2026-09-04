import { NextResponse } from "next/server";
import { prisma } from "@autoklick24/database";
import { getAuthContext, STAFF_ROLES } from "@autoklick24/auth";
import { readDealerVerificationDocument } from "@/lib/dealer-verification-storage";

/**
 * GET /api/v1/dealers/:dealerId/verification-documents/:documentId
 *
 * Der EINZIGE Weg, an einen hochgeladenen Gewerbenachweis heranzukommen -
 * es gibt bewusst keine öffentliche Datei-URL dafür (siehe
 * apps/web/src/lib/dealer-verification-storage.ts). Zugriff nur für
 * STAFF/ADMIN oder den Händler selbst (Inhaber), siehe Aufgabenstellung
 * "GEWERBESCHEIN SICHER SPEICHERN": "Andere Händler und Kunden dürfen
 * NIEMALS darauf zugreifen."
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string; documentId: string }> },
) {
  const { dealerId, documentId } = await params;

  const ctx = await getAuthContext();
  if (!ctx.userId) {
    return NextResponse.json({ error: "Anmeldung erforderlich" }, { status: 401 });
  }

  const document = await prisma.dealerVerificationDocument.findUnique({
    where: { id: documentId },
    include: { dealer: { select: { id: true, ownerUserId: true } } },
  });

  if (!document || document.dealer.id !== dealerId) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const isStaff = STAFF_ROLES.includes(ctx.role);
  const isOwner = document.dealer.ownerUserId === ctx.userId;
  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  try {
    const bytes = await readDealerVerificationDocument(document.storageKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalFileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Datei nicht verfügbar" }, { status: 500 });
  }
}
