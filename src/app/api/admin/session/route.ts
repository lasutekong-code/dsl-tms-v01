import { NextResponse } from "next/server";

import { getAdminOrResponse } from "@/lib/admin/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  return NextResponse.json({
    data: {
      profileId: gate.admin.profileId,
      userId: gate.admin.userId,
      loginId: gate.admin.loginId,
    },
  });
}
