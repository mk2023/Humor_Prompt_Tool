export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--border)",
  background: "var(--bg-input)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  fontFamily: "var(--font-sans)",
};

export const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: 6,
};

export const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "1.25rem",
  boxShadow: "var(--shadow-sm)",
};

export const sectionHeading: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  marginBottom: "0.35rem",
};

export const arrowBtn = (disabled: boolean): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: 6,
  border: "1.5px solid var(--border)",
  background: "var(--bg-card)",
  color: disabled ? "var(--text-muted)" : "var(--text)",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  opacity: disabled ? 0.4 : 1,
  transition: "all var(--transition)",
});
