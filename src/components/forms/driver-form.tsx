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
import { ResidentIdInput } from "@/components/admin/resident-id-input";
import { FieldGrid } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DriverPhotoThumb } from "@/components/admin/driver-photo-thumb";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateYmdSchema, phoneSchema } from "@/lib/admin/zod-util";
import type { DriverRow } from "@/types/database";

const rrnSchema = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{6}-\d{7}$/.test(v), "주민등록번호 형식이 올바르지 않습니다 (######-#######).");

const formSchema = z.object({
  profile_id: z.string().optional(),
  driver_name: z.string().trim().min(1, "운전자명은 필수입니다."),
  birth_date: z.string().optional(),
  phone: z.string().trim().min(1, "전화번호는 필수입니다."),
  driver_license_no: z.string().trim().optional(),
  cargo_license_no: z.string().trim().optional(),
  resident_registration_number: rrnSchema,
  is_active: z.boolean(),
});

export type DriverFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function DriverForm({
  mode,
  defaultValues,
  photoStoragePath,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<DriverRow> | null;
  photoStoragePath?: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile_id: defaultValues?.profile_id ?? "",
      driver_name: defaultValues?.driver_name ?? "",
      birth_date: defaultValues?.birth_date?.slice(0, 10) ?? "",
      phone: defaultValues?.phone ?? "",
      driver_license_no: defaultValues?.driver_license_no ?? "",
      cargo_license_no: defaultValues?.cargo_license_no ?? "",
      resident_registration_number: defaultValues?.resident_registration_number ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: DriverFormValues) {
    setPending(true);
    try {
      const phoneOk = phoneSchema.safeParse(values.phone.trim());
      if (!phoneOk.success) {
        form.setError("phone", { message: phoneOk.error.issues[0]?.message ?? "전화번호 오류" });
        return;
      }

      let birth: string | null = null;
      if (values.birth_date?.trim()) {
        const b = dateYmdSchema.safeParse(values.birth_date.trim());
        if (!b.success) {
          form.setError("birth_date", { message: b.error.issues[0]?.message ?? "생년월일 오류" });
          return;
        }

        birth = b.data;
      }

      const body = {
        profile_id: values.profile_id?.trim() ? values.profile_id.trim() : null,
        driver_name: values.driver_name.trim(),
        birth_date: birth,
        phone: phoneOk.data,
        driver_license_no: values.driver_license_no?.trim() ? values.driver_license_no.trim() : null,
        cargo_license_no: values.cargo_license_no?.trim() ? values.cargo_license_no.trim() : null,
        resident_registration_number: values.resident_registration_number?.trim()
          ? values.resident_registration_number.trim()
          : null,
        is_active: values.is_active,
      };

      const url = mode === "create" ? "/api/admin/drivers" : `/api/admin/drivers/${defaultValues?.id}`;
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
              form.setError(key as keyof DriverFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "운전자가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/drivers");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "운전자 등록" : "운전자 수정"} description="운전자 기본정보를 입력합니다." />
      {mode === "edit" && defaultValues?.id ? (
        <AdminRecordMeta updatedAt={defaultValues.updated_at} targetTable="drivers" targetId={defaultValues.id} />
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="기본 정보" sectionId="sec-driver-basic">
          <FieldGrid>
            <div className="flex flex-wrap items-start gap-4 md:col-span-2">
              {mode === "edit" ? (
                <DriverPhotoThumb
                  driverName={defaultValues?.driver_name?.trim() || "운전자"}
                  storagePath={photoStoragePath ?? null}
                />
              ) : null}
              <div className="min-w-[200px] flex-1 space-y-2">
                <Label htmlFor="driver_name">
                  운전자명 <span className="text-red-600">*</span>
                </Label>
                <Input id="driver_name" {...form.register("driver_name")} />
                {form.formState.errors.driver_name ? (
                  <p className="text-sm text-red-600">{form.formState.errors.driver_name.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                전화번호 <span className="text-red-600">*</span>
              </Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone ? <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p> : null}
            </div>
            <Controller
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <DateYmdInput
                  key={field.value ?? "birth-empty"}
                  id="birth_date"
                  label="생년월일"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="resident_registration_number"
              render={({ field }) => (
                <ResidentIdInput id="resident_registration_number" value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="profile_id">프로필 ID (선택)</Label>
              <Input id="profile_id" {...form.register("profile_id")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_license_no">운전면허 번호</Label>
              <Input id="driver_license_no" {...form.register("driver_license_no")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo_license_no">화물운송종사자격번호</Label>
              <Input id="cargo_license_no" {...form.register("cargo_license_no")} />
            </div>
            <div className="flex items-center gap-2 pt-6">
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
        <AdminFormActions isPending={pending} cancelHref="/admin/drivers" listHref="/admin/drivers" />
      </form>
    </div>
  );
}
