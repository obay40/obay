import { ListingStatus } from "@autoklick24/types";
import { createStatusMachine } from "./statusMachine";

/**
 * SOLD/DELETED/EXPIRED sind bewusst Endzustände ohne Rückweg – eine erneute
 * Aktivierung erfordert ein neues Listing bzw. einen kontrollierten
 * Admin-Prozess außerhalb dieser Maschine.
 */
export const listingStatusMachine = createStatusMachine<ListingStatus>("ListingStatus", {
  DRAFT: [ListingStatus.PENDING_REVIEW, ListingStatus.DELETED],
  PENDING_REVIEW: [ListingStatus.ACTIVE, ListingStatus.REJECTED, ListingStatus.DELETED],
  ACTIVE: [
    ListingStatus.PAUSED,
    ListingStatus.RESERVED,
    ListingStatus.SOLD,
    ListingStatus.EXPIRED,
    ListingStatus.DELETED,
  ],
  PAUSED: [ListingStatus.ACTIVE, ListingStatus.DELETED],
  RESERVED: [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.DELETED],
  SOLD: [],
  EXPIRED: [ListingStatus.ACTIVE, ListingStatus.DELETED],
  REJECTED: [ListingStatus.DRAFT, ListingStatus.DELETED],
  DELETED: [],
});
