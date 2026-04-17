"use client";

import { CheckCircle2, ArrowLeft, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProcessingStatusProps {
  status: string;
  progress: {
    totalFiles: number;
    parsedFiles: number;
    failedFiles: number;
    percentage: number;
  } | null;
  repoName?: string;
}

interface Step {
  key: string;
  label: string;
  getSubtitle: (progress: ProcessingStatusProps["progress"], status: string) => string;
}

const STEPS: Step[] = [
  {
    key: "CLONING",
    label: "Cloning Repository",
    getSubtitle: (_, status) =>
      status === "CLONING" ? "Fetching source code from GitHub…" : "Repository cloned successfully",
  },
  {
    key: "READING",
    label: "Reading Files",
    getSubtitle: (progress, status) =>
      status === "READING"
        ? "Scanning file tree…"
        : progress?.totalFiles
        ? `Discovered ${progress.totalFiles} supported files`
        : "Scanning file tree…",
  },
  {
    key: "PARSING",
    label: "Parsing Files",
    getSubtitle: (progress, status) =>
      status === "PARSING" && progress
        ? `Parsing ${progress.parsedFiles} of ${progress.totalFiles} files…`
        : "Extracting imports, exports and functions",
  },
  {
    key: "GRAPHING",
    label: "Building Graph",
    getSubtitle: () => "Mapping file relationships…",
  },
];

const ORDER = ["CLONING", "READING", "PARSING", "GRAPHING"];

type StepState = "done" | "active" | "pending";

function getState(stepKey: string, currentStatus: string): StepState {
  const si = ORDER.indexOf(stepKey);
  const ci = ORDER.indexOf(currentStatus);
  if (ci === -1) return "pending";
  if (si < ci) return "done";
  if (si === ci) return "active";
  return "pending";
}

export default function ProcessingStatus({ status, progress, repoName }: ProcessingStatusProps) {
  const router = useRouter();

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#252525",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      {/* Glow background */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: "transparent",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "#303030",
        border: "1px solid #303030",
        borderRadius: 20,
        padding: "44px 52px",
        width: "100%",
        maxWidth: 500,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,69,0,0.06)",
        position: "relative",
      }}>
        {/* Title with spinner */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            margin: "0 auto 20px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid #303030",
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "#ff4500",
              animation: "spin 0.9s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GitBranch size={20} color="#ff4500" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#fff" }}>
            Analyzing Repository
          </h2>
          {repoName && (
            <p style={{ margin: "6px 0 0", fontSize: 15, color: "#a0a0a0", fontFamily: "var(--font-mono)" }}>{repoName}</p>
          )}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, idx) => {
            const state = getState(step.key, status);
            const isLast = idx === STEPS.length - 1;
            const subtitle = step.getSubtitle(progress, status);

            return (
              <div key={step.key}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Icon + connector line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: state === "done"
                        ? "rgba(255,69,0,0.15)"
                        : state === "active"
                        ? "rgba(255,69,0,0.1)"
                        : "#252525",
                      border: `2px solid ${state === "done" ? "#ff4500" : state === "active" ? "#ff4500" : "#4a4a4a"}`,
                      transition: "all 0.3s",
                    }}>
                      {state === "done" ? (
                        <CheckCircle2 size={16} color="#ff4500" />
                      ) : state === "active" ? (
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: "#ff4500",
                          boxShadow: "0 0 10px rgba(255,69,0,0.6)",
                          animation: "dl-pulse 1.5s ease-in-out infinite",
                        }} />
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a4a4a" }} />
                      )}
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 2, height: 28,
                        background: state === "done" ? "#ff4500" : "#303030",
                        marginTop: 2,
                        transition: "background 0.3s",
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingTop: 5, paddingBottom: isLast ? 0 : 28, flex: 1 }}>
                    <p style={{
                      margin: 0, fontSize: 15, fontWeight: 600,
                      color: state === "pending" ? "#444" : "#e0e0e0",
                    }}>
                      {step.label}
                    </p>
                    <p style={{
                      margin: "4px 0 0", fontSize: 14,
                      color: state === "active" ? "#ff4500" : state === "done" ? "#666" : "#424242",
                    }}>
                      {subtitle}
                    </p>

                    {/* Progress bar — only on active PARSING step */}
                    {state === "active" && step.key === "PARSING" && progress && progress.totalFiles > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{
                          height: 4, background: "#303030", borderRadius: 4, overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", borderRadius: 4,
                            background: "#ff4500",
                            width: `${progress.percentage}%`,
                            transition: "width 0.4s ease",
                            boxShadow: "0 0 8px rgba(255,69,0,0.3)",
                          }} />
                        </div>
                        <p style={{
                          margin: "6px 0 0", fontSize: 12, color: "#909090",
                          textAlign: "right",
                        }}>
                          {progress.percentage}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel */}
        <div style={{ textAlign: "center", marginTop: 36, borderTop: "1px solid #303030", paddingTop: 24 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "none", border: "1px solid #4a4a4a",
              borderRadius: 8, padding: "8px 20px",
              fontSize: 14, fontWeight: 500, color: "#a0a0a0", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "#444"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#4a4a4a"; }}
          >
            <ArrowLeft size={14} />
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
