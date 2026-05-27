import { NextResponse } from "next/server";

import { requireAdmin, type AdminSession } from "@/lib/auth/require-admin";

export type AdminOk = Extract<AdminSession, { ok: true }>;

export async function getAdminOrResponse(): Promise<
  { ok: true; admin: AdminOk } | { ok: false; response: NextResponse }
> {
  const admin = await requireAdmin();
  if (admin.ok) {
    return { ok: true, admin };
  }

  const response = NextResponse.json(
    { error: admin.reason === "unauthenticated" ? "로그인이 필요합니다." : "관리자만 접근할 수 있습니다." },
    { status: admin.reason === "unauthenticated" ? 401 : 403 },
  );

  return { ok: false, response };
}

export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
