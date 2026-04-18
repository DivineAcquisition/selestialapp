/**
 * Phone number formatter ported from AlphaLuxClean's `validation-utils.ts`.
 * Returns a (XXX) XXX-XXXX display string for any input that contains 10+
 * digits; otherwise echoes the input unchanged.
 */
export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    const areaCode = digitsOnly.slice(-10, -7);
    const prefix = digitsOnly.slice(-7, -4);
    const number = digitsOnly.slice(-4);
    return `(${areaCode}) ${prefix}-${number}`;
  }
  return phone;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}
