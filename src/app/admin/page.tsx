import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";

export default async function AdminPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        ← 홈
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">관리</h1>
      <p className="mt-2 text-sm text-slate-600">
        admin 역할에서만 접근 가능합니다.
      </p>
    </div>
  );
}
