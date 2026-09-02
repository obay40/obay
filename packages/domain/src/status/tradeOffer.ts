import { TradeOfferStatus } from "@autoklick24/types";
import { createStatusMachine } from "./statusMachine";

export const tradeOfferStatusMachine = createStatusMachine<TradeOfferStatus>("TradeOfferStatus", {
  OPEN: [TradeOfferStatus.NEGOTIATING, TradeOfferStatus.DECLINED, TradeOfferStatus.CANCELLED],
  NEGOTIATING: [TradeOfferStatus.ACCEPTED, TradeOfferStatus.DECLINED, TradeOfferStatus.CANCELLED],
  ACCEPTED: [TradeOfferStatus.COMPLETED, TradeOfferStatus.CANCELLED],
  DECLINED: [],
  CANCELLED: [],
  COMPLETED: [],
});
