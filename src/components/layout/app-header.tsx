import { signOut } from "@/app/login/actions";
import type { AuthProfile } from "@/lib/auth/get-profile";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<AuthProfile["role"], string> = {
  admin: "관리자",
  client_manager: "거래처담당자",
  owner: "사업주",
  driver: "운전자",
  staff: "내부직원",
};

type AppHeaderProps = {
  profile: AuthProfile;
  title?: string;
};

export function AppHeader({ profile, title }: AppHeaderProps) {
  const displayName = profile.name?.trim() || profile.email;

  return (
    <header className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate text-lg font-semibold text-[#171717]">
              {title}
            </h1>
          ) : (
            <p className="text-sm font-semibold text-[#171717]">차량관리</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-[#171717]">{displayName}</p>
            <p className="text-xs text-[#525252]">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="default">
              로그아웃
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
