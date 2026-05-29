import { FieldGrid, FieldFull } from "@/components/admin/field-grid";

export function DetailField({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  const content = (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="text-sm text-slate-900">{value ?? "—"}</dd>
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
