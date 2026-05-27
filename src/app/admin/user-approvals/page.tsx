import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserApprovalsPanel } from "@/components/admin/user-approvals-panel";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUserApprovalsPage() {
  const supabase = await createClient();

  const [{ data: pendingUsers }, { data: pendingRequests }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, name, email, phone, created_at")
      .eq("is_active", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("account_requests")
      .select("id, request_type, email, name, role, message, created_at, profile_id")
      .eq("status", "pending")
      .in("request_type", ["find_id", "find_password"])
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="사용자 승인"
        description="신규 가입 및 아이디·비밀번호 찾기 요청을 검토하고 로그인을 승인합니다."
      />
      <UserApprovalsPanel
        pendingUsers={(pendingUsers ?? []).map((u) => ({
          id: u.id,
          role: u.role,
          name: u.name,
          email: u.email,
          phone: u.phone ?? null,
          created_at: u.created_at ?? null,
        }))}
        pendingRequests={pendingRequests ?? []}
      />
    </div>
  );
}
