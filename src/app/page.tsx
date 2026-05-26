import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { getAppSession } from "@/lib/auth/session";
import { canViewDriverPii } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAppSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const showForbidden = params.error === "forbidden";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            DSL TMS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            안녕하세요, {session.user.full_name ?? session.email}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            역할: <span className="font-medium">{session.role}</span>
            {canViewDriverPii(session.role)
              ? " · 운전자 민감정보 조회 가능"
              : " · 운전자 민감정보 조회 불가"}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </form>
      </header>

      {showForbidden ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          요청한 페이지에 접근할 권한이 없습니다.
        </p>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">빠른 메뉴</h2>
        <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/drivers/sample"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:border-blue-300"
          >
            운전자 프로필 예시
          </Link>
          <Link
            href="/dispatch"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:border-blue-300"
          >
            배차 (dispatcher+)
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:border-blue-300"
          >
            관리 (admin)
          </Link>
        </nav>
      </section>
    </div>
  );
}
