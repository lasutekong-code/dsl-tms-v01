"use client";

import { type FormEvent, useState } from "react";

import { VehicleEmptyState } from "@/components/vehicle/vehicle-empty-state";
import { VehicleResultList } from "@/components/vehicle/vehicle-result-list";
import { VehicleSearchForm } from "@/components/vehicle/vehicle-search-form";
import { VehicleSearchLoading } from "@/components/vehicle/vehicle-search-loading";
import type { VehicleSearchResult } from "@/types/vehicle";

type SearchPhase = "idle" | "loading" | "success" | "empty" | "error";

export function VehicleSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VehicleSearchResult[]>([]);
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setLastQuery(null);
      setErrorMessage(null);
      setPhase("idle");
      return;
    }

    setPhase("loading");
    setErrorMessage(null);
    setLastQuery(trimmedQuery);

    try {
      const response = await fetch(`/api/vehicles/search?q=${encodeURIComponent(trimmedQuery)}`);

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setResults([]);
        setPhase("error");
        setErrorMessage(body?.error ?? "검색 중 오류가 발생했습니다.");
        return;
      }

      const data = (await response.json()) as VehicleSearchResult[];
      setResults(data);
      setPhase(data.length > 0 ? "success" : "empty");
    } catch {
      setResults([]);
      setPhase("error");
      setErrorMessage("네트워크 오류로 검색에 실패했습니다.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <VehicleSearchForm isLoading={phase === "loading"} onQueryChange={setQuery} onSubmit={handleSubmit} query={query} />

      {phase === "idle" ? (
        <VehicleEmptyState description="검색 버튼을 누르거나 Enter 키를 입력해 주세요." title="검색어를 입력하십시오." />
      ) : null}

      {phase === "loading" ? <VehicleSearchLoading /> : null}

      {phase === "error" ? (
        <VehicleEmptyState
          description={errorMessage ?? undefined}
          title="검색 중 오류가 발생했습니다."
        />
      ) : null}

      {phase === "empty" ? (
        <VehicleEmptyState
          description={lastQuery ? `"${lastQuery}"에 해당하는 차량이 없습니다.` : undefined}
          title="검색 결과가 없습니다."
        />
      ) : null}

      {phase === "success" ? (
        <>
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{results.length}</span>
            개의 차량이 검색되었습니다.
          </p>
          <VehicleResultList results={results} />
        </>
      ) : null}
    </div>
  );
}
