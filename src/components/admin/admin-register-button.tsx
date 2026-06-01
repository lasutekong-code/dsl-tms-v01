import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminRegisterButton({ href, label = "등록" }: { href: string; label?: string }) {
  return (
    <Button asChild variant="register">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
