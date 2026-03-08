import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) redirect("/admin");

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
      background: "var(--bg)",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{
          display: "inline-block",
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "0.35rem 0.85rem",
          borderRadius: 999,
          marginBottom: "1.25rem",
        }}>
          Admin Access Only
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "0.75rem",
          color: "var(--text)",
        }}>
          Humor Lab
        </h1>
        <p style={{
          color: "var(--text-muted)",
          fontSize: 16,
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}>
          Prompt chain tool for playing around with humor flavors.<br />
          Sign in with a Google account to continue.
        </p>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
