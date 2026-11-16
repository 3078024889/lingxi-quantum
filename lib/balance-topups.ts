// Shared display and validation policy; currencies have independent wallets.
export const BALANCE_TOPUP_AMOUNTS = [10, 88, 666, 888] as const;
export const MIN_CUSTOM_TOPUP = 0.01;
export const MAX_CUSTOM_TOPUP = 10000;

export function customTopupAmount(value: string): number | null {
  const minor = customTopupMinor(value);
  return minor === null ? null : minor / 100;
}

// Parse currency as integer minor units, never by multiplying a floating value.
export function customTopupMinor(value: string): number | null {
  if (!/^(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minor) && minor >= 1 && minor <= MAX_CUSTOM_TOPUP * 100 ? minor : null;
}
