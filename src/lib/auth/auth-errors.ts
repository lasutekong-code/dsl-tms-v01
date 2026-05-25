export function getAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 관리자에게 문의하십시오.";
  }

  if (normalized.includes("too many requests")) {
    return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  return "로그인에 실패했습니다. 다시 시도해 주세요.";
}
