export function maskPhone(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 7) {
    return "***";
  }

  const prefix = digits.length >= 10 ? digits.slice(0, 3) : digits.slice(0, 2);
  const suffix = digits.slice(-4);

  return `${prefix}-****-${suffix}`;
}

export function maskName(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 1) {
    return "*";
  }

  if (trimmed.length === 2) {
    return `${trimmed[0]}*`;
  }

  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
}
