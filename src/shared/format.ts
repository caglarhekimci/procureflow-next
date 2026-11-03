export const money = (minor: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(minor / 100);
export const shortDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(date));
export function toMinorUnits(input: string) {
  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(input))
    throw new Error('Use a decimal amount with up to two digits after the point');
  const [whole, fraction = ''] = input.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result)) throw new Error('Amount is too large');
  return result;
}
