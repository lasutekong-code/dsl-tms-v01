import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Vehicle Search</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          차량 통합 검색
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          거래처명, 차량번호, 운전자명 조건으로 차량을 찾고 상세 정보를 확인하세요.
        </p>
      </div>

      <SearchClient />
    </main>
  );
}
