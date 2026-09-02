import { Role } from "@autoklick24/types";
import { GUEST_CONTEXT, type AuthContext } from "@autoklick24/domain";
import { auth } from "./config";

export class UnauthorizedError extends Error {
  constructor(message = "Anmeldung erforderlich") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Liest die aktuelle Session serverseitig (Route Handler, Server Component,
 * Server Action) und liefert einen AuthContext für packages/domain's
 * Berechtigungsprüfungen (`can`/`assertCan`). Kein eingeloggter Nutzer ->
 * GUEST_CONTEXT, nie `null`, damit Aufrufer nicht separat auf null prüfen müssen.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const session = await auth();
  if (!session?.user) return GUEST_CONTEXT;
  return {
    userId: session.user.id,
    role: session.user.role,
  };
}

/** Wirft, wenn niemand eingeloggt ist. Gibt sonst den AuthContext zurück. */
export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx.userId) throw new UnauthorizedError();
  return ctx;
}

/**
 * Wirft, wenn niemand eingeloggt ist ODER die Rolle nicht in `allowedRoles`
 * enthalten ist. IMMER serverseitig in API-Route-Handlern/Server Actions
 * aufrufen – niemals nur UI-seitig anhand der Rolle etwas verstecken.
 */
export async function requireRole(allowedRoles: readonly Role[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!allowedRoles.includes(ctx.role)) {
    throw new UnauthorizedError(
      `Diese Aktion erfordert eine der Rollen: ${allowedRoles.join(", ")}`,
    );
  }
  return ctx;
}

export const STAFF_ROLES: readonly Role[] = [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN];
export const ADMIN_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
export const DEALER_ROLES: readonly Role[] = [Role.DEALER, Role.DEALER_EMPLOYEE];
