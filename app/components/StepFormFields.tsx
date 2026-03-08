"use client";

import { StepForm } from "./types";
import { LLM_MODELS, INPUT_TYPES, OUTPUT_TYPES, STEP_TYPES } from "./constants";
import { inputStyle, labelStyle } from "./styles";

export default function StepFormFields({
  form,
  onChange,
  disabled,
}: {
  form: StepForm;
  onChange: (f: StepForm) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof StepForm, value: any) =>
    onChange({ ...form, [key]: value });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div>
        <label style={labelStyle}>Description</label>
        <input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What does this step do?"
          style={inputStyle}
          disabled={disabled}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <div>
          <label style={labelStyle}>Step Type</label>
          <select
            value={form.humor_flavor_step_type_id}
            onChange={(e) =>
              set("humor_flavor_step_type_id", Number(e.target.value))
            }
            style={inputStyle}
            disabled={disabled}
          >
            {STEP_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Model</label>
          <select
            value={form.llm_model_id}
            onChange={(e) => set("llm_model_id", Number(e.target.value))}
            style={inputStyle}
            disabled={disabled}
          >
            {LLM_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Temperature</label>
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={form.llm_temperature}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              set("llm_temperature", isNaN(val) ? 0.7 : val);
            }}
            style={inputStyle}
            disabled={disabled}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <div>
          <label style={labelStyle}>Input Type</label>
          <select
            value={form.llm_input_type_id}
            onChange={(e) => set("llm_input_type_id", Number(e.target.value))}
            style={inputStyle}
            disabled={disabled}
          >
            {INPUT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Output Type</label>
          <select
            value={form.llm_output_type_id}
            onChange={(e) => set("llm_output_type_id", Number(e.target.value))}
            style={inputStyle}
            disabled={disabled}
          >
            {OUTPUT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>System Prompt</label>
        <textarea
          value={form.llm_system_prompt}
          onChange={(e) => set("llm_system_prompt", e.target.value)}
          rows={3}
          placeholder="You are a helpful assistant that..."
          disabled={disabled}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div>
        <label style={labelStyle}>User Prompt</label>
        <textarea
          value={form.llm_user_prompt}
          onChange={(e) => set("llm_user_prompt", e.target.value)}
          rows={3}
          placeholder="Given the image, please..."
          disabled={disabled}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>
    </div>
  );
}
