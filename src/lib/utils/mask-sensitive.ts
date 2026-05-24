export function maskPhone(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 7) {
    return "***";
  }

  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

export function maskName(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.length <= 2) {
    return `${value[0]}*`;
  }

  return `${value[0]}${"*".repeat(value.length - 2)}${value[value.length - 1]}`;
}
