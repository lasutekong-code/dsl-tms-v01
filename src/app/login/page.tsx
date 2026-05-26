import { redirect } from "next/navigation";
import { getProfile, signOutIfInactiveProfile } from "@/lib/auth/get-profile";
import { getRedirectPathForRole } from "@/lib/auth/role-redirect";
import { INACTIVE_MESSAGE } from "@/lib/auth/messages";
import { LoginForm } from "@/components/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function resolveServerError(code: string | undefined): string | undefined {
  if (code === "inactive") return INACTIVE_MESSAGE;
  if (code === "access_denied") {
    return "접근 권한이 없습니다. 관리자에게 문의하세요.";
  }
  return undefined;
}

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3 lg:justify-start">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2196f3] text-sm font-semibold text-white"
        aria-hidden
      >
        V
      </div>
      <span className="text-base font-semibold text-[#171717]">
        차량관리 시스템
      </span>
    </div>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const wasInactiveSession = await signOutIfInactiveProfile();
  const profile = await getProfile();
  const params = await searchParams;
  const serverError =
    resolveServerError(params.error) ??
    (wasInactiveSession ? INACTIVE_MESSAGE : undefined);

  if (profile?.is_active) {
    redirect(getRedirectPathForRole(profile.role));
  }

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-[#fafafa] lg:flex-row">
      <aside className="hidden border-b border-[#e5e5e5] bg-white px-8 py-10 lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r xl:w-96">
        <BrandMark />
        <div className="mt-10 flex-1">
          <h1 className="text-xl font-semibold text-[#171717]">
            운송회사 차량관리
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#525252]">
            차량·운전자·거래처 정보를 안전하게 관리합니다. 역할에 따라 접근
            가능한 메뉴가 달라집니다.
          </p>
        </div>
        <p className="text-xs text-[#737373]">
          © 차량관리 시스템 · 허가된 사용자 전용
        </p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 w-full max-w-[400px] lg:hidden">
          <BrandMark />
        </div>

        <Card className="w-full max-w-[400px]">
          <CardHeader className="text-center sm:text-left">
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              업무 이메일과 비밀번호로 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm serverError={serverError} />
          </CardContent>
        </Card>

        <p className="mt-6 w-full max-w-[400px] text-center text-xs text-[#737373]">
          허가된 사용자만 접근할 수 있습니다.
        </p>
      </main>
    </div>
  );
}
