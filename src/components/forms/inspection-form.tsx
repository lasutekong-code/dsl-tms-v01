"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminRecordMeta } from "@/components/admin/admin-record-meta";
import { DateYmdInput } from "@/components/admin/date-ymd-input";
import { FieldGrid } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VehicleInspectionRow } from "@/types/database";

const formSchema = z.object({
  vehicle_id: z.string().uuid(),
  inspection_date: z.string().min(1),
  inspection_type: z.string().optional(),
  inspection_station_name: z.string().optional(),
  result: z.string().optional(),
  memo: z.string().optional(),
});

export type InspectionFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function InspectionForm({
  mode,
  defaultValues,
  vehicles,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<VehicleInspectionRow> | null;
  vehicles: { id: string; vehicle_no: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: defaultValues?.vehicle_id ?? "",
      inspection_date: defaultValues?.inspection_date?.slice(0, 10) ?? "",
      inspection_type: defaultValues?.inspection_type ?? "",
      inspection_station_name: defaultValues?.inspection_station_name ?? "",
      result: defaultValues?.result ?? "",
      memo: defaultValues?.memo ?? "",
    },
  });

  async function onSubmit(values: InspectionFormValues) {
    setPending(true);
    try {
      const body = {
        vehicle_id: values.vehicle_id,
        inspection_date: values.inspection_date,
        inspection_type: values.inspection_type?.trim() ? values.inspection_type.trim() : null,
        inspection_station_name: values.inspection_station_name?.trim() ? values.inspection_station_name.trim() : null,
        result: values.result?.trim() ? values.result.trim() : null,
        memo: values.memo?.trim() ? values.memo.trim() : null,
      };

      const url = mode === "create" ? "/api/admin/inspections" : `/api/admin/inspections/${defaultValues?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "점검이 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/inspections");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "점검 등록" : "점검 수정"} description="차량 점검 결과를 입력합니다." />
      {mode === "edit" && defaultValues?.id ? (
        <AdminRecordMeta
          updatedAt={defaultValues.updated_at}
          targetTable="vehicle_inspections"
          targetId={defaultValues.id}
        />
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="점검" sectionId="sec-inspection">
          <FieldGrid>
            <div className="space-y-2 md:col-span-2">
              <Label>
                차량 <span className="text-red-600">*</span>
              </Label>
              <Controller
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="차량 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.vehicle_no}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="inspection_date"
              render={({ field }) => (
                <DateYmdInput id="inspection_date" label="점검일 *" value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="inspection_type">점검 유형</Label>
              <Input id="inspection_type" {...form.register("inspection_type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspection_station_name">검사소명</Label>
              <Input id="inspection_station_name" {...form.register("inspection_station_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">결과</Label>
              <Input id="result" {...form.register("result")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="memo">메모</Label>
              <Input id="memo" {...form.register("memo")} />
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/inspections" listHref="/admin/inspections" />
      </form>
    </div>
  );
}
