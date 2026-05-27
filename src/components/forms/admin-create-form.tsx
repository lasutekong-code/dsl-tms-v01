"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { FieldGrid } from "@/components/admin/field-grid";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyApiFieldErrors, parseApiErrorMessage } from "@/lib/admin/form-api-errors";
import { phoneOptionalSchema } from "@/lib/admin/zod-util";

const formSchema = z
  .object({
    email: z.string().trim().email("올바른 이메일(아이디) 형식이 아닙니다."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    password_confirm: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
    name: z.string().trim().min(1, "이름을 입력해 주세요."),
    phone: z.string().trim().optional(),
    is_active: z.boolean(),
  })
  .refine((v) => v.password === v.password_confirm, {
    message: "비밀번호 확인이 일치하지 않습니다.",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof formSchema>;

export function AdminCreateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirm: "",
      name: "",
      phone: "",
      is_active: true,
    },
  });

  async function onSubmit(values: FormValues) {
    setPending(true);
    try {
      let phone: string | null = null;
      if (values.phone?.trim()) {
        const p = phoneOptionalSchema.safeParse(values.phone.trim());
        if (!p.success) {
          form.setError("phone", { message: p.error.issues[0]?.message ?? "전화번호 형식 오류" });
          return;
        }
        phone = p.data;
      }

      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          name: values.name.trim(),
          phone,
          is_active: values.is_active,
        }),
      });

      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        applyApiFieldErrors(json, form.setError);
        toast.error(parseApiErrorMessage(json));
        return;
      }

      toast.success("관리자 계정이 생성되었습니다.");
      router.push("/admin/user-approvals");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 계정 생성"
        description="새 관리자의 아이디(이메일)와 비밀번호를 직접 등록합니다. 생성 즉시 로그인할 수 있습니다."
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="계정 정보" sectionId="sec-admin-create">
          <FieldGrid>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">
                아이디 (이메일) <span className="text-red-600">*</span>
              </Label>
              <Input id="email" type="email" autoComplete="off" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                비밀번호 <span className="text-red-600">*</span>
              </Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirm">
                비밀번호 확인 <span className="text-red-600">*</span>
              </Label>
              <Input
                id="password_confirm"
                type="password"
                autoComplete="new-password"
                {...form.register("password_confirm")}
              />
              {form.formState.errors.password_confirm ? (
                <p className="text-sm text-red-600">{form.formState.errors.password_confirm.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                이름 <span className="text-red-600">*</span>
              </Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 pt-6 md:col-span-2">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox id="is_active" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                )}
              />
              <Label htmlFor="is_active">생성 후 즉시 로그인 허용 (활성)</Label>
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <p className="text-sm text-slate-600">
          이 화면은 기존 관리자만 접근할 수 있습니다. 생성된 비밀번호는 안전한 경로로 전달하세요.
        </p>
        <AdminFormActions
          isPending={pending}
          submitLabel="관리자 계정 생성"
          cancelHref="/admin/user-approvals"
          listHref="/admin/user-approvals"
        />
      </form>
    </div>
  );
}
