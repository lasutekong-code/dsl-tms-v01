"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneOptionalSchema } from "@/lib/admin/zod-util";
import type { CenterRow } from "@/types/database";

const formSchema = z.object({
  client_id: z.string().uuid("거래처를 선택해 주세요."),
  center_name: z.string().trim().min(1, "센터명은 필수입니다."),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  is_active: z.boolean(),
});

export type CenterFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function CenterForm({
  mode,
  defaultValues,
  clients,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<CenterRow> | null;
  clients: { id: string; client_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<CenterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? "",
      center_name: defaultValues?.center_name ?? "",
      address: defaultValues?.address ?? "",
      phone: defaultValues?.phone ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: CenterFormValues) {
    setPending(true);
    try {
      const payload = {
        client_id: values.client_id,
        center_name: values.center_name,
        address: values.address?.trim() ? values.address.trim() : null,
        phone: values.phone?.trim() ? values.phone.trim() : null,
        is_active: values.is_active,
      };

      const phoneCheck = phoneOptionalSchema.safeParse(payload.phone ?? "");
      if (!phoneCheck.success) {
        form.setError("phone", { message: phoneCheck.error.issues[0]?.message ?? "전화번호 오류" });
        return;
      }

      const url = mode === "create" ? "/api/admin/centers" : `/api/admin/centers/${defaultValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, phone: phoneCheck.data }),
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
              form.setError(key as keyof CenterFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "센터가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/centers");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "센터 등록" : "센터 수정"} description="거래처 소속 센터 정보를 입력합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="센터 정보" sectionId="sec-center-main">
          <FieldGrid>
            <FieldFull>
              <div className="space-y-2">
                <Label>
                  거래처 <span className="text-red-600">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="거래처를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.client_id ? (
                  <p className="text-sm text-red-600">{form.formState.errors.client_id.message}</p>
                ) : null}
              </div>
            </FieldFull>
            <div className="space-y-2">
              <Label htmlFor="center_name">
                센터명 <span className="text-red-600">*</span>
              </Label>
              <Input id="center_name" {...form.register("center_name")} />
              {form.formState.errors.center_name ? (
                <p className="text-sm text-red-600">{form.formState.errors.center_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone ? <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p> : null}
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
            <FieldFull>
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Textarea id="address" rows={3} {...form.register("address")} />
              </div>
            </FieldFull>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/centers" listHref="/admin/centers" />
      </form>
    </div>
  );
}
