"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminRecordMeta } from "@/components/admin/admin-record-meta";
import { FieldGrid, FieldFull } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneSchema } from "@/lib/admin/zod-util";
import type { ClientContactRow } from "@/types/database";

const formSchema = z.object({
  client_id: z.string().uuid("거래처를 선택해 주세요."),
  center_id: z.string().optional(),
  contact_name: z.string().trim().min(1, "담당자명은 필수입니다."),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다.").optional().or(z.literal("")),
  profile_id: z.string().optional(),
  is_active: z.boolean(),
});

export type ClientContactFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function ClientContactForm({
  mode,
  defaultValues,
  clients,
  centers,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ClientContactRow> | null;
  clients: { id: string; client_name: string }[];
  centers: { id: string; client_id: string; center_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<ClientContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? "",
      center_id: defaultValues?.center_id ?? "",
      contact_name: defaultValues?.contact_name ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      profile_id: defaultValues?.profile_id ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const clientId = useWatch({ control: form.control, name: "client_id" });
  const centerOptions = centers.filter((c) => !clientId || c.client_id === clientId);

  async function onSubmit(values: ClientContactFormValues) {
    setPending(true);
    try {
      if (values.phone?.trim()) {
        const p = phoneSchema.safeParse(values.phone.trim());
        if (!p.success) {
          form.setError("phone", { message: p.error.issues[0]?.message ?? "전화번호 오류" });
          return;
        }
      }

      const body = {
        client_id: values.client_id,
        center_id: values.center_id?.trim() ? values.center_id : null,
        contact_name: values.contact_name,
        phone: values.phone?.trim() ? values.phone.trim() : null,
        email: values.email?.trim() ? values.email.trim() : null,
        profile_id: values.profile_id?.trim() ? values.profile_id : null,
        is_active: values.is_active,
      };

      const url =
        mode === "create" ? "/api/admin/client-contacts" : `/api/admin/client-contacts/${defaultValues?.id}`;
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
              form.setError(key as keyof ClientContactFormValues, { message: msgs[0] });
            }
          }
        }

        toast.error(parseApiError(json));
        return;
      }

      toast.success(mode === "create" ? "담당자가 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/client-contacts");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "담당자 등록" : "담당자 수정"} description="거래처·센터별 담당자 정보를 입력합니다." />
      {mode === "edit" && defaultValues?.id ? (
        <AdminRecordMeta updatedAt={defaultValues.updated_at} targetTable="client_contacts" targetId={defaultValues.id} />
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="담당자 정보" sectionId="sec-contact-main">
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
                        <SelectValue placeholder="거래처 선택" />
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
            <FieldFull>
              <div className="space-y-2">
                <Label>센터</Label>
                <Controller
                  control={form.control}
                  name="center_id"
                  render={({ field }) => (
                    <Select value={field.value || "__none__"} onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="센터 선택 (선택)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">선택 안 함</SelectItem>
                        {centerOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.center_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </FieldFull>
            <div className="space-y-2">
              <Label htmlFor="contact_name">
                담당자명 <span className="text-red-600">*</span>
              </Label>
              <Input id="contact_name" {...form.register("contact_name")} />
              {form.formState.errors.contact_name ? (
                <p className="text-sm text-red-600">{form.formState.errors.contact_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone ? <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_id">프로필 ID (선택)</Label>
              <Input id="profile_id" {...form.register("profile_id")} placeholder="UUID" />
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
        <AdminFormActions isPending={pending} cancelHref="/admin/client-contacts" listHref="/admin/client-contacts" />
      </form>
    </div>
  );
}
