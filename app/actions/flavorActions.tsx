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

const flavorWithStepsSelect = `
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
`;

/** Copy a flavor and all of its steps under a new unique slug. */
export async function duplicateFlavor(
  sourceFlavorId: number,
  newSlug: string,
  description?: string,
) {
  const supabase = await createSupabaseClient();
  const slug = newSlug.trim();
  if (!slug) return { error: "Slug is required" };

  const { data: slugConflict } = await supabase
    .from("humor_flavors")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugConflict) return { error: "A flavor with this slug already exists" };

  const { data: source, error: loadErr } = await supabase
    .from("humor_flavors")
    .select(
      `description, humor_flavor_steps (
        order_by,
        description,
        llm_system_prompt,
        llm_user_prompt,
        llm_temperature,
        llm_input_type_id,
        llm_output_type_id,
        llm_model_id,
        humor_flavor_step_type_id
      )`,
    )
    .eq("id", sourceFlavorId)
    .single();

  if (loadErr) return { error: loadErr.message };
  if (!source) return { error: "Source flavor not found" };

  const rawSteps = source.humor_flavor_steps ?? [];
  const sortedSteps = [...rawSteps].sort((a, b) => a.order_by - b.order_by);

  const newDescription =
    description !== undefined ? description.trim() : (source.description ?? "");

  const { data: newFlavorRow, error: insertFlavorErr } = await supabase
    .from("humor_flavors")
    .insert({
      slug,
      description: newDescription,
      created_datetime_utc: new Date().toISOString(),
    })
    .select("id, slug, description, created_datetime_utc")
    .single();

  if (insertFlavorErr) return { error: insertFlavorErr.message };

  const newId = newFlavorRow.id;
  const now = new Date().toISOString();

  if (sortedSteps.length > 0) {
    const stepRows = sortedSteps.map((s, i) => ({
      humor_flavor_id: newId,
      description: s.description,
      llm_system_prompt: s.llm_system_prompt,
      llm_user_prompt: s.llm_user_prompt,
      llm_temperature: s.llm_temperature,
      llm_input_type_id: s.llm_input_type_id,
      llm_output_type_id: s.llm_output_type_id,
      llm_model_id: s.llm_model_id,
      humor_flavor_step_type_id: s.humor_flavor_step_type_id,
      order_by: i + 1,
      created_datetime_utc: now,
    }));
    const { error: stepsErr } = await supabase.from("humor_flavor_steps").insert(stepRows);
    if (stepsErr) {
      await supabase.from("humor_flavors").delete().eq("id", newId);
      return { error: stepsErr.message };
    }
  }

  const { data: fullFlavor, error: reloadErr } = await supabase
    .from("humor_flavors")
    .select(flavorWithStepsSelect)
    .eq("id", newId)
    .single();

  if (reloadErr || !fullFlavor) return { error: reloadErr?.message ?? "Failed to load duplicated flavor" };
  return { data: fullFlavor };
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
