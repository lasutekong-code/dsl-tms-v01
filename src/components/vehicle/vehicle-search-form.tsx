"use client";

import { Search } from "lucide-react";
import { type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type VehicleSearchFormProps = {
  query: string;
  isLoading?: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
};

export function VehicleSearchForm({
  query,
  isLoading = false,
  onQueryChange,
  onSubmit,
  className,
}: VehicleSearchFormProps) {
  return (
    <form
      className={cn(
        "rounded-lg border border-border bg-white p-6 shadow-[0_1px_1.5px_rgba(0,0,0,0.1)]",
        className,
      )}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="차량 검색어"
            className="pl-10"
            disabled={isLoading}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="거래처명, 차량번호, 운전자명으로 검색"
            value={query}
          />
        </div>
        <Button className="sm:min-w-[104px]" disabled={isLoading} size="lg" type="submit">
          {isLoading ? "검색 중..." : "검색"}
        </Button>
      </div>
    </form>
  );
}
