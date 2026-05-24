"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VehicleResultCard, type VehicleSearchResult } from "@/components/vehicle/vehicle-result-card";

export default function SearchPage() {
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
    <main className="container" style={{ padding: "32px 0" }}>
      <div className="stack">
        <div>
          <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>차량 검색</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            권한이 있는 차량만 표시되며 사진은 서버 권한 확인 후 signed URL로 불러옵니다.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
            <Input
              aria-label="검색어"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="거래처명, 차량번호, 운전자명"
              value={query}
            />
            <Button disabled={isLoading} type="submit">
              {isLoading ? "검색 중" : "검색"}
            </Button>
          </form>
        </Card>

        <p aria-live="polite" style={{ color: "var(--muted)", margin: 0 }}>
          {message}
        </p>

        <div className="stack">
          {results.map((result) => (
            <VehicleResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
