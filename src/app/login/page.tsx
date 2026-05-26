import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getAppSession } from "@/lib/auth/session";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "접근 권한이 없습니다. 관리자에게 문의하세요.",
  forbidden: "이 페이지에 접근할 권한이 없습니다.",
};

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2196f3] text-sm font-semibold text-white"
        aria-hidden
      >
        L
      </div>
      <span className="text-base font-semibold text-[#171717]">차량관리</span>
    </div>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAppSession();
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/")
    ? params.redirect
    : "/";
  const serverError = params.error
    ? ERROR_MESSAGES[params.error] ?? "로그인에 실패했습니다."
    : undefined;

  if (session) {
    redirect(redirectTo);
  }

  return (
    <div className="flex min-h-dvh bg-[#fafafa]">
      {/* Figma 사이드바(256px) 톤 — 데스크톱 브랜드 영역 */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e5e5e5] bg-white px-6 py-8 lg:flex">
        <BrandMark />
        <div className="mt-10 flex flex-1 flex-col">
          <h1 className="text-xl font-semibold leading-snug text-[#171717]">
            관리자 대시보드
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#525252]">
            차량·운전자·거래처를 한곳에서 관리합니다. 역할에 따라 메뉴와
            운전자 정보 접근 범위가 달라집니다.
          </p>
        </div>
        <ul className="space-y-3 border-t border-[#e5e5e5] pt-6 text-xs leading-relaxed text-[#737373]">
          <li>운전자 사진: Storage signed URL</li>
          <li>면허·생년월일·주소: admin/manager만 조회</li>
        </ul>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 w-full max-w-[400px] lg:hidden">
          <BrandMark />
          <p className="mt-4 text-sm text-[#525252]">관리자 대시보드 로그인</p>
        </div>

        <div className="w-full max-w-[400px] rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[#171717]">로그인</h2>
          <p className="mt-1 text-sm text-[#525252]">
            업무 이메일과 비밀번호를 입력하세요.
          </p>
          <div className="mt-6">
            <LoginForm redirectTo={redirectTo} serverError={serverError} />
          </div>
        </div>

        <p className="mt-6 max-w-[400px] text-center text-xs text-[#737373]">
          계정 문의: 시스템 관리자
        </p>
      </main>
    </div>
  );
}
