import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";
import { getAdminDebugInfo, isAdminUser } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createSupabaseClient();
  let data: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"] = { user: null };
  try {
    const result = await supabase.auth.getUser();
    data = result.data;
  } catch {
    // Invalid refresh token cookies should behave like signed-out users.
  }
  const params = await searchParams;
  let accessDebug: {
    profileFound: boolean;
    profileSuperadmin: boolean;
    profileMatrixAdmin: boolean;
    appMetadataAdmin: boolean;
    userMetadataAdmin: boolean;
    isAdmin: boolean;
    profileQueryError: string | null;
    userId: string | null;
  } | null = null;

  if (data?.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_superadmin, is_matrix_admin")
      .eq("id", data.user.id)
      .maybeSingle();

    const debug = getAdminDebugInfo(profile, data.user);
    accessDebug = {
      ...debug,
      profileQueryError: profileError?.message ?? null,
      userId: data.user.id,
    };

    if (isAdminUser(profile, data.user)) {
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
          <>
            <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--danger-bg)", border: "1.5px solid var(--danger)", borderRadius: 14, color: "var(--danger)", fontWeight: 600, fontSize: 15 }}>
              You are not authorized to access this page. You must be a superadmin or matrix admin.
            </div>
            {accessDebug && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "0.9rem 1rem",
                  textAlign: "left",
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--text)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Access debug</div>
                <div>user_id: {accessDebug.userId ?? "none"}</div>
                <div>profile_found: {String(accessDebug.profileFound)}</div>
                <div>profile.is_superadmin: {String(accessDebug.profileSuperadmin)}</div>
                <div>profile.is_matrix_admin: {String(accessDebug.profileMatrixAdmin)}</div>
                <div>app_metadata admin flag: {String(accessDebug.appMetadataAdmin)}</div>
                <div>user_metadata admin flag: {String(accessDebug.userMetadataAdmin)}</div>
                <div>computed_is_admin: {String(accessDebug.isAdmin)}</div>
                <div>profile_query_error: {accessDebug.profileQueryError ?? "none"}</div>
              </div>
            )}
          </>
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