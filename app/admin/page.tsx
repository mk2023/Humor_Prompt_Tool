import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import AdminShell from "@/app/components/AdminShell";
import { isAdminUser } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseClient();

  let userData: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"] = { user: null };
  try {
    const result = await supabase.auth.getUser();
    userData = result.data;
  } catch {
    userData = { user: null };
  }
  if (!userData?.user) redirect("/");

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  const isAdmin = isAdminUser(roleProfile, userData.user);
  if (!isAdmin) {
    redirect("/?error=unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email, is_superadmin, is_matrix_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select(`
      id,
      slug,
      description,
      created_datetime_utc,
      humor_flavor_steps (
        id,
        order_by,
        description,
        llm_system_prompt,
        llm_user_prompt,
        llm_temperature,
        llm_input_type_id,
        llm_output_type_id,
        llm_model_id,
        humor_flavor_step_type_id,
        created_datetime_utc
      )
    `)
    .order("created_datetime_utc", { ascending: false });

  return (
    <AdminShell
      user={{
        id: profile?.id ?? userData.user.id,
        name: profile?.full_name ?? userData.user.email ?? "Dev User",
        email: profile?.email ?? userData.user.email ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        isSuperAdmin: profile?.is_superadmin ?? roleProfile?.is_superadmin ?? false,
        isMatrixAdmin: profile?.is_matrix_admin ?? roleProfile?.is_matrix_admin ?? false,
      }}
      initialFlavors={flavors ?? []}
    />
  );
}