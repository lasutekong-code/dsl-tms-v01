import Link from "next/link";
import { redirect } from "next/navigation";
import { DriverProfileCard } from "@/components/drivers/driver-profile-card";
import { getAppSession } from "@/lib/auth/session";
import { getDriverSafeView } from "@/lib/drivers/get-driver-view";

type DriverPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DriverDetailPage({ params }: DriverPageProps) {
  const session = await getAppSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const driver = await getDriverSafeView(id, session.role);

  if (!driver) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-slate-600">운전자 정보를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-700">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        ← 홈
      </Link>
      <div className="mt-6">
        <DriverProfileCard driver={driver} />
      </div>
    </div>
  );
}
