"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseValue(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    return { year: "", month: "", day: "" };
  }

  return { year: m[1], month: m[2], day: m[3] };
}

function compose(year: string, month: string, day: string) {
  if (!year && !month && !day) {
    return "";
  }

  if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

export function DateYmdInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const parts = parseValue(value);

  function update(part: "year" | "month" | "day", raw: string) {
    const digits = raw.replace(/\D/g, "");
    const next = { ...parts, [part]: part === "year" ? digits.slice(0, 4) : digits.slice(0, 2) };
    onChange(compose(next.year, next.month, next.day));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-year`}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={`${id}-year`}
          inputMode="numeric"
          placeholder="YYYY"
          className="w-24"
          value={parts.year}
          onChange={(e) => update("year", e.target.value)}
          maxLength={4}
        />
        <span className="text-slate-500">-</span>
        <Input
          inputMode="numeric"
          placeholder="MM"
          className="w-16"
          value={parts.month}
          onChange={(e) => update("month", e.target.value)}
          maxLength={2}
        />
        <span className="text-slate-500">-</span>
        <Input
          inputMode="numeric"
          placeholder="DD"
          className="w-16"
          value={parts.day}
          onChange={(e) => update("day", e.target.value)}
          maxLength={2}
        />
      </div>
    </div>
  );
}
