/**
 * Zentrale Status-Enums. Erlaubte Übergänge werden NICHT hier, sondern in
 * packages/domain/src/status definiert – diese Datei enthält nur die
 * möglichen Werte, damit Web, API und künftige App dieselben Strings nutzen.
 */

export const DealerStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  NEEDS_MORE_INFORMATION: "NEEDS_MORE_INFORMATION",
  SUSPENDED: "SUSPENDED",
} as const;
export type DealerStatus = (typeof DealerStatus)[keyof typeof DealerStatus];

export const ListingStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED",
  DELETED: "DELETED",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const PurchaseRequestStatus = {
  PURCHASE_REQUESTED: "PURCHASE_REQUESTED",
  PURCHASE_REVIEW: "PURCHASE_REVIEW",
  OFFER_CREATED: "OFFER_CREATED",
  OFFER_ACCEPTED: "OFFER_ACCEPTED",
  DOCUMENTS_PENDING: "DOCUMENTS_PENDING",
  PICKUP_PLANNING: "PICKUP_PLANNING",
  PICKUP_SCHEDULED: "PICKUP_SCHEDULED",
  VEHICLE_PICKED_UP: "VEHICLE_PICKED_UP",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_COMPLETED: "PAYMENT_COMPLETED",
  PURCHASE_COMPLETED: "PURCHASE_COMPLETED",
  PURCHASE_CANCELLED: "PURCHASE_CANCELLED",
} as const;
export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

export const MediationRequestStatus = {
  REQUESTED: "REQUESTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ACCEPTED: "ACCEPTED",
  CONTRACT_PENDING: "CONTRACT_PENDING",
  ACTIVE: "ACTIVE",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  CANCELLED: "CANCELLED",
} as const;
export type MediationRequestStatus =
  (typeof MediationRequestStatus)[keyof typeof MediationRequestStatus];

export const TradeOfferStatus = {
  OPEN: "OPEN",
  NEGOTIATING: "NEGOTIATING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type TradeOfferStatus = (typeof TradeOfferStatus)[keyof typeof TradeOfferStatus];

export const LeadType = {
  PURCHASE: "PURCHASE",
  MEDIATION: "MEDIATION",
  SALES: "SALES",
  DEALER: "DEALER",
  SUPPORT: "SUPPORT",
} as const;
export type LeadType = (typeof LeadType)[keyof typeof LeadType];

export const LeadStatus = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_ON_CUSTOMER: "WAITING_ON_CUSTOMER",
  QUALIFIED: "QUALIFIED",
  WON: "WON",
  LOST: "LOST",
  CLOSED: "CLOSED",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const NotificationChannel = {
  EMAIL: "EMAIL",
  IN_APP: "IN_APP",
  PUSH: "PUSH",
  SMS: "SMS",
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const SellerType = {
  PRIVATE: "PRIVATE",
  DEALER: "DEALER",
} as const;
export type SellerType = (typeof SellerType)[keyof typeof SellerType];

export const SubscriptionPlanKey = {
  FREE: "FREE",
  PRO: "PRO",
  UNLIMITED: "UNLIMITED",
} as const;
export type SubscriptionPlanKey = (typeof SubscriptionPlanKey)[keyof typeof SubscriptionPlanKey];
