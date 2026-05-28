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
import { CONTRACT_STATUSES, CONTRACT_TYPES } from "@/types/admin";
import type { ContractRow } from "@/types/database";

const formSchema = z.object({
  vehicle_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  client_id: z.string().uuid(),
  contract_type: z.enum(["consignment", "service"]),
  contract_start_date: z.string().min(1),
  contract_end_date: z.string().optional(),
  status: z.enum(["active", "terminated", "expired"]),
  memo: z.string().optional(),
});

export type ContractFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function ContractForm({
  mode,
  defaultValues,
  vehicles,
  owners,
  clients,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ContractRow> | null;
  vehicles: { id: string; vehicle_no: string }[];
  owners: { id: string; owner_name: string }[];
  clients: { id: string; client_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: defaultValues?.vehicle_id ?? "",
      owner_id: defaultValues?.owner_id ?? "",
      client_id: defaultValues?.client_id ?? "",
      contract_type: (defaultValues?.contract_type as "consignment" | "service") ?? "consignment",
      contract_start_date: defaultValues?.contract_start_date?.slice(0, 10) ?? "",
      contract_end_date: defaultValues?.contract_end_date?.slice(0, 10) ?? "",
      status: (defaultValues?.status as "active" | "terminated" | "expired") ?? "active",
      memo: defaultValues?.memo ?? "",
    },
  });

  async function onSubmit(values: ContractFormValues) {
    setPending(true);
    try {
      const body = {
        vehicle_id: values.vehicle_id,
        owner_id: values.owner_id,
        client_id: values.client_id,
        contract_type: values.contract_type,
        contract_start_date: values.contract_start_date,
        contract_end_date: values.contract_end_date?.trim() ? values.contract_end_date : null,
        status: values.status,
        memo: values.memo?.trim() ? values.memo.trim() : null,
      };

      const url = mode === "create" ? "/api/admin/contracts" : `/api/admin/contracts/${defaultValues?.id}`;
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
      const savedContractId =
        json && typeof json === "object" && "data" in json && (json as { data?: { id?: string } }).data?.id
          ? String((json as { data: { id: string } }).data.id)
          : String(defaultValues?.id ?? "");

      if (contractFile && savedContractId) {
        const fileForm = new FormData();
        fileForm.set("file", contractFile);
        const uploadRes = await fetch(`/api/admin/contracts/${savedContractId}/file`, {
          method: "POST",
          body: fileForm,
        });
        const uploadJson: unknown = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok) {
          toast.error(parseApiError(uploadJson));
          return;
        }
      }

      toast.success(mode === "create" ? "계약이 등록되었습니다." : "저장되었습니다.");
      router.push("/admin/contracts");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const selectField = (name: keyof ContractFormValues, label: string, required: boolean, options: { id: string; label: string }[]) => (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
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
              {options.map((o) => (
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

  return (
    <div className="space-y-6">
      <AdminPageHeader title={mode === "create" ? "계약 등록" : "계약 수정"} description="차량·사업주·거래처 간 계약 정보를 입력합니다." />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminSectionCard title="계약 정보" sectionId="sec-contract">
          <FieldGrid>
            {selectField(
              "vehicle_id",
              "차량",
              true,
              vehicles.map((v) => ({ id: v.id, label: v.vehicle_no })),
            )}
            {selectField(
              "owner_id",
              "사업주",
              true,
              owners.map((o) => ({ id: o.id, label: o.owner_name })),
            )}
            {selectField(
              "client_id",
              "거래처",
              true,
              clients.map((c) => ({ id: c.id, label: c.client_name })),
            )}
            <div className="space-y-2">
              <Label>계약 유형</Label>
              <Controller
                control={form.control}
                name="contract_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_start_date">시작일 *</Label>
              <Input id="contract_start_date" type="date" {...form.register("contract_start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_end_date">종료일</Label>
              <Input id="contract_end_date" type="date" {...form.register("contract_end_date")} />
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
                      {CONTRACT_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="memo">메모</Label>
              <Input id="memo" {...form.register("memo")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contract_file">계약서 파일 (pdf, docx, hwpx, txt)</Label>
              <input
                id="contract_file"
                type="file"
                accept=".pdf,.docx,.hwpx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="block w-full text-sm"
                onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </FieldGrid>
        </AdminSectionCard>
        <AdminFormActions isPending={pending} cancelHref="/admin/contracts" listHref="/admin/contracts" />
      </form>
    </div>
  );
}
