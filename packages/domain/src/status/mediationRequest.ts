import { MediationRequestStatus } from "@autoklick24/types";
import { createStatusMachine } from "./statusMachine";

export const mediationRequestStatusMachine = createStatusMachine<MediationRequestStatus>(
  "MediationRequestStatus",
  {
    REQUESTED: [MediationRequestStatus.UNDER_REVIEW, MediationRequestStatus.CANCELLED],
    UNDER_REVIEW: [MediationRequestStatus.ACCEPTED, MediationRequestStatus.CANCELLED],
    ACCEPTED: [MediationRequestStatus.CONTRACT_PENDING, MediationRequestStatus.CANCELLED],
    CONTRACT_PENDING: [MediationRequestStatus.ACTIVE, MediationRequestStatus.CANCELLED],
    ACTIVE: [
      MediationRequestStatus.RESERVED,
      MediationRequestStatus.SOLD,
      MediationRequestStatus.CANCELLED,
    ],
    RESERVED: [
      MediationRequestStatus.ACTIVE,
      MediationRequestStatus.SOLD,
      MediationRequestStatus.CANCELLED,
    ],
    SOLD: [],
    CANCELLED: [],
  },
);
