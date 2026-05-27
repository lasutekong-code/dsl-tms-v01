/** Format ISO date or YYYY-MM-DD for display (Korea locale). */
export function formatDateKo(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const d = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return value;
  }

  const [y, m, day] = d.split("-");
  return `${y}.${m}.${day}`;
}
