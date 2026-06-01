"use client";

import { useId, useRef } from "react";

import { cn } from "@/lib/utils/cn";

export function FilePickerButton({
  accept,
  label = "파일 선택",
  className,
  onFileChange,
  inputId,
}: {
  accept?: string;
  label?: string;
  className?: string;
  onFileChange: (file: File | null) => void;
  inputId?: string;
}) {
  const autoId = useId();
  const id = inputId ?? autoId;
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
    </div>
  );
}
