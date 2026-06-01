import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function AdminEntityLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("font-medium text-blue-600 hover:underline", className)}>
      {children}
    </Link>
  );
}
