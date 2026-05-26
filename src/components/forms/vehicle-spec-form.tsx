"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { FieldGrid } from "@/components/admin/field-grid";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyApiFieldErrors, parseApiErrorMessage } from "@/lib/admin/form-api-errors";
import type { VehicleSpecRow } from "@/types/database";

const formSchema = z.object({
  special_equipment: z.string().optional(),
  height_mm: z.string().optional(),
  length_mm: z.string().optional(),
  width_mm: z.string().optional(),
  max_load_kg: z.string().optional(),
});

export type VehicleSpecFormValues = z.infer<typeof formSchema>;

function parseOptionalInt(value: string | undefined, field: keyof VehicleSpecFormValues, label: string) {
  if (!value?.trim()) {
    return { ok: true as const, value: null };
  }

  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false as const, field, message: `${label}은(는) 0 이상의 정수여야 합니다.` };
  }

  return { ok: true as const, value: n };
}

export function VehicleSpecForm({
  vehicleId,
  defaultValues,
}: {
  vehicleId: string;
  defaultValues?: Partial<VehicleSpecRow> | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<VehicleSpecFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      special_equipment: defaultValues?.special_equipment ?? "",
      height_mm: defaultValues?.height_mm != null ? String(defaultValues.height_mm) : "",
      length_mm: defaultValues?.length_mm != null ? String(defaultValues.length_mm) : "",
      width_mm: defaultValues?.width_mm != null ? String(defaultValues.width_mm) : "",
      max_load_kg: defaultValues?.max_load_kg != null ? String(defaultValues.max_load_kg) : "",
    },
  });

  async function onSubmit(values: VehicleSpecFormValues) {
    setPending(true);
    try {
      const height = parseOptionalInt(values.height_mm, "height_mm", "높이");
      if (!height.ok) {
        form.setError(height.field, { message: height.message });
        return;
      }

      const length = parseOptionalInt(values.length_mm, "length_mm", "길이");
      if (!length.ok) {
        form.setError(length.field, { message: length.message });
        return;
      }

      const width = parseOptionalInt(values.width_mm, "width_mm", "폭");
      if (!width.ok) {
        form.setError(width.field, { message: width.message });
        return;
      }

      const maxLoad = parseOptionalInt(values.max_load_kg, "max_load_kg", "최대 적재");
      if (!maxLoad.ok) {
        form.setError(maxLoad.field, { message: maxLoad.message });
        return;
      }

      const body = {
        vehicle_id: vehicleId,
        special_equipment: values.special_equipment?.trim() ? values.special_equipment.trim() : null,
        height_mm: height.value,
        length_mm: length.value,
        width_mm: width.value,
        max_load_kg: maxLoad.value,
      };

      const url = defaultValues?.id ? `/api/admin/vehicle-specs/${defaultValues.id}` : "/api/admin/vehicle-specs";
      const method = defaultValues?.id ? "PATCH" : "POST";
      const payload = defaultValues?.id
        ? {
            special_equipment: body.special_equipment,
            height_mm: body.height_mm,
            length_mm: body.length_mm,
            width_mm: body.width_mm,
            max_load_kg: body.max_load_kg,
          }
        : body;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        applyApiFieldErrors(json, form.setError);
        toast.error(parseApiErrorMessage(json));
        return;
      }

      toast.success("차량 제원이 저장되었습니다.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <AdminPageHeader title="차량 제원" description="적재 한도 및 외형 치수를 입력합니다." />
      <AdminSectionCard title="제원" sectionId="sec-vehicle-spec">
        <FieldGrid>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="special_equipment">특수장비</Label>
            <Input id="special_equipment" {...form.register("special_equipment")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_mm">높이(mm)</Label>
            <Input id="height_mm" type="number" min={0} {...form.register("height_mm")} />
            {form.formState.errors.height_mm ? (
              <p className="text-sm text-red-600">{form.formState.errors.height_mm.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="length_mm">길이(mm)</Label>
            <Input id="length_mm" type="number" min={0} {...form.register("length_mm")} />
            {form.formState.errors.length_mm ? (
              <p className="text-sm text-red-600">{form.formState.errors.length_mm.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="width_mm">폭(mm)</Label>
            <Input id="width_mm" type="number" min={0} {...form.register("width_mm")} />
            {form.formState.errors.width_mm ? (
              <p className="text-sm text-red-600">{form.formState.errors.width_mm.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_load_kg">최대 적재(kg)</Label>
            <Input id="max_load_kg" type="number" min={0} {...form.register("max_load_kg")} />
            {form.formState.errors.max_load_kg ? (
              <p className="text-sm text-red-600">{form.formState.errors.max_load_kg.message}</p>
            ) : null}
          </div>
        </FieldGrid>
      </AdminSectionCard>
      <AdminFormActions isPending={pending} submitLabel="제원 저장" listHref={`/admin/vehicles`} />
    </form>
  );
}
