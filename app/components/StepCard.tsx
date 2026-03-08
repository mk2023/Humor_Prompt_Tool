"use client";

import { useState, useTransition } from "react";
import { Step, StepForm } from "./types";
import { LLM_MODELS, INPUT_TYPES, OUTPUT_TYPES, STEP_TYPES } from "./constants";
import { arrowBtn } from "./styles";
import Btn from "./Btn";
import StepFormFields from "./StepFormFields";

export default function StepCard({
  step,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  saving,
}: {
  step: Step;
  index: number;
  total: number;
  onEdit: (id: number, form: StepForm) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<StepForm>({
    description: step.description,
    llm_system_prompt: step.llm_system_prompt,
    llm_user_prompt: step.llm_user_prompt,
    llm_temperature: step.llm_temperature,
    llm_input_type_id: step.llm_input_type_id,
    llm_output_type_id: step.llm_output_type_id,
    llm_model_id: step.llm_model_id,
    humor_flavor_step_type_id: step.humor_flavor_step_type_id,
  });
  const [pending, startTransition] = useTransition();
  const busy = pending || saving;

  const modelName =
    LLM_MODELS.find((m) => m.id === step.llm_model_id)?.name ??
    `Model ${step.llm_model_id}`;
  const stepTypeName =
    STEP_TYPES.find((t) => t.id === step.humor_flavor_step_type_id)?.name ??
    "General";
  const inputTypeName =
    INPUT_TYPES.find((t) => t.id === step.llm_input_type_id)?.name ?? "";
  const outputTypeName =
    OUTPUT_TYPES.find((t) => t.id === step.llm_output_type_id)?.name ?? "";

  const save = () => {
    startTransition(async () => {
      await onEdit(step.id, form);
      setEditing(false);
    });
  };

  return (
    <div
      style={{
        background: "var(--step-bg)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      {/* Order controls */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          minWidth: 32,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <button
          onClick={() => onMoveUp(step.id)}
          disabled={index === 0 || busy}
          style={arrowBtn(index === 0 || busy)}
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(step.id)}
          disabled={index === total - 1 || busy}
          style={arrowBtn(index === total - 1 || busy)}
        >
          ↓
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <>
            <StepFormFields form={form} onChange={setForm} disabled={busy} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn variant="primary" size="sm" onClick={save} disabled={busy}>
                {pending ? "Saving…" : "Save"}
              </Btn>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Cancel
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {step.description && (
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {step.description}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {[
                stepTypeName,
                modelName,
                `temp: ${step.llm_temperature}`,
                inputTypeName,
                `→ ${outputTypeName}`,
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: 999,
                    border: "1.5px solid var(--border)",
                    color: "var(--text-muted)",
                    background: "var(--bg-hover)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {step.llm_system_prompt && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  System:{" "}
                </span>
                {step.llm_system_prompt.slice(0, 120)}
                {step.llm_system_prompt.length > 120 ? "…" : ""}
              </div>
            )}
            {step.llm_user_prompt && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  User:{" "}
                </span>
                {step.llm_user_prompt.slice(0, 120)}
                {step.llm_user_prompt.length > 120 ? "…" : ""}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            disabled={busy}
          >
            ✏️
          </Btn>
          <Btn
            variant="danger-ghost"
            size="sm"
            onClick={() => onDelete(step.id)}
            disabled={busy}
          >
            🗑️
          </Btn>
        </div>
      )}
    </div>
  );
}
