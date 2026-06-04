"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { AddressCard } from "@/components/vehicle/address-card";
import { ClientCenterCard } from "@/components/vehicle/client-center-card";
import { ContractOwnerCard } from "@/components/vehicle/contract-owner-card";
import { DriverInfoCard } from "@/components/vehicle/driver-info-card";
import { DriverPhotoCard } from "@/components/vehicle/driver-photo-card";
import { InsuranceInspectionCard } from "@/components/vehicle/insurance-inspection-card";
import { MemoCard } from "@/components/vehicle/memo-card";
import { VehicleBasicInfoCard } from "@/components/vehicle/vehicle-basic-info-card";
import { VehiclePhotoGrid } from "@/components/vehicle/vehicle-photo-grid";
import { VehicleSpecCard } from "@/components/vehicle/vehicle-spec-card";
import { VehicleSummaryCard } from "@/components/vehicle/vehicle-summary-card";
import {
  DueDateWarningBadge,
  VehicleStatusBadge,
} from "@/components/vehicle/vehicle-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTonnage } from "@/lib/vehicles/format";
import {
  getVehicleDetailReturnTo,
  resolveVehicleDetailBackHref,
} from "@/lib/vehicles/vehicle-detail-return";
import type { VehicleDetail } from "@/types/vehicle";

type LoadState =
  | { status: "loading" }
  | { status: "success"; data: VehicleDetail }
  | { status: "inactive" }
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "error"; message: string };

type VehicleDetailPageProps = {
  vehicleId: string;
  backHref?: string;
};

export function VehicleDetailPage({ vehicleId, backHref: backHrefProp = "/search" }: VehicleDetailPageProps) {
  const searchParams = useSearchParams();
  const backHref = useMemo(() => {
    const fromQuery = searchParams.get("from");
    const fromStorage = getVehicleDetailReturnTo();
    return resolveVehicleDetailBackHref(fromQuery ?? fromStorage ?? backHrefProp);
  }, [backHrefProp, searchParams]);

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      setState({ status: "loading" });

      const response = await fetch(`/api/vehicles/${vehicleId}`, { cache: "no-store" });

      if (!active) {
        return;
      }

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        const body = (await response.json().catch(() => ({}))) as { code?: string };
        setState(body.code === "inactive" ? { status: "inactive" } : { status: "forbidden" });
        return;
      }

      if (response.status === 404) {
        setState({ status: "not_found" });
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setState({ status: "error", message: body.error ?? "차량 정보를 불러오지 못했습니다." });
        return;
      }

      const data = (await response.json()) as VehicleDetail;
      setState({ status: "success", data });
    }

    void load();

    return () => {
      active = false;
    };
  }, [vehicleId]);

  if (state.status === "loading") {
    return <VehicleDetailSkeleton backHref={backHref} />;
  }

  if (state.status === "inactive") {
    return (
      <AccessDenied
        backHref={backHref}
        title="계정 비활성화"
        description="비활성화된 계정은 차량 상세를 조회할 수 없습니다. 관리자에게 문의하세요."
      />
    );
  }

  if (state.status === "forbidden") {
    return (
      <AccessDenied
        backHref={backHref}
        title="접근 권한 없음"
        description="이 차량에 대한 조회 권한이 없습니다."
      />
    );
  }

  if (state.status === "not_found") {
    return (
      <AccessDenied
        backHref={backHref}
        title="차량을 찾을 수 없음"
        description="요청한 차량이 존재하지 않거나 삭제되었습니다."
      />
    );
  }

  if (state.status === "error") {
    return (
      <AccessDenied backHref={backHref} title="오류 발생" description={state.message} />
    );
  }

  const detail = state.data;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Link>
        </Button>

        <Card className="border-slate-200 bg-white">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-slate-500">차량 상세</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {detail.vehicle_no ?? "-"}
                  </h1>
                  <VehicleStatusBadge status={detail.status} />
                </div>
                <p className="text-sm text-slate-600">
                  {detail.client_name ?? "-"} · {detail.center_name ?? "-"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <DueDateWarningBadge label="보험갱신" date={detail.insurance_renewal_date} />
                <DueDateWarningBadge label="차량점검" date={detail.latest_inspection_date} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 md:grid-cols-4">
              <HeaderStat label="운전자" value={detail.driver_name} />
              <HeaderStat label="톤급" value={formatTonnage(detail.tonnage)} />
              <HeaderStat label="특장상태" value={detail.special_equipment} />
              <HeaderStat label="차명" value={detail.car_name} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <VehicleSummaryCard detail={detail} />
        <DriverInfoCard detail={detail} />
        <ClientCenterCard detail={detail} />
        <VehicleBasicInfoCard detail={detail} />
        <VehicleSpecCard detail={detail} />
        <InsuranceInspectionCard detail={detail} />
        <ContractOwnerCard detail={detail} />
        <AddressCard detail={detail} />
        <MemoCard detail={detail} />
        <DriverPhotoCard
          vehicleId={detail.vehicle_id}
          driverName={detail.driver_name}
          photo={detail.driver_photo}
        />
        <VehiclePhotoGrid vehicleId={detail.vehicle_id} photos={detail.vehicle_photos} />
      </div>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value ?? "-"}</p>
    </div>
  );
}

function AccessDenied({
  backHref,
  title,
  description,
}: {
  backHref: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
      <Button asChild variant="outline">
        <Link href={backHref}>돌아가기</Link>
      </Button>
    </div>
  );
}

function VehicleDetailSkeleton({ backHref }: { backHref: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
      </Button>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl md:col-span-2" />
      </div>
    </div>
  );
}
