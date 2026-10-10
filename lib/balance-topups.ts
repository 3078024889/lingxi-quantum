// Shared display and validation policy; currencies have independent wallets.
export const BALANCE_TOPUP_AMOUNTS = [10, 88, 666, 888] as const;
export const MIN_CUSTOM_TOPUP = 10;
export const MAX_CUSTOM_TOPUP = 10000;

export function customTopupAmount(value: string): number | null {
  if (!/^[1-9][0-9]{1,4}$/.test(value)) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= MIN_CUSTOM_TOPUP && amount <= MAX_CUSTOM_TOPUP ? amount : null;
}
