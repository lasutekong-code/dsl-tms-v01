export function formatDisplayDate(value: string | null | undefined) {
  if (!value) {
    return "미정";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "정보 없음";
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("active") || normalized.includes("운행")) {
    return "운행중";
  }

  if (normalized.includes("idle") || normalized.includes("대기")) {
    return "대기";
  }

  if (normalized.includes("repair") || normalized.includes("정비")) {
    return "정비중";
  }

  return status;
}
