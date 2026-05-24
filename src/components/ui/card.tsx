import type { HTMLAttributes, PropsWithChildren } from "react";

export function Card({ children, style, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      {...props}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        padding: 20,
        ...style
      }}
    >
      {children}
    </div>
  );
}
