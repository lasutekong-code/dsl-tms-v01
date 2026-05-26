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
import type { InsuranceRow } from "@/types/database";

const formSchema = z.object({
  vehicle_id: z.string().uuid(),
  insurance_company: z.string().optional(),
  insurance_rate: z.string().optional(),
  renewal_date: z.string().optional(),
  memo: z.string().optional(),
});

export type InsuranceFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function InsuranceForm({
  mode,
  defaultValues,
  vehicles,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<InsuranceRow> | null;
  vehicles: { id: string; vehicle_no: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: defaultValues?.vehicle_id ?? "",
      insurance_company: defaultValues?.insurance_company ?? "",
      insurance_rate: defaultValues?.insurance_rate != null ? String(defaultValues.insurance_rate) : "",
      renewal_date: defaultValues?.renewal_date?.slice(0, 10) ?? "",
      memo: defaultValues?.memo ?? "",
    },
  });

  async function onSubmit(values: InsuranceFormValues) {
    setPending(true);
    try {
      const body = {
        vehicle_id: values.vehicle_id,
        insurance_company: values.insurance_company?.trim() ? values.insurance_company.trim() : null,
        insurance_rate: values.insurance_rate?.trim() ? Number.parseFloat(values.insurance_rate) : null,
        renewal_date: values.renewal_date?.trim() ? values.renewal_date.trim() : null,
        memo: values.memo?.trim() ? values.memo.trim() : null,
      };

      const url = mode === "create" ? "/api/admin/insurances" : `/api/admin/insurances/${defaultValues?.id}`;
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

      toast.success(mode === "create" ? "보험 정보가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/insurances");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "보험 등록" : "보험 수정"} description="차량 보험 정보를 입력합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="보험" sectionId="sec-insurance">
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
            <div className="space-y-2">
              <Label htmlFor="insurance_company">보험사</Label>
              <Input id="insurance_company" {...form.register("insurance_company")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_rate">요율</Label>
              <Input id="insurance_rate" type="number" min={0} step="0.01" {...form.register("insurance_rate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renewal_date">갱신일</Label>
              <Input id="renewal_date" type="date" {...form.register("renewal_date")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="memo">메모</Label>
              <Input id="memo" {...form.register("memo")} />
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/insurances" listHref="/admin/insurances" />
      </form>
    </div>
  );
}
