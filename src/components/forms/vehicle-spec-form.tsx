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
import type { VehicleSpecRow } from "@/types/database";

const formSchema = z.object({
  special_equipment: z.string().optional(),
  height_mm: z.string().optional(),
  length_mm: z.string().optional(),
  width_mm: z.string().optional(),
  max_load_kg: z.string().optional(),
});

export type VehicleSpecFormValues = z.infer<typeof formSchema>;

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
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
      const body = {
        vehicle_id: vehicleId,
        special_equipment: values.special_equipment?.trim() ? values.special_equipment.trim() : null,
        height_mm: values.height_mm?.trim() ? Number.parseInt(values.height_mm, 10) : null,
        length_mm: values.length_mm?.trim() ? Number.parseInt(values.length_mm, 10) : null,
        width_mm: values.width_mm?.trim() ? Number.parseInt(values.width_mm, 10) : null,
        max_load_kg: values.max_load_kg?.trim() ? Number.parseInt(values.max_load_kg, 10) : null,
      };

      if (defaultValues?.id) {
        const patch = {
          special_equipment: body.special_equipment,
          height_mm: body.height_mm,
          length_mm: body.length_mm,
          width_mm: body.width_mm,
          max_load_kg: body.max_load_kg,
        };
        const res = await fetch(`/api/admin/vehicle-specs/${defaultValues.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          toast.error(parseApiError(json));
          return;
        }
      } else {
        const res = await fetch("/api/admin/vehicle-specs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          toast.error(parseApiError(json));
          return;
        }
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="length_mm">길이(mm)</Label>
            <Input id="length_mm" type="number" min={0} {...form.register("length_mm")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width_mm">폭(mm)</Label>
            <Input id="width_mm" type="number" min={0} {...form.register("width_mm")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_load_kg">최대 적재(kg)</Label>
            <Input id="max_load_kg" type="number" min={0} {...form.register("max_load_kg")} />
          </div>
        </FieldGrid>
      </AdminSectionCard>
      <AdminFormActions isPending={pending} submitLabel="제원 저장" listHref={`/admin/vehicles`} />
    </form>
  );
}
