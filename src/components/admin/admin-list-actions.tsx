import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminListActions({
  viewHref,
  editHref,
  extra,
}: {
  viewHref: string;
  editHref: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button asChild size="sm" variant="default">
        <Link href={viewHref}>조회</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={editHref}>수정</Link>
      </Button>
      {extra}
    </div>
  );
}
