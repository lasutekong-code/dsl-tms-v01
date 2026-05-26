"use client";

import Link from "next/link";
import { Building2, Calendar, Car, Gauge, Shield, User, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDisplayDate, formatStatusLabel } from "@/lib/vehicles/format";
import type { VehicleSearchResult } from "@/types/vehicle";

type VehicleResultCardProps = {
  vehicle: VehicleSearchResult;
};

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-muted-foreground">{label}</span>
        <p className="truncate font-medium text-[#404040]">{value}</p>
      </div>
    </div>
  );
}

export function VehicleResultCard({ vehicle }: VehicleResultCardProps) {
  const statusLabel = formatStatusLabel(vehicle.status);

  return (
    <Link className="group block h-full" href={`/vehicles/${vehicle.vehicle_id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]">
          <Car className="size-14 text-[#a3a3a3]" />
        </div>

        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-foreground group-hover:text-primary">
                {vehicle.vehicle_no ?? "차량번호 미등록"}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {vehicle.car_name ?? "차명 미등록"}
                {vehicle.tonnage ? ` · ${vehicle.tonnage}` : ""}
                {vehicle.model_year ? ` · ${vehicle.model_year}년식` : ""}
              </p>
            </div>
            <Badge>{statusLabel}</Badge>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={User}
              label="운전자"
              value={
                vehicle.driver_name
                  ? `${vehicle.driver_name}${vehicle.driver_phone ? ` (${vehicle.driver_phone})` : ""}`
                  : "운전자 미지정"
              }
            />
            <InfoRow
              icon={Building2}
              label="거래처 / 센터"
              value={`${vehicle.client_name ?? "거래처 미지정"} / ${vehicle.center_name ?? "센터 미지정"}`}
            />
            <InfoRow
              icon={Wrench}
              label="특장상태"
              value={vehicle.special_equipment ?? "미등록"}
            />
          </div>

          <div className="mt-auto grid gap-2 border-t border-[#f5f5f5] pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1">
                <Shield className="size-3.5" />
                보험갱신일
              </span>
              <span>{formatDisplayDate(vehicle.insurance_renewal_date)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                최근 차량점검일
              </span>
              <span>{formatDisplayDate(vehicle.latest_inspection_date)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1">
                <Gauge className="size-3.5" />
                톤급
              </span>
              <span>{vehicle.tonnage ?? "미등록"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
