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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { businessNoOptionalSchema, dateYmdSchema, phoneSchema } from "@/lib/admin/zod-util";
import type { OwnerRow } from "@/types/database";

const formSchema = z.object({
  profile_id: z.string().optional(),
  owner_name: z.string().trim().min(1, "사업주명은 필수입니다."),
  owner_phone: z.string().trim().min(1, "전화번호는 필수입니다."),
  business_no: z.string().trim().optional(),
  business_start_date: z.string().optional(),
  business_closed_date: z.string().optional(),
  vat_filing_enabled: z.boolean(),
  service_fee_send_method: z.string().trim().optional(),
  is_active: z.boolean(),
});

export type OwnerFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function OwnerForm({ mode, defaultValues }: { mode: "create" | "edit"; defaultValues?: Partial<OwnerRow> | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile_id: defaultValues?.profile_id ?? "",
      owner_name: defaultValues?.owner_name ?? "",
      owner_phone: defaultValues?.owner_phone ?? "",
      business_no: defaultValues?.business_no ?? "",
      business_start_date: defaultValues?.business_start_date?.slice(0, 10) ?? "",
      business_closed_date: defaultValues?.business_closed_date?.slice(0, 10) ?? "",
      vat_filing_enabled: defaultValues?.vat_filing_enabled ?? false,
      service_fee_send_method: defaultValues?.service_fee_send_method ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: OwnerFormValues) {
    setPending(true);
    try {
      const phoneOk = phoneSchema.safeParse(values.owner_phone.trim());
      if (!phoneOk.success) {
        form.setError("owner_phone", { message: phoneOk.error.issues[0]?.message ?? "전화번호 오류" });
        return;
      }

      let business_no: string | null = null;
      if (values.business_no?.trim()) {
        const bnParsed = businessNoOptionalSchema.safeParse(values.business_no.trim());
        if (!bnParsed.success) {
          form.setError("business_no", { message: bnParsed.error.issues[0]?.message ?? "사업자번호 오류" });
          return;
        }

        business_no = bnParsed.data ?? null;
      }

      let start: string | null = null;
      if (values.business_start_date?.trim()) {
        const s = dateYmdSchema.safeParse(values.business_start_date.trim());
        if (!s.success) {
          form.setError("business_start_date", { message: s.error.issues[0]?.message ?? "날짜 오류" });
          return;
        }

        start = s.data;
      }

      let closed: string | null = null;
      if (values.business_closed_date?.trim()) {
        const c = dateYmdSchema.safeParse(values.business_closed_date.trim());
        if (!c.success) {
          form.setError("business_closed_date", { message: c.error.issues[0]?.message ?? "날짜 오류" });
          return;
        }

        closed = c.data;
      }

      const body = {
        profile_id: values.profile_id?.trim() ? values.profile_id.trim() : null,
        owner_name: values.owner_name.trim(),
        owner_phone: phoneOk.data,
        business_no: business_no,
        business_start_date: start,
        business_closed_date: closed,
        vat_filing_enabled: values.vat_filing_enabled,
        service_fee_send_method: values.service_fee_send_method?.trim() ? values.service_fee_send_method.trim() : null,
        is_active: values.is_active,
      };

      const url = mode === "create" ? "/api/admin/owners" : `/api/admin/owners/${defaultValues?.id}`;
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
              form.setError(key as keyof OwnerFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "사업주가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/owners");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "사업주 등록" : "사업주 수정"} description="사업주 및 과세·수수료 정보를 입력합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="기본 정보" sectionId="sec-owner-basic">
          <FieldGrid>
            <div className="space-y-2">
              <Label htmlFor="owner_name">
                사업주명 <span className="text-red-600">*</span>
              </Label>
              <Input id="owner_name" {...form.register("owner_name")} />
              {form.formState.errors.owner_name ? (
                <p className="text-sm text-red-600">{form.formState.errors.owner_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_phone">
                전화번호 <span className="text-red-600">*</span>
              </Label>
              <Input id="owner_phone" {...form.register("owner_phone")} />
              {form.formState.errors.owner_phone ? (
                <p className="text-sm text-red-600">{form.formState.errors.owner_phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_no">사업자등록번호</Label>
              <Input id="business_no" {...form.register("business_no")} />
              {form.formState.errors.business_no ? (
                <p className="text-sm text-red-600">{form.formState.errors.business_no.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_start_date">사업 시작일</Label>
              <Input id="business_start_date" type="date" {...form.register("business_start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_closed_date">사업 종료일</Label>
              <Input id="business_closed_date" type="date" {...form.register("business_closed_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_fee_send_method">안내문 발송 방식(문자/카톡/우편)</Label>
              <Input id="service_fee_send_method" {...form.register("service_fee_send_method")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_id">프로필 ID (선택)</Label>
              <Input id="profile_id" {...form.register("profile_id")} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Controller
                control={form.control}
                name="vat_filing_enabled"
                render={({ field }) => (
                  <Checkbox id="vat" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                )}
              />
              <Label htmlFor="vat">부가세 신고 사용</Label>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox id="is_active" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                )}
              />
              <Label htmlFor="is_active">활성</Label>
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/owners" listHref="/admin/owners" />
      </form>
    </div>
  );
}
