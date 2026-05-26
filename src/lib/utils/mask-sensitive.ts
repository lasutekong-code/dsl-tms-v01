export function maskPhone(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return "***";
  }

  if (digits.length >= 10 && digits.startsWith("010")) {
    return `010-****-${digits.slice(-4)}`;
  }

  if (digits.length >= 9) {
    return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
  }

  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskName(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 1) {
    return "*";
  }

  return `${trimmed[0]}${"*".repeat(trimmed.length - 1)}`;
}

const SENSITIVE_FIELD_PATTERNS = [
  /(^|_)(address|birth|birthday|resident|license|bank|account|tax|identity|secret|token)(_|$)/i,
  /(^|_)(vin|chassis_no|registration_no|business_no|id_number|owner_business_no|driver_license_no|cargo_license_no|insurance_rate)(_|$)/i,
];

export function isSensitiveFieldKey(key: string) {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key));
}
