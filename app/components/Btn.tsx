"use client";

type BtnVariant = "primary" | "ghost" | "danger-ghost";
type BtnSize = "sm" | "md";

export default function Btn({
  children,
  onClick,
  disabled,
  variant = "ghost",
  size = "md",
  fullWidth,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    fontWeight: 700,
    borderRadius: size === "sm" ? 10 : 12,
    border: "1.5px solid",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "all var(--transition)",
    fontFamily: "var(--font-sans)",
    whiteSpace: "nowrap" as const,
    width: fullWidth ? "100%" : undefined,
    fontSize: size === "sm" ? 13 : 14,
    padding: size === "sm" ? "0.35rem 0.75rem" : "0.6rem 1.1rem",
  };
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      background: "var(--accent)",
      borderColor: "var(--accent)",
      color: "#fff",
    },
    ghost: {
      background: "transparent",
      borderColor: "var(--border)",
      color: "var(--text)",
    },
    "danger-ghost": { background: "transparent", borderColor: "var(--danger)", color: "var(--danger)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}
