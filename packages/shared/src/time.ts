/** Server clock sync: the offset is learned from a server timestamp and applied to Date.now(). */
let offsetMs = 0;

export function syncServerTime(serverIso: string, receivedAt: number = Date.now()): void {
  const t = Date.parse(serverIso);
  if (Number.isFinite(t)) offsetMs = t - receivedAt;
}

export function serverNow(): number {
  return Date.now() + offsetMs;
}
