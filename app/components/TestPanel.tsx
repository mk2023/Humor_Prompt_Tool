"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import { testFlavor } from "@/app/actions/flavorActions";
import { Flavor } from "./types";
import { inputStyle, labelStyle, card, sectionHeading } from "./styles";
import Btn from "./Btn";

export default function TestPanel({ flavors }: { flavors: Flavor[] }) {
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);
  const [running, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingImages(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("images")
        .select("id, url")
        .order("created_datetime_utc", { ascending: false })
        .limit(20);
      setImages(data ?? []);
      setLoadingImages(false);
    };
    load();
  }, []);

  const canRun =
    !!selectedFlavor && (!!selectedImageId || !!customImageUrl.trim());

  const run = () => {
    if (!canRun) return;
    setResult(null);
    setError("");
    startTransition(async () => {
      const res = await testFlavor(
        Number(selectedFlavor),
        selectedImageId || null,
        customImageUrl.trim() || null,
      );
      if ("error" in res) setError(res.error ?? "Unknown error");
      else setResult(res.data);
    });
  };

  return (
    <div
      style={{
        maxWidth: 720,
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div>
        <h2 style={sectionHeading}>Test a Humor Flavor</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Pick a flavor and an image to generate captions.
        </p>
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Flavor picker */}
          <div>
            <label style={labelStyle}>Humor Flavor</label>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a flavor!</option>
              {flavors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.slug}
                </option>
              ))}
            </select>
          </div>

          {/* Existing images grid */}
          <div>
            <label style={labelStyle}>Pick from the existing images</label>
            {loadingImages ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                Loading images…
              </p>
            ) : images.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                No images found.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedImageId(img.id);
                      setCustomImageUrl("");
                    }}
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        selectedImageId === img.id
                          ? "2.5px solid var(--accent)"
                          : "2px solid var(--border)",
                      aspectRatio: "1",
                      position: "relative",
                      transition: "border var(--transition)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {selectedImageId === img.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "var(--accent)",
                          borderRadius: 999,
                          width: 18,
                          height: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#fff",
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Custom URL */}
          <div>
            <label style={labelStyle}>Or...paste your own image URL</label>
            <input
              value={customImageUrl}
              onChange={(e) => {
                setCustomImageUrl(e.target.value);
                setSelectedImageId("");
              }}
              placeholder="https://example.com/image.jpg"
              style={inputStyle}
            />
          </div>

          <Btn variant="primary" onClick={run} disabled={running || !canRun}>
            {running ? "Generating…" : "Generate Captions"}
          </Btn>
        </div>
      </div>

      {/* Error */}
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

      {/* Results */}
      {result && (
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>
            The generated captions!
          </div>
          {Array.isArray(result) ? (
            <ol
              style={{
                paddingLeft: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {result.map((c: any, i: number) => (
                <li
                  key={c.id ?? i}
                  style={{
                    padding: "0.65rem 0.85rem",
                    background: "var(--step-bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {c.content ?? c.caption ?? JSON.stringify(c)}
                </li>
              ))}
            </ol>
          ) : (
            <pre
              style={{
                fontSize: 12,
                overflow: "auto",
                fontFamily: "var(--font-mono)",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
