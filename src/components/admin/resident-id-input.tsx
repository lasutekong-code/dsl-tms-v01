"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatRrnInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 6) {
    return digits;
  }

  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

function maskRrn(value: string) {
  const m = /^(\d{6})-(\d{7})$/.exec(value);
  if (!m) {
    return value;
  }

  return `${m[1]}-*******`;
}

export function ResidentIdInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const display = revealed ? value : maskRrn(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>주민등록번호</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={id}
          inputMode="numeric"
          value={display}
          readOnly={!revealed}
          onChange={(e) => onChange(formatRrnInput(e.target.value))}
          placeholder="000000-0000000"
          maxLength={14}
          className="max-w-xs font-mono"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "마스킹" : "마스킹해제"}
        </Button>
      </div>
    </div>
  );
}
