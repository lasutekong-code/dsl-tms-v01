"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { vehicles } from "@/lib/vehicles";

const searchOptions = [
  { label: "거래처명", value: "clientName" },
  { label: "차량번호", value: "vehicleNumber" },
  { label: "운전자명", value: "driverName" },
] as const;

type SearchField = (typeof searchOptions)[number]["value"];

const fieldPlaceholder: Record<SearchField, string> = {
  clientName: "예: 한빛물류",
  vehicleNumber: "예: 서울 82바 4591",
  driverName: "예: 김도현",
};

export function SearchClient() {
  const [searchField, setSearchField] = useState<SearchField>("clientName");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const filteredVehicles = useMemo(() => {
    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      vehicle[searchField].toLocaleLowerCase("ko-KR").includes(normalizedQuery),
    );
  }, [normalizedQuery, searchField]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">검색 조건</span>
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value as SearchField)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {searchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">검색어</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={fieldPlaceholder[searchField]}
                className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setQuery("")}
                className="min-h-12 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              >
                초기화
              </button>
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-950">검색 결과</h2>
        <p className="text-sm text-slate-500">총 {filteredVehicles.length}대</p>
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:flex-col">
                <div>
                  <p className="text-sm font-semibold text-blue-600">{vehicle.clientName}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                    {vehicle.vehicleNumber}
                  </h3>
                </div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {vehicle.vehicleType}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <InfoRow label="운전자" value={vehicle.driverName} />
                <InfoRow label="센터" value={vehicle.centerName} />
                <InfoRow label="담당자" value={`${vehicle.managerName} · ${vehicle.managerPhone}`} />
                <InfoRow label="주행거리" value={vehicle.mileage} />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="font-medium text-slate-500">{vehicle.vehicleModel}</span>
                <span className="font-bold text-blue-600 transition group-hover:translate-x-1">
                  상세 보기
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-950">검색 결과가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-500">검색 조건이나 검색어를 다시 확인해 주세요.</p>
        </div>
      )}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800 sm:text-right">{value}</span>
    </div>
  );
}
