import { NextResponse } from "next/server";
import { prisma, hashPassword } from "@autoklick24/database";
import { Role } from "@autoklick24/types";
import { dealerAccountRegistrationSchema } from "@autoklick24/validation";
import {
  DealerDocumentValidationError,
  saveDealerVerificationDocument,
} from "@/lib/dealer-verification-storage";

/**
 * POST /api/v1/dealers/register
 *
 * Eigenständiger Endpunkt für die Händlerregistrierung (siehe
 * Aufgabenstellung "HÄNDLERREGISTRIERUNG"), bewusst getrennt von
 * /api/v1/auth/register: legt zusätzlich Dealer + Address an, verlangt den
 * Gewerbenachweis als Pflicht-Upload und setzt NIE sofort VERIFIED (Status
 * startet immer bei PENDING, siehe DealerStatus).
 *
 * multipart/form-data statt JSON, weil der Gewerbenachweis als Datei
 * mitgeschickt wird.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : undefined;
  };

  const parsed = dealerAccountRegistrationSchema.safeParse({
    companyName: field("companyName"),
    legalForm: field("legalForm") || undefined,
    contactFirstName: field("contactFirstName"),
    contactLastName: field("contactLastName"),
    contactEmail: field("contactEmail"),
    contactPhone: field("contactPhone"),
    website: field("website") || undefined,
    vatId: field("vatId") || undefined,
    commercialRegisterNumber: field("commercialRegisterNumber") || undefined,
    description: field("description") || undefined,
    address: {
      street: field("street"),
      houseNumber: field("houseNumber"),
      postalCode: field("postalCode"),
      city: field("city"),
      country: field("country") || "DE",
    },
    password: field("password"),
    acceptedTerms: field("acceptedTerms") === "on" || field("acceptedTerms") === "true",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const verificationDocument = formData.get("verificationDocument");
  if (!(verificationDocument instanceof File) || verificationDocument.size === 0) {
    return NextResponse.json(
      { error: "Gewerbenachweis (PDF, JPG oder PNG) ist erforderlich" },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email: data.contactEmail } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Für diese E-Mail existiert bereits ein Konto" },
      { status: 409 },
    );
  }

  let storedDocument;
  try {
    storedDocument = await saveDealerVerificationDocument(verificationDocument);
  } catch (error) {
    if (error instanceof DealerDocumentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    // Absichtlich kein Dateiinhalt/Stacktrace in der Antwort (siehe
    // Aufgabenstellung "Keine Dateiinhalte in Fehlermeldungen ausgeben").
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }

  const passwordHash = await hashPassword(data.password);

  const dealer = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        email: data.contactEmail,
        passwordHash,
        role: Role.DEALER,
        profile: {
          create: { firstName: data.contactFirstName, lastName: data.contactLastName },
        },
      },
    });

    const address = await tx.address.create({
      data: {
        userId: owner.id,
        type: "BUSINESS",
        street: data.address.street,
        houseNumber: data.address.houseNumber,
        postalCode: data.address.postalCode,
        city: data.address.city,
        country: data.address.country,
      },
    });

    return tx.dealer.create({
      data: {
        ownerUserId: owner.id,
        companyName: data.companyName,
        legalForm: data.legalForm,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        website: data.website || undefined,
        vatId: data.vatId,
        commercialRegisterNumber: data.commercialRegisterNumber,
        description: data.description,
        addressId: address.id,
        // Status startet immer bei PENDING - niemals hier direkt VERIFIED
        // setzen (siehe Aufgabenstellung "KEINE SOFORTIGE
        // HÄNDLERFREISCHALTUNG").
        verificationSubmittedAt: new Date(),
        employees: {
          create: { userId: owner.id, role: "OWNER" },
        },
        verificationDocuments: {
          create: {
            documentType: "TRADE_LICENSE",
            storageKey: storedDocument.storageKey,
            originalFileName: storedDocument.originalFileName,
            mimeType: storedDocument.mimeType,
            fileSize: storedDocument.fileSize,
          },
        },
      },
      select: { id: true, companyName: true, status: true },
    });
  });

  return NextResponse.json({ dealer }, { status: 201 });
}
