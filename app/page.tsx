import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";
import { isAdminUser } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const params = await searchParams;

  if (data?.user && !params.error) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin, is_matrix_admin")
      .eq("id", data.user.id)
      .single();

    const isDev = process.env.NODE_ENV === "development";
    if (isDev || isAdminUser(profile, data.user)) {
      redirect("/admin");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", background: "var(--bg)", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ display: "inline-block", background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.35rem 0.85rem", borderRadius: 999, marginBottom: "1.25rem" }}>
          Admin Access Only
        </div>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
          Humor Lab
        </h1>

        {params.error === "unauthorized" ? (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--danger-bg)", border: "1.5px solid var(--danger)", borderRadius: 14, color: "var(--danger)", fontWeight: 600, fontSize: 15 }}>
            You are not authorized to access this page. You must be a superadmin or matrix admin.
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: "2rem", lineHeight: 1.6 }}>
            Prompt chain manager for humor flavors.<br />
            Sign in with a superadmin account to continue.
          </p>
        )}

        <GoogleLoginButton />
      </div>
    </main>
  );
}