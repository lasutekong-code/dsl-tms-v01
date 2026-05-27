export function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  return String(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function formatTonnage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  const formatted = Number.isInteger(value) ? String(value) : String(value).replace(/\.0+$/, "");

  return `${formatted}톤`;
}

export function formatMillimeters(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toLocaleString("ko-KR")}mm`;
}

export function formatKilograms(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toLocaleString("ko-KR")}kg`;
}

export function formatAddress(parts: {
  zip_code?: string | null;
  address1?: string | null;
  address2?: string | null;
}) {
  const segments = [parts.zip_code, parts.address1, parts.address2].filter(Boolean);

  if (segments.length === 0) {
    return "-";
  }

  return segments.join(" ");
}

export function daysUntil(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  const target = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
