import { VehicleDetailPage } from "@/components/vehicle/vehicle-detail-page";
import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/get-profile";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

// 안전한 복귀 경로 화이트리스트
const ALLOWED_BACK_PREFIXES = [
  "/admin/drivers",
  "/admin/owners",
  "/admin/vehicles",
  "/admin/assignments",
  "/admin/insurances",
  "/admin/inspections",
  "/admin/contracts",
  "/admin/clients",
  "/admin/centers",
  "/admin/client-contacts",
  "/search",
];

function sanitizeBackHref(from: string | undefined): string {
  if (!from) return "/search";

  let decoded: string;
  try {
    decoded = decodeURIComponent(from);
  } catch {
    return "/search";
  }

  // 외부 URL / 프로토콜 상대 URL 차단
  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/search";
  }

  // 화이트리스트에 등록된 경로인지 확인
  const pathOnly = decoded.split("?")[0];
  const isAllowed = ALLOWED_BACK_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`),
  );

  return isAllowed ? decoded : "/search";
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const backHref = sanitizeBackHref(sp?.from);
  const profile = await requireProfile();

  return (
    <AppShell profile={profile}>
      <VehicleDetailPage vehicleId={id} backHref={backHref} />
    </AppShell>
  );
}