/** ID tampilan (mis. "P-007", "U-001") yang dipakai di URL dan UI; di database tetap integer. */
const make = (prefix: string) => ({
  format: (id: number) => `${prefix}-${String(id).padStart(3, "0")}`,
  parse: (code: string): number | null => {
    const m = new RegExp(`^${prefix}-(\\d+)$`).exec(code);
    const n = m ? Number(m[1]) : NaN;
    return Number.isSafeInteger(n) && n > 0 && n <= 2147483647 ? n : null;
  },
});

export const promptCode = make("P");
export const userCode = make("U");
