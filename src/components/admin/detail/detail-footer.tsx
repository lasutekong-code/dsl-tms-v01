import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminDetailFooter({ listHref, editHref }: { listHref: string; editHref: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
      <Button asChild variant="outline">
        <Link href={editHref}>수정</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link href={listHref}>목록으로</Link>
      </Button>
    </div>
  );
}
