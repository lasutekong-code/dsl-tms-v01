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
    <div className="flex min-h-full flex-1 flex-col bg-slate-100 lg:flex-row">
      <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              DSL TMS
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              운송 관리 시스템
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              업무 계정으로 로그인하세요. 역할에 따라 메뉴와 운전자 정보 접근
              범위가 달라집니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              로그인
            </h2>
            <LoginForm redirectTo={redirectTo} serverError={serverError} />
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            계정 문의: 시스템 관리자
          </p>
        </div>
      </section>

      <aside className="hidden flex-1 flex-col justify-center border-t border-slate-200 bg-slate-900 px-10 py-12 text-slate-100 lg:flex lg:border-t-0 lg:border-l">
        <h2 className="text-xl font-semibold">업무용 접근 정책</h2>
        <ul className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
          <li>
            <span className="font-medium text-white">역할 기반 메뉴</span>
            <br />
            admin · manager · dispatcher · driver · viewer
          </li>
          <li>
            <span className="font-medium text-white">운전자 사진</span>
            <br />
            Storage signed URL로만 표시
          </li>
          <li>
            <span className="font-medium text-white">민감 정보</span>
            <br />
            면허번호, 생년월일, 주소는 admin/manager만 조회
          </li>
        </ul>
      </aside>
    </div>
  );
}
