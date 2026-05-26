import type { PropsWithChildren } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { Profile } from "@/lib/auth/profile-types";

type SearchShellProps = PropsWithChildren<{
  profile: Profile;
}>;

export function SearchShell({ profile, children }: SearchShellProps) {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <AppSidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="차량 검색" />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
