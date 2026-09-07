import { NextResponse } from "next/server";
import { prisma, hashPassword } from "@autoklick24/database";
import { registerSchema } from "@autoklick24/validation";

/**
 * POST /api/v1/auth/register
 *
 * Bewusst als eigenständiger API-Endpunkt (nicht nur als Server Action der
 * Website) implementiert: dieselbe Route wird später von der Mobile App
 * genutzt (siehe docs/ARCHITECTURE.md, "App-Strategie").
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { email, password, firstName, lastName, phone } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Bewusst keine Info, OB die E-Mail existiert, in der Fehlermeldung an den Client durchreichen? -> hier ok,
    // da Registrierung selbst schon eine Existenzprüfung erfordert; keine sensiblen Zusatzdaten werden preisgegeben.
    return NextResponse.json(
      { error: "Für diese E-Mail existiert bereits ein Konto" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: { firstName, lastName, phone },
      },
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
