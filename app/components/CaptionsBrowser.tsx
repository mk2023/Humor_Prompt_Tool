"use client";

import { useState, useTransition } from "react";
import { getCaptionsForFlavor } from "@/app/actions/flavorActions";
import { Flavor } from "./types";
import { inputStyle, card, sectionHeading } from "./styles";
import Btn from "./Btn";

export default function CaptionsBrowser({ flavors }: { flavors: Flavor[] }) {
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [loading, startTransition] = useTransition();
  const [captions, setCaptions] = useState<any[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    if (!selectedFlavor) return;
    setCaptions([]);
    setError("");
    startTransition(async () => {
      const res = await getCaptionsForFlavor(Number(selectedFlavor));
      if ("error" in res) setError(res.error ?? "Unknown error");
      else setCaptions(res.data);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={sectionHeading}>Already-Made Captions</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Read the captions produced by a specific humor flavor
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
        <select
          value={selectedFlavor}
          onChange={(e) => setSelectedFlavor(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        >
          <option value="">Choose a flavor…</option>
          {flavors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.slug}
            </option>
          ))}
        </select>
        <Btn
          variant="primary"
          onClick={load}
          disabled={loading || !selectedFlavor}
        >
          {loading ? "Loading…" : "Load Captions"}
        </Btn>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "var(--danger-bg)",
            border: "1.5px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            color: "var(--danger)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {captions.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {captions.map((c) => {
            const imgUrl = Array.isArray(c.image)
              ? c.image[0]?.url
              : c.image?.url;
            return (
              <div
                key={c.id}
                style={{
                  ...card,
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {imgUrl && (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4/3",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      background: "var(--bg-hover)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <p style={{ fontSize: 13, lineHeight: 1.55, fontWeight: 600 }}>
                  {c.content}
                </p>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {new Date(c.created_datetime_utc).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {captions.length === 0 && selectedFlavor && !loading && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          As of right now, there are no captions found for this flavor.
        </p>
      )}
    </div>
  );
}
