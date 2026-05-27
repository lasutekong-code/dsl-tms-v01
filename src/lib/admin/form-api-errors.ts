import type { FieldValues, UseFormSetError } from "react-hook-form";

export function parseApiErrorMessage(payload: unknown, fallback = "요청 처리 중 오류가 발생했습니다."): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return fallback;
}

export function getApiFieldErrors(payload: unknown): Record<string, string[]> | undefined {
  if (!payload || typeof payload !== "object" || !("fields" in payload)) {
    return undefined;
  }

  const fields = (payload as { fields?: Record<string, string[]> }).fields;
  return fields && typeof fields === "object" ? fields : undefined;
}

export function applyApiFieldErrors<T extends FieldValues>(
  payload: unknown,
  setError: UseFormSetError<T>,
): boolean {
  const fields = getApiFieldErrors(payload);
  if (!fields) {
    return false;
  }

  for (const [key, msgs] of Object.entries(fields)) {
    if (msgs?.[0]) {
      setError(key as Parameters<UseFormSetError<T>>[0], { message: msgs[0] });
    }
  }

  return true;
}
