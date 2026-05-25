import type { DriversSafeView } from "@/types/database";

type DriverProfileCardProps = {
  driver: DriversSafeView;
};

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function DriverProfileCard({ driver }: DriverProfileCardProps) {
  const hasPii =
    driver.driver_license_number != null ||
    driver.birth_date != null ||
    driver.address != null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {driver.photo_signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={driver.photo_signed_url}
              alt={`${driver.full_name} 사진`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              사진 없음
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900">
            {driver.full_name}
          </h2>
          {driver.phone ? (
            <p className="mt-1 text-sm text-slate-600">{driver.phone}</p>
          ) : null}

          {hasPii ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {driver.driver_license_number ? (
                <>
                  <dt className="text-slate-500">면허번호</dt>
                  <dd className="font-medium text-slate-900">
                    {driver.driver_license_number}
                  </dd>
                </>
              ) : null}
              {driver.birth_date ? (
                <>
                  <dt className="text-slate-500">생년월일</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDate(driver.birth_date)}
                  </dd>
                </>
              ) : null}
              {driver.address ? (
                <>
                  <dt className="text-slate-500 sm:col-span-1">주소</dt>
                  <dd className="font-medium text-slate-900 sm:col-span-1">
                    {driver.address}
                  </dd>
                </>
              ) : null}
            </dl>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              면허번호·생년월일·주소는 조회 권한이 있는 역할만 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
