import { FieldGrid, FieldFull } from "@/components/admin/field-grid";

export function DetailField({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  const content = (
    <div className="space-y-2">
      <dt className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
        {label}
      </dt>
      <dd className="px-1 text-sm text-slate-900">{value ?? "—"}</dd>
    </div>
  );

  if (fullWidth) {
    return <FieldFull>{content}</FieldFull>;
  }

  return content;
}

export function DetailFieldGrid({ children }: { children: React.ReactNode }) {
  return <FieldGrid>{children}</FieldGrid>;
}
