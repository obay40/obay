/**
 * Generische Statusmaschine. Verhindert willkürliche String-Übergänge im
 * Code (z. B. ein SOLD-Listing, das ohne kontrollierten Prozess wieder
 * ACTIVE wird) – jeder Übergang muss hier explizit erlaubt sein.
 */
export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly machine: string,
  ) {
    super(`Ungültiger Statusübergang in ${machine}: ${from} -> ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export function createStatusMachine<TStatus extends string>(
  name: string,
  transitions: Record<TStatus, readonly TStatus[]>,
) {
  function canTransition(from: TStatus, to: TStatus): boolean {
    if (from === to) return false;
    return transitions[from]?.includes(to) ?? false;
  }

  function assertTransition(from: TStatus, to: TStatus): void {
    if (!canTransition(from, to)) {
      throw new InvalidStatusTransitionError(from, to, name);
    }
  }

  function nextPossibleStatuses(from: TStatus): readonly TStatus[] {
    return transitions[from] ?? [];
  }

  return { name, canTransition, assertTransition, nextPossibleStatuses };
}
