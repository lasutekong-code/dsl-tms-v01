import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        border: "1px solid transparent",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 700,
        padding: "12px 16px",
        background:
          variant === "primary" ? "var(--primary)" : variant === "danger" ? "var(--danger)" : "#eef2f7",
        color: variant === "primary" || variant === "danger" ? "var(--primary-foreground)" : "var(--foreground)",
        ...style
      }}
    />
  );
}
