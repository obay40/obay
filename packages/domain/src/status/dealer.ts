import { DealerStatus } from "@autoklick24/types";
import { createStatusMachine } from "./statusMachine";

export const dealerStatusMachine = createStatusMachine<DealerStatus>("DealerStatus", {
  PENDING: [
    DealerStatus.VERIFIED,
    DealerStatus.REJECTED,
    DealerStatus.NEEDS_MORE_INFORMATION,
  ],
  NEEDS_MORE_INFORMATION: [
    DealerStatus.PENDING,
    DealerStatus.VERIFIED,
    DealerStatus.REJECTED,
  ],
  VERIFIED: [DealerStatus.SUSPENDED],
  REJECTED: [DealerStatus.PENDING],
  SUSPENDED: [DealerStatus.VERIFIED, DealerStatus.REJECTED],
});
