// Romanian number formatting without relying on Intl support in the JS engine.

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 1234.5 -> "1.234,50 RON"
export function formatRon(value: number): string {
  const [whole, fraction] = Math.abs(value).toFixed(2).split(".");
  const sign = value < 0 ? "-" : "";
  return `${sign}${groupThousands(whole)},${fraction} RON`;
}

// 152300 -> "152.300 km"
export function formatKm(value: number): string {
  return `${groupThousands(String(value))} km`;
}
