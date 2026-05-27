"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminFormActions({
  isPending,
  submitLabel = "저장",
  pendingLabel = "저장 중...",
  cancelHref,
  listHref,
}: {
  isPending: boolean;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
  listHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
      <Button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
      {cancelHref ? (
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href={cancelHref}>취소</Link>
        </Button>
      ) : null}
      {listHref ? (
        <Button type="button" variant="ghost" asChild disabled={isPending}>
          <Link href={listHref}>목록으로</Link>
        </Button>
      ) : null}
    </div>
  );
}
