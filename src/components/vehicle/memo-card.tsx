import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

const VISIBILITY_LABEL = {
  shared: "공유",
  internal: "내부",
  admin_only: "관리자",
} as const;

export function MemoCard({ detail }: { detail: VehicleDetail }) {
  if (detail.memos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>메모 / 특기사항</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">등록된 메모가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>메모 / 특기사항</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {detail.memos.map((memo) => (
          <article
            key={memo.id}
            className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {memo.memo_type ? (
                <Badge variant="outline">{memo.memo_type}</Badge>
              ) : null}
              <Badge variant="secondary">{VISIBILITY_LABEL[memo.visibility]}</Badge>
              <span className="text-xs text-slate-500">{formatDate(memo.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
              {memo.content}
            </p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
