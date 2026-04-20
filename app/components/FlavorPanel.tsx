"use client";

import { useState } from "react";
import { Flavor, StepForm } from "./types";
import { defaultStepForm } from "./constants";
import { inputStyle, labelStyle } from "./styles";
import Btn from "./Btn";
import StepCard from "./StepCard";
import StepFormFields from "./StepFormFields";

function suggestDuplicateSlug(base: string, existing: string[]): string {
  const taken = new Set(existing.map((s) => s.trim()));
  let candidate = `${base}-copy`;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-copy-${n}`;
    n += 1;
  }
  return candidate;
}

export default function FlavorPanel({
  flavor,
  existingSlugs,
  onUpdate,
  onDelete,
  onDuplicate,
  onStepCreate,
  onStepEdit,
  onStepDelete,
  onStepReorder,
}: {
  flavor: Flavor;
  existingSlugs: string[];
  onUpdate: (id: number, slug: string, desc: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDuplicate: (
    sourceId: number,
    newSlug: string,
    newDescription: string,
  ) => Promise<boolean>;
  onStepCreate: (
    flavorId: number,
    form: StepForm,
    order: number,
  ) => Promise<void>;
  onStepEdit: (id: number, form: StepForm) => Promise<void>;
  onStepDelete: (id: number) => Promise<void>;
  onStepReorder: (flavorId: number, orderedIds: number[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(false);
  const [slug, setSlug] = useState(flavor.slug);
  const [desc, setDesc] = useState(flavor.description || "");
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepForm, setNewStepForm] = useState<StepForm>(defaultStepForm());
  const [saving, setSaving] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [dupSlug, setDupSlug] = useState("");
  const [dupDesc, setDupDesc] = useState("");
  const [duplicating, setDuplicating] = useState(false);

  const steps = [...flavor.humor_flavor_steps].sort(
    (a, b) => a.order_by - b.order_by,
  );

  const handleUpdateFlavor = async () => {
    setSaving(true);
    await onUpdate(flavor.id, slug.trim(), desc.trim());
    setSaving(false);
    setEditingFlavor(false);
  };

  const handleAddStep = async () => {
    setSaving(true);
    await onStepCreate(flavor.id, newStepForm, steps.length + 1);
    setSaving(false);
    setNewStepForm(defaultStepForm());
    setShowAddStep(false);
  };

  const handleMoveUp = async (id: number) => {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    const reordered = [...steps];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    setSaving(true);
    await onStepReorder(
      flavor.id,
      reordered.map((s) => s.id),
    );
    setSaving(false);
  };

  const handleMoveDown = async (id: number) => {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx >= steps.length - 1) return;
    const reordered = [...steps];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    setSaving(true);
    await onStepReorder(
      flavor.id,
      reordered.map((s) => s.id),
    );
    setSaving(false);
  };

  const openDuplicate = () => {
    setDupSlug(suggestDuplicateSlug(flavor.slug, existingSlugs));
    setDupDesc(flavor.description || "");
    setShowDuplicate(true);
    setExpanded(true);
  };

  const handleDuplicate = async () => {
    if (!dupSlug.trim()) return;
    setDuplicating(true);
    const ok = await onDuplicate(flavor.id, dupSlug.trim(), dupDesc.trim());
    setDuplicating(false);
    if (ok) setShowDuplicate(false);
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          cursor: "pointer",
          background: expanded ? "var(--bg-hover)" : "var(--bg-card)",
          transition: "background var(--transition)",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          style={{
            fontSize: 16,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          ▶
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{flavor.slug}</div>
          {flavor.description && (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {flavor.description}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </span>
          <div
            style={{ display: "flex", gap: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingFlavor(true);
                setExpanded(true);
              }}
            >
              Edit
            </Btn>
            <Btn variant="ghost" size="sm" onClick={openDuplicate}>
              Duplicate
            </Btn>
            <Btn
              variant="danger-ghost"
              size="sm"
              onClick={() => onDelete(flavor.id)}
            >
              Delete
            </Btn>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            padding: "0 1.25rem 1.25rem 1.25rem",
            borderTop: "1.5px solid var(--border)",
          }}
        >
          {/* Duplicate flavor */}
          {showDuplicate && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "var(--step-bg)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontWeight: 700 }}>Duplicate flavor</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Creates a new flavor with the same {steps.length} step
                {steps.length !== 1 ? "s" : ""}. Choose a unique slug.
              </p>
              <div>
                <label style={labelStyle}>New slug *</label>
                <input
                  value={dupSlug}
                  onChange={(e) => setDupSlug(e.target.value)}
                  placeholder="e.g. dry-wit-variant"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={dupDesc}
                  onChange={(e) => setDupDesc(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={handleDuplicate}
                  disabled={duplicating || !dupSlug.trim()}
                >
                  {duplicating ? "Duplicating…" : "Duplicate"}
                </Btn>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDuplicate(false)}
                  disabled={duplicating}
                >
                  Cancel
                </Btn>
              </div>
            </div>
          )}

          {/* Edit flavor form */}
          {editingFlavor && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "var(--step-bg)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--accent)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. dry-wit"
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateFlavor}
                  disabled={saving || !slug.trim()}
                >
                  {saving ? "Saving…" : "Save"}
                </Btn>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingFlavor(false);
                    setSlug(flavor.slug);
                    setDesc(flavor.description || "");
                  }}
                >
                  Cancel
                </Btn>
              </div>
            </div>
          )}

          {/* Steps list */}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {steps.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                No steps yet.
              </p>
            )}
            {steps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                index={idx}
                total={steps.length}
                saving={saving}
                onEdit={async (id, form) => {
                  setSaving(true);
                  await onStepEdit(id, form);
                  setSaving(false);
                }}
                onDelete={async (id) => {
                  setSaving(true);
                  await onStepDelete(id);
                  setSaving(false);
                }}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </div>

          {/* Add step */}
          <div style={{ marginTop: "1rem" }}>
            {showAddStep ? (
              <div
                style={{
                  padding: "1rem",
                  background: "var(--step-bg)",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px dashed var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  New Step {steps.length + 1}
                </div>
                <StepFormFields
                  form={newStepForm}
                  onChange={setNewStepForm}
                  disabled={saving}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="primary"
                    size="sm"
                    onClick={handleAddStep}
                    disabled={saving}
                  >
                    {saving ? "Adding…" : "Add Step"}
                  </Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddStep(false);
                      setNewStepForm(defaultStepForm());
                    }}
                  >
                    Cancel
                  </Btn>
                </div>
              </div>
            ) : (
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setShowAddStep(true)}
              >
                + Add Step
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
