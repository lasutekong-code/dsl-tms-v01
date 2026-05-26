"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { FieldGrid, FieldFull } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { businessNoOptionalSchema, phoneOptionalSchema } from "@/lib/admin/zod-util";
import type { ClientRow } from "@/types/database";

const formSchema = z.object({
  client_name: z.string().trim().min(1, "거래처명은 필수입니다."),
  business_no: z.string().trim().optional(),
  main_phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  is_active: z.boolean(),
});

export type ClientFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function ClientForm({
  mode,
  defaultValues,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ClientRow> | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: defaultValues?.client_name ?? "",
      business_no: defaultValues?.business_no ?? "",
      main_phone: defaultValues?.main_phone ?? "",
      address: defaultValues?.address ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: ClientFormValues) {
    setPending(true);
    try {
      const payload = {
        client_name: values.client_name,
        business_no: values.business_no?.trim() ? values.business_no.trim() : null,
        main_phone: values.main_phone?.trim() ? values.main_phone.trim() : null,
        address: values.address?.trim() ? values.address.trim() : null,
        is_active: values.is_active,
      };

      const phoneCheck = phoneOptionalSchema.safeParse(payload.main_phone ?? "");
      if (!phoneCheck.success) {
        form.setError("main_phone", { message: phoneCheck.error.issues[0]?.message ?? "전화번호 오류" });
        return;
      }

      const bnCheck = businessNoOptionalSchema.safeParse(payload.business_no);
      if (!bnCheck.success) {
        form.setError("business_no", { message: bnCheck.error.issues[0]?.message ?? "사업자번호 오류" });
        return;
      }

      const url = mode === "create" ? "/api/admin/clients" : `/api/admin/clients/${defaultValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          business_no: bnCheck.data,
          main_phone: phoneCheck.data,
        }),
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
              form.setError(key as keyof ClientFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "거래처가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/clients");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={mode === "create" ? "거래처 등록" : "거래처 수정"}
        description="거래처 기본정보와 연락처 정보를 입력합니다."
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="기본 정보" sectionId="sec-client-basic">
          <FieldGrid>
            <div className="space-y-2">
              <Label htmlFor="client_name">
                거래처명 <span className="text-red-600">*</span>
              </Label>
              <Input id="client_name" {...form.register("client_name")} />
              {form.formState.errors.client_name ? (
                <p className="text-sm text-red-600">{form.formState.errors.client_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_no">사업자등록번호</Label>
              <Input id="business_no" {...form.register("business_no")} placeholder="000-00-00000" />
              {form.formState.errors.business_no ? (
                <p className="text-sm text-red-600">{form.formState.errors.business_no.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="main_phone">대표 전화</Label>
              <Input id="main_phone" {...form.register("main_phone")} />
              {form.formState.errors.main_phone ? (
                <p className="text-sm text-red-600">{form.formState.errors.main_phone.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(c) => form.setValue("is_active", c === true)}
              />
              <Label htmlFor="is_active">활성</Label>
            </div>
            <FieldFull>
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Textarea id="address" rows={3} {...form.register("address")} />
              </div>
            </FieldFull>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions
          isPending={pending}
          cancelHref="/admin/clients"
          listHref="/admin/clients"
        />
      </form>
    </div>
  );
}
