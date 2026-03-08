import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";
import AdminShell from "@/app/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_superadmin, is_matrix_admin, full_name, avatar_url, email")
    .eq("id", userData.user.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && !profile?.is_superadmin && !profile?.is_matrix_admin) {
    redirect("/?error=unauthorized");
  }

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
        isSuperAdmin: profile?.is_superadmin ?? false,
        isMatrixAdmin: profile?.is_matrix_admin ?? false,
      }}
      initialFlavors={flavors ?? []}
    />
  );
}
