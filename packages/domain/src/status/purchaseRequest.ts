import { PurchaseRequestStatus } from "@autoklick24/types";
import { createStatusMachine } from "./statusMachine";

export const purchaseRequestStatusMachine = createStatusMachine<PurchaseRequestStatus>(
  "PurchaseRequestStatus",
  {
    PURCHASE_REQUESTED: [
      PurchaseRequestStatus.PURCHASE_REVIEW,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    PURCHASE_REVIEW: [
      PurchaseRequestStatus.OFFER_CREATED,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    OFFER_CREATED: [PurchaseRequestStatus.OFFER_ACCEPTED, PurchaseRequestStatus.PURCHASE_CANCELLED],
    OFFER_ACCEPTED: [
      PurchaseRequestStatus.DOCUMENTS_PENDING,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    DOCUMENTS_PENDING: [
      PurchaseRequestStatus.PICKUP_PLANNING,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    PICKUP_PLANNING: [
      PurchaseRequestStatus.PICKUP_SCHEDULED,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    PICKUP_SCHEDULED: [
      PurchaseRequestStatus.VEHICLE_PICKED_UP,
      PurchaseRequestStatus.PURCHASE_CANCELLED,
    ],
    VEHICLE_PICKED_UP: [PurchaseRequestStatus.PAYMENT_PENDING],
    PAYMENT_PENDING: [PurchaseRequestStatus.PAYMENT_COMPLETED],
    PAYMENT_COMPLETED: [PurchaseRequestStatus.PURCHASE_COMPLETED],
    PURCHASE_COMPLETED: [],
    PURCHASE_CANCELLED: [],
  },
);
