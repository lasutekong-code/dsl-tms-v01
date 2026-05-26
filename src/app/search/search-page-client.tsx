"use client";

import { FormEvent, useState } from "react";

import { VehicleResultCard, type VehicleSearchResult } from "@/components/vehicle/vehicle-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VehicleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("거래처명, 차량번호, 운전자명을 입력해 검색하세요.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setMessage("검색어를 입력해 주세요.");
      setResults([]);
      return;
    }

    setIsLoading(true);
    setMessage("검색 중입니다.");

    const response = await fetch(`/api/vehicles/search?q=${encodeURIComponent(trimmedQuery)}`);

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      setMessage("검색 중 오류가 발생했습니다.");
      setResults([]);
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as { results: VehicleSearchResult[] };
    setResults(body.results);
    setMessage(body.results.length > 0 ? `${body.results.length}건을 찾았습니다.` : "검색 결과가 없습니다.");
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">차량 검색</h1>
        <p className="mt-1 text-sm text-slate-600">
          권한이 있는 차량만 표시되며 사진은 signed URL로 불러옵니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <Input
              aria-label="검색어"
              placeholder="거래처명, 차량번호, 운전자명"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button disabled={isLoading} type="submit" className="sm:w-28">
              {isLoading ? "검색 중" : "검색"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p aria-live="polite" className="text-sm text-slate-500">
        {message}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((result) => (
          <VehicleResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
