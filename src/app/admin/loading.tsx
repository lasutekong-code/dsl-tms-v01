import { Skeleton } from "@/components/ui/skeleton";

// 관리자 영역 공통 로딩 UI.
// Suspense 경계를 만들어, 사이드 메뉴 클릭 시 서버 렌더가 끝나기 전에도
// 즉시 스켈레톤을 보여준다. (이전 화면이 멈춰 있는 듯한 체감을 제거)
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
