"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { FieldGrid, FieldFull } from "@/components/admin/field-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AddressRow } from "@/types/database";

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

function AddressBlock({
  driverId,
  addressType,
  label,
  initial,
}: {
  driverId: string;
  addressType: "home" | "mailing";
  label: string;
  initial: AddressRow | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [zipCode, setZipCode] = useState(initial?.zip_code ?? "");
  const [address1, setAddress1] = useState(initial?.address1 ?? "");
  const [address2, setAddress2] = useState(initial?.address2 ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_table: "drivers",
          target_id: driverId,
          address_type: addressType,
          zip_code: zipCode.trim() ? zipCode.trim() : null,
          address1: address1.trim() ? address1.trim() : null,
          address2: address2.trim() ? address2.trim() : null,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(parseApiError(json));
        return;
      }

      toast.success(`${label} 주소가 저장되었습니다.`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminSectionCard title={label} sectionId={`sec-driver-address-${addressType}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FieldGrid>
          <div className="space-y-2">
            <Label htmlFor={`zip-${addressType}`}>우편번호</Label>
            <Input id={`zip-${addressType}`} value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          </div>
          <FieldFull>
            <div className="space-y-2">
              <Label htmlFor={`addr1-${addressType}`}>주소</Label>
              <Textarea id={`addr1-${addressType}`} rows={2} value={address1} onChange={(e) => setAddress1(e.target.value)} />
            </div>
          </FieldFull>
          <FieldFull>
            <div className="space-y-2">
              <Label htmlFor={`addr2-${addressType}`}>상세주소</Label>
              <Textarea id={`addr2-${addressType}`} rows={2} value={address2} onChange={(e) => setAddress2(e.target.value)} />
            </div>
          </FieldFull>
        </FieldGrid>
        <AdminFormActions isPending={pending} submitLabel="주소 저장" listHref="/admin/drivers" />
      </form>
    </AdminSectionCard>
  );
}

export function DriverAddressesPanel({
  driverId,
  addresses,
}: {
  driverId: string;
  addresses: AddressRow[];
}) {
  const byType = (t: string) => addresses.find((a) => a.address_type === t) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">주소</h2>
        <p className="mt-1 text-sm text-slate-600">운전자 자택·우편 수신 주소를 각각 저장합니다.</p>
      </div>
      <AddressBlock driverId={driverId} addressType="home" label="자택" initial={byType("home")} />
      <AddressBlock driverId={driverId} addressType="mailing" label="우편" initial={byType("mailing")} />
    </div>
  );
}
