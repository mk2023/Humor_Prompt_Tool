"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  createFlavor,
  updateFlavor,
  deleteFlavor,
  createStep,
  updateStep,
  deleteStep,
  reorderSteps,
} from "@/app/actions/flavorActions";
import { Flavor, StepForm, User, ThemeMode, View } from "./types";
import { card, inputStyle, labelStyle } from "./styles";
import Btn from "./Btn";
import FlavorPanel from "./FlavorPanel";
import TestPanel from "./TestPanel";
import CaptionsBrowser from "./CaptionsBrowser";

function ThemeToggle({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}) {
  const modes: ThemeMode[] = ["light", "dark", "system"];
  const icons = { light: "☀️", dark: "🌙", system: "💻" };
  return (
    <div
      style={{
        display: "flex",
        background: "rgba(128,128,128,0.12)",
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          title={m}
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "none",
            background: mode === m ? "var(--bg-card)" : "transparent",
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: mode === m ? "var(--shadow-sm)" : "none",
            transition: "all var(--transition)",
          }}
        >
          {icons[m]}
        </button>
      ))}
    </div>
  );
}

export default function AdminShell({
  user,
  initialFlavors,
}: {
  user: User;
  initialFlavors: Flavor[];
}) {
  const [flavors, setFlavors] = useState<Flavor[]>(initialFlavors);
  const [view, setView] = useState<View>("flavors");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showNewFlavor, setShowNewFlavor] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    if (themeMode !== "system") html.classList.add(themeMode);
  }, [themeMode]);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    location.href = "/";
  };

  const handleCreateFlavor = async () => {
    if (!newSlug.trim()) return;
    setCreating(true);
    const res = await createFlavor(newSlug.trim(), newDesc.trim());
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
    } else {
      setFlavors((prev) => [{ ...res.data, humor_flavor_steps: [] }, ...prev]);
      setNewSlug("");
      setNewDesc("");
      setShowNewFlavor(false);
      showToast("Flavor created!");
    }
    setCreating(false);
  };

  const handleUpdateFlavor = async (id: number, slug: string, desc: string) => {
    const res = await updateFlavor(id, slug, desc);
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
      return;
    }
    setFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, slug, description: desc } : f)),
    );
    showToast("Flavor updated!");
  };

  const handleDeleteFlavor = async (id: number) => {
    if (!confirm("Delete this flavor and all its steps?")) return;
    const res = await deleteFlavor(id);
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
      return;
    }
    setFlavors((prev) => prev.filter((f) => f.id !== id));
    showToast("Flavor deleted.");
  };

  const handleStepCreate = async (
    flavorId: number,
    form: StepForm,
    order: number,
  ) => {
    const res = await createStep({
      humor_flavor_id: flavorId,
      ...form,
      order_by: order,
    });
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
      return;
    }
    setFlavors((prev) =>
      prev.map((f) =>
        f.id === flavorId
          ? { ...f, humor_flavor_steps: [...f.humor_flavor_steps, res.data] }
          : f,
      ),
    );
    showToast("Step added!");
  };

  const handleStepEdit = async (id: number, form: StepForm) => {
    const res = await updateStep(id, form);
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
      return;
    }
    setFlavors((prev) =>
      prev.map((f) => ({
        ...f,
        humor_flavor_steps: f.humor_flavor_steps.map((s) =>
          s.id === id ? { ...s, ...form } : s,
        ),
      })),
    );
    showToast("Step updated!");
  };

  const handleStepDelete = async (id: number) => {
    if (!confirm("Delete this step?")) return;
    const res = await deleteStep(id);
    if ("error" in res) {
      showToast(res.error ?? "Unknown error", "err");
      return;
    }
    setFlavors((prev) =>
      prev.map((f) => ({
        ...f,
        humor_flavor_steps: f.humor_flavor_steps.filter((s) => s.id !== id),
      })),
    );
    showToast("Step deleted.");
  };

  const handleStepReorder = async (flavorId: number, orderedIds: number[]) => {
    setFlavors((prev) =>
      prev.map((f) => {
        if (f.id !== flavorId) return f;
        const stepMap = Object.fromEntries(
          f.humor_flavor_steps.map((s) => [s.id, s]),
        );
        return {
          ...f,
          humor_flavor_steps: orderedIds.map((id, i) => ({
            ...stepMap[id],
            order_by: i + 1,
          })),
        };
      }),
    );
    const res = await reorderSteps(flavorId, orderedIds);
    if ("error" in res) showToast(res.error, "err");
  };

  const navItems: { key: View; label: string; icon: string }[] = [
    { key: "flavors", label: "Flavors" },
    { key: "test", label: "Test"},
    { key: "captions", label: "Already-Made Captions"},
  ];

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "var(--bg-sidebar)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 1.25rem 1.5rem 1.25rem" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Humor Lab
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {user.isSuperAdmin ? "SUPERADMIN" : "MATRIX ADMIN"}
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 0.75rem" }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background:
                  view === item.key ? "rgba(255,255,255,0.1)" : "transparent",
                color: view === item.key ? "#fff" : "rgba(255,255,255,0.55)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition)",
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ marginBottom: "0.85rem" }}>
            <ThemeToggle mode={themeMode} setMode={setThemeMode} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.75rem",
            }}
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                {user.name[0]}
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "0.45rem",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "2rem 2.5rem",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {view === "flavors" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Humor Flavors
                </h1>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {flavors.length} flavor{flavors.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Btn variant="primary" onClick={() => setShowNewFlavor(true)}>
                + New Flavor
              </Btn>
            </div>

            {showNewFlavor && (
              <div
                style={{
                  ...card,
                  marginBottom: "1.5rem",
                  border: "1.5px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  Create Humor Flavor
                </div>
                <div>
                  <label style={labelStyle}>Slug *</label>
                  <input
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. dry-wit"
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="primary"
                    onClick={handleCreateFlavor}
                    disabled={creating || !newSlug.trim()}
                  >
                    {creating ? "Creating…" : "Create Flavor"}
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setShowNewFlavor(false);
                      setNewSlug("");
                      setNewDesc("");
                    }}
                  >
                    Cancel
                  </Btn>
                </div>
              </div>
            )}

            {flavors.length === 0 ? (
              <div
                style={{
                  ...card,
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: "1rem" }}>🧪</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                  No humor flavors yet
                </div>
                <div style={{ fontSize: 14 }}>
                  Create your first flavor to get started
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {flavors.map((flavor) => (
                  <FlavorPanel
                    key={flavor.id}
                    flavor={flavor}
                    onUpdate={handleUpdateFlavor}
                    onDelete={handleDeleteFlavor}
                    onStepCreate={handleStepCreate}
                    onStepEdit={handleStepEdit}
                    onStepDelete={handleStepDelete}
                    onStepReorder={handleStepReorder}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === "test" && <TestPanel flavors={flavors} />}
        {view === "captions" && <CaptionsBrowser flavors={flavors} />}
      </main>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background:
              toast.type === "ok" ? "var(--success-bg)" : "var(--danger-bg)",
            border: `1.5px solid ${toast.type === "ok" ? "var(--success)" : "var(--danger)"}`,
            color: toast.type === "ok" ? "var(--success)" : "var(--danger)",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "var(--shadow-md)",
            zIndex: 9999,
            animation: "fadeInUp 200ms ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
