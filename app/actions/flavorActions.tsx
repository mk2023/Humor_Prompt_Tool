"use server";

import { createSupabaseClient } from "@/lib/supabase/supabaseServer";

const API_BASE = "https://api.almostcrackd.ai";

async function getAuthToken() {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token;
}

//Creating a new Humor Flavor:

export async function createFlavor(slug: string, description: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("humor_flavors")
    .insert({ slug, description, created_datetime_utc: new Date().toISOString() })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

//Updating an existing flavor:
export async function updateFlavor(id: number, slug: string, description: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("humor_flavors")
    .update({ slug, description })
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

//Deleting a flavor:
export async function deleteFlavor(id: number) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("humor_flavors")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  return { data: true };
}

//Creating a new step:
export async function createStep(payload: {
  humor_flavor_id: number;
  description: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  order_by: number;
}) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .insert({ ...payload, created_datetime_utc: new Date().toISOString() })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

//Updating a step:
export async function updateStep(
  id: number,
  payload: {
    description: string;
    llm_system_prompt: string;
    llm_user_prompt: string;
    llm_temperature: number;
    llm_input_type_id: number;
    llm_output_type_id: number;
    llm_model_id: number;
    humor_flavor_step_type_id: number;
  }
) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

export async function deleteStep(id: number) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  return { data: true };
}

export async function reorderSteps(flavorId: number, orderedIds: number[]) {
  const supabase = await createSupabaseClient();
  const updates = orderedIds.map((id, idx) =>
    supabase
      .from("humor_flavor_steps")
      .update({ order_by: idx + 1 })
      .eq("id", id)
      .eq("humor_flavor_id", flavorId)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { error: firstError.error.message };
  return { data: true };
}


//Testing the steps:
export async function testFlavor( flavorId: number, imageId: string | null, imageUrl: string | null) {
    const token = await getAuthToken();
    if (!token) return { error: "Not authenticated" };

    let finalImageId: string | null = imageId;

    if (!finalImageId && imageUrl) {
        const registerResp = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl, isCommonUse: false }),
        });
        if (!registerResp.ok) {
            let msg = `Register failed ${registerResp.status}`;
            try { msg = await registerResp.text(); } catch {}
            return { error: msg };
         }
        const json = await registerResp.json();
        finalImageId = String(json.imageId);
    }

    const body = { imageId: finalImageId, humorFlavorId: flavorId };
    console.log("body being sent:", JSON.stringify(body));

    const resp = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        let msg = `API error ${resp.status}`;
        try { msg = await resp.text(); } catch {}
        return { error: msg };
    }
    return { data: await resp.json() };
}

// Reading Captions for a Specific Flavor

export async function getCaptionsForFlavor(flavorId: number) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image:images(url)")
    .eq("humor_flavor_id", flavorId)
    .order("created_datetime_utc", { ascending: false })
    .limit(30);
  if (error) return { error: error.message };
  return { data: data ?? [] };
}
