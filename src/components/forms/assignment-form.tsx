"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { FieldGrid } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VehicleAssignmentRow } from "@/types/database";

const formSchema = z.object({
  vehicle_id: z.string().uuid(),
  client_id: z.string().uuid(),
  center_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  is_current: z.boolean(),
});

export type AssignmentFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function AssignmentForm({
  mode,
  defaultValues,
  vehicles,
  clients,
  centers,
  drivers,
  owners,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<VehicleAssignmentRow> | null;
  vehicles: { id: string; vehicle_no: string }[];
  clients: { id: string; client_name: string }[];
  centers: { id: string; center_name: string; client_id: string }[];
  drivers: { id: string; driver_name: string }[];
  owners: { id: string; owner_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: defaultValues?.vehicle_id ?? "",
      client_id: defaultValues?.client_id ?? "",
      center_id: defaultValues?.center_id ?? "",
      driver_id: defaultValues?.driver_id ?? "",
      owner_id: defaultValues?.owner_id ?? "",
      start_date: defaultValues?.start_date?.slice(0, 10) ?? "",
      end_date: defaultValues?.end_date?.slice(0, 10) ?? "",
      is_current: defaultValues?.is_current ?? true,
    },
  });

  const clientId = useWatch({ control: form.control, name: "client_id" });
  const centerOpts = centers.filter((c) => !clientId || c.client_id === clientId);

  const sel = (
    name: "vehicle_id" | "client_id" | "driver_id" | "owner_id",
    label: string,
    opts: { id: string; label: string }[],
  ) => (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-red-600">*</span>
      </Label>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`${label} 선택`} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );

  async function onSubmit(values: AssignmentFormValues) {
    setPending(true);
    try {
      const body = {
        vehicle_id: values.vehicle_id,
        client_id: values.client_id,
        center_id: values.center_id,
        driver_id: values.driver_id,
        owner_id: values.owner_id,
        start_date: values.start_date,
        end_date: values.end_date?.trim() ? values.end_date : null,
        is_current: values.is_current,
      };

      const url = mode === "create" ? "/api/admin/assignments" : `/api/admin/assignments/${defaultValues?.id}`;
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

      toast.success(mode === "create" ? "배정이 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/assignments");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "차량 배정 등록" : "차량 배정 수정"} description="차량·거래처·센터·운전자·사업주를 연결합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="배정" sectionId="sec-assignment">
          <FieldGrid>
            {sel(
              "vehicle_id",
              "차량",
              vehicles.map((v) => ({ id: v.id, label: v.vehicle_no })),
            )}
            {sel(
              "client_id",
              "거래처",
              clients.map((c) => ({ id: c.id, label: c.client_name })),
            )}
            <div className="space-y-2">
              <Label>
                센터 <span className="text-red-600">*</span>
              </Label>
              <Controller
                control={form.control}
                name="center_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="센터 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {centerOpts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.center_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {sel(
              "driver_id",
              "운전자",
              drivers.map((d) => ({ id: d.id, label: d.driver_name })),
            )}
            {sel(
              "owner_id",
              "사업주",
              owners.map((o) => ({ id: o.id, label: o.owner_name })),
            )}
            <div className="space-y-2">
              <Label htmlFor="start_date">시작일 *</Label>
              <Input id="start_date" type="date" {...form.register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">종료일</Label>
              <Input id="end_date" type="date" {...form.register("end_date")} />
            </div>
            <div className="flex items-center gap-2 pt-2 md:col-span-2">
              <Controller
                control={form.control}
                name="is_current"
                render={({ field }) => (
                  <Checkbox id="is_current" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                )}
              />
              <Label htmlFor="is_current">현재 배정</Label>
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/assignments" listHref="/admin/assignments" />
      </form>
    </div>
  );
}
