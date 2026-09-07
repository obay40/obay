/**
 * Globale Benutzerrollen. Erweiterbar (z. B. INSPECTOR, DRIVER, SUPPORT),
 * ohne bestehende Berechtigungsprüfungen anzufassen – siehe
 * packages/domain/src/permissions.
 */
export const Role = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
  DEALER: "DEALER",
  DEALER_EMPLOYEE: "DEALER_EMPLOYEE",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Rollen innerhalb eines Händlerkontos (unabhängig von der globalen Role). */
export const DealerEmployeeRole = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  SALES: "SALES",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type DealerEmployeeRole = (typeof DealerEmployeeRole)[keyof typeof DealerEmployeeRole];
