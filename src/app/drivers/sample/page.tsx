import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";

/**
 * Demo page — replace the link with a real drivers.id from Supabase.
 */
export default async function DriverSamplePage() {
  const session = await getAppSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        ← 홈
      </Link>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-900">
          운전자 프로필
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Supabase <code className="text-xs">drivers</code> 테이블의{" "}
          <code className="text-xs">id</code>로 상세 페이지를 열 수 있습니다.
          사진은 <code className="text-xs">photo_path</code> 기준 signed URL로
          표시되며, 면허번호·생년월일·주소는 역할에 따라 숨겨집니다.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          예: <span className="font-mono">/drivers/&lt;uuid&gt;</span>
        </p>
      </div>
    </div>
  );
}
