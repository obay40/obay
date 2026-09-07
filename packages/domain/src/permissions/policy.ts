import { Role } from "@autoklick24/types";

export interface AuthContext {
  userId: string | null;
  role: Role;
  dealerId?: string | null;
}

export const GUEST_CONTEXT: AuthContext = { userId: null, role: Role.GUEST as Role };

type PermissionCheck<TResource> = (ctx: AuthContext, resource?: TResource) => boolean;

const STAFF_ROLES: readonly Role[] = [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN];
const ADMIN_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

function hasAnyRole(ctx: AuthContext, roles: readonly Role[]): boolean {
  return roles.includes(ctx.role);
}

/**
 * Zentrale Policy-Registry: Resource × Action -> Prüf-Funktion.
 * Jede API-Route/Server-Action MUSS `can()` mit dieser Registry aufrufen,
 * statt Rollen direkt im Handler zu vergleichen (siehe packages/auth).
 */
export interface UserResource {
  id: string;
}

export interface DealerResource {
  id: string;
  ownerUserId: string;
}

const userPolicies: Record<string, PermissionCheck<UserResource>> = {
  read: (ctx, resource) =>
    hasAnyRole(ctx, STAFF_ROLES) || (resource !== undefined && ctx.userId === resource.id),
  update: (ctx, resource) =>
    hasAnyRole(ctx, ADMIN_ROLES) || (resource !== undefined && ctx.userId === resource.id),
  suspend: (ctx) => hasAnyRole(ctx, ADMIN_ROLES),
};

const dealerPolicies: Record<string, PermissionCheck<DealerResource>> = {
  read: () => true, // Händlerprofile sind öffentlich einsehbar
  update: (ctx, resource) =>
    hasAnyRole(ctx, ADMIN_ROLES) ||
    (resource !== undefined && ctx.dealerId === resource.id) ||
    (resource !== undefined && ctx.userId === resource.ownerUserId),
  verify: (ctx) => hasAnyRole(ctx, STAFF_ROLES),
  suspend: (ctx) => hasAnyRole(ctx, ADMIN_ROLES),
};

const auditLogPolicies: Record<string, PermissionCheck<never>> = {
  read: (ctx) => hasAnyRole(ctx, STAFF_ROLES),
};

const registry = {
  user: userPolicies,
  dealer: dealerPolicies,
  auditLog: auditLogPolicies,
} as const;

export type Resource = keyof typeof registry;

/**
 * `target` ist bewusst `unknown` (statt eines pro-Resource generischen Typs):
 * die Registry hält heterogene Policy-Maps, und ein präzise verzahnter
 * generischer Typ hier würde bei jeder neuen Resource brechen. Jede
 * einzelne Policy-Funktion oben ist dagegen voll typisiert.
 */
export function can(
  ctx: AuthContext,
  resource: Resource,
  action: string,
  target?: unknown,
): boolean {
  const policy = registry[resource]?.[action as keyof (typeof registry)[typeof resource]];
  if (!policy) return false;
  return (policy as PermissionCheck<unknown>)(ctx, target);
}

export class ForbiddenError extends Error {
  constructor(message = "Nicht berechtigt") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(
  ctx: AuthContext,
  resource: Resource,
  action: string,
  target?: unknown,
): void {
  if (!can(ctx, resource, action, target)) {
    throw new ForbiddenError(
      `Aktion "${action}" auf "${resource}" nicht erlaubt für Rolle ${ctx.role}`,
    );
  }
}
