import { Truck } from "lucide-react";

import type { Profile } from "@/lib/auth/get-profile";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  profile?: Pick<Profile, "name" | "role"> | null;
  className?: string;
}

const ROLE_LABELS: Record<Profile["role"], string> = {
  admin: "관리자",
  client_manager: "거래처담당자",
  owner: "사업주",
  driver: "운전자",
  staff: "내부직원",
};

export function AppHeader({ profile, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">
              차량관리 시스템
            </p>
            {profile ? (
              <p className="truncate text-xs text-muted-foreground">
                {profile.name} · {ROLE_LABELS[profile.role]}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
