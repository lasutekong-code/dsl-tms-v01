"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DateParts = { year: string; month: string; day: string };

function parseValue(value: string): DateParts {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    return { year: "", month: "", day: "" };
  }

  return { year: m[1], month: m[2], day: m[3] };
}

function compose(parts: DateParts) {
  const { year, month, day } = parts;
  if (!year && !month && !day) {
    return "";
  }

  if (year.length === 4 && month.length === 2 && day.length === 2) {
    return `${year}-${month}-${day}`;
  }

  return null;
}

function DateYmdInputFields({
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
  const [parts, setParts] = useState<DateParts>(() => parseValue(value));

  function update(part: keyof DateParts, raw: string) {
    const digits = raw.replace(/\D/g, "");
    const next: DateParts = {
      ...parts,
      [part]: part === "year" ? digits.slice(0, 4) : digits.slice(0, 2),
    };
    setParts(next);

    const composed = compose(next);
    if (composed !== null) {
      onChange(composed);
    }
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

export function DateYmdInput(props: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return <DateYmdInputFields key={`${props.id}-${props.value}`} {...props} />;
}
