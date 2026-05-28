"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { FieldGrid } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VehicleRow } from "@/types/database";

const STATUSES = ["active", "inactive", "suspended", "terminated"] as const;

const formSchema = z.object({
  vehicle_no: z.string().trim().min(1, "차량번호는 필수입니다."),
  car_name: z.string().optional(),
  registration_date: z.string().optional(),
  model_year: z.string().optional(),
  vin: z.string().optional(),
  vehicle_model_type: z.string().optional(),
  tonnage: z.string().optional(),
  special_equipment: z.string().optional(),
  height_mm: z.string().optional(),
  length_mm: z.string().optional(),
  width_mm: z.string().optional(),
  max_load_kg: z.string().optional(),
  status: z.enum(STATUSES),
});

export type VehicleFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function VehicleForm({ mode, defaultValues }: { mode: "create" | "edit"; defaultValues?: Partial<VehicleRow> | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_no: defaultValues?.vehicle_no ?? "",
      car_name: defaultValues?.car_name ?? "",
      registration_date: defaultValues?.registration_date?.slice(0, 10) ?? "",
      model_year: defaultValues?.model_year != null ? String(defaultValues.model_year) : "",
      vin: defaultValues?.vin ?? "",
      vehicle_model_type: defaultValues?.vehicle_model_type ?? "",
      tonnage: defaultValues?.tonnage != null ? String(defaultValues.tonnage) : "",
      special_equipment: "",
      height_mm: "",
      length_mm: "",
      width_mm: "",
      max_load_kg: "",
      status: (defaultValues?.status as (typeof STATUSES)[number]) ?? "active",
    },
  });

  async function onSubmit(values: VehicleFormValues) {
    setPending(true);
    try {
      const body = {
        vehicle_no: values.vehicle_no.trim(),
        car_name: values.car_name?.trim() ? values.car_name.trim() : null,
        registration_date: values.registration_date?.trim() ? values.registration_date.trim() : null,
        model_year: values.model_year?.trim() ? Number.parseInt(values.model_year, 10) : null,
        vin: values.vin?.trim() ? values.vin.trim() : null,
        vehicle_model_type: values.vehicle_model_type?.trim() ? values.vehicle_model_type.trim() : null,
        tonnage: values.tonnage?.trim() ? Number.parseFloat(values.tonnage) : null,
        special_equipment: values.special_equipment?.trim() ? values.special_equipment.trim() : null,
        height_mm: values.height_mm?.trim() ? Number.parseInt(values.height_mm, 10) : null,
        length_mm: values.length_mm?.trim() ? Number.parseInt(values.length_mm, 10) : null,
        width_mm: values.width_mm?.trim() ? Number.parseInt(values.width_mm, 10) : null,
        max_load_kg: values.max_load_kg?.trim() ? Number.parseInt(values.max_load_kg, 10) : null,
        status: values.status,
      };

      const url = mode === "create" ? "/api/admin/vehicles" : `/api/admin/vehicles/${defaultValues?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const fields =
          json && typeof json === "object" && "fields" in json
            ? (json as { fields?: Record<string, string[]> }).fields
            : undefined;
        if (fields) {
          for (const [key, msgs] of Object.entries(fields)) {
            if (msgs?.[0]) {
              form.setError(key as keyof VehicleFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }
      const warning =
        json && typeof json === "object" && "warning" in json && typeof (json as { warning: unknown }).warning === "string"
          ? (json as { warning: string }).warning
          : null;
      if (warning) {
        toast.message(warning, {
          description: "중복 차량번호 상태로 저장되었습니다. 상세조회는 가능합니다.",
        });
      }

      toast.success(mode === "create" ? "차량이 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/vehicles");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "차량 등록" : "차량 수정"} description="차량 기본정보를 입력합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="차량 기본정보" sectionId="sec-vehicle-basic">
          <FieldGrid>
            <div className="space-y-2">
              <Label htmlFor="vehicle_no">
                차량번호 <span className="text-red-600">*</span>
              </Label>
              <Input id="vehicle_no" {...form.register("vehicle_no")} />
              {form.formState.errors.vehicle_no ? (
                <p className="text-sm text-red-600">{form.formState.errors.vehicle_no.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="car_name">차명</Label>
              <Input id="car_name" {...form.register("car_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_date">등록일</Label>
              <Input id="registration_date" type="date" {...form.register("registration_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_year">연식</Label>
              <Input id="model_year" type="number" min={0} {...form.register("model_year")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">차대번호</Label>
              <Input id="vin" {...form.register("vin")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_model_type">차종</Label>
              <Input id="vehicle_model_type" {...form.register("vehicle_model_type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_equipment">특장(일반/냉동/냉장)</Label>
              <Input id="special_equipment" {...form.register("special_equipment")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tonnage">톤수</Label>
              <Input id="tonnage" type="number" min={0} step="0.01" {...form.register("tonnage")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length_mm">제원 길이(mm)</Label>
              <Input id="length_mm" type="number" min={0} {...form.register("length_mm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width_mm">제원 너비(mm)</Label>
              <Input id="width_mm" type="number" min={0} {...form.register("width_mm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height_mm">제원 높이(mm)</Label>
              <Input id="height_mm" type="number" min={0} {...form.register("height_mm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_load_kg">최대적재량(mm 단위 화면요청)</Label>
              <Input id="max_load_kg" type="number" min={0} {...form.register("max_load_kg")} />
            </div>
            <div className="space-y-2">
              <Label>상태</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/vehicles" listHref="/admin/vehicles" />
      </form>
    </div>
  );
}
