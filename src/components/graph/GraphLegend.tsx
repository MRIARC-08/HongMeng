"use client";

import { getFileTypeColor } from "./FileNode";

interface GraphLegendProps {
  fileTypes: string[];
}

const TYPE_LABELS: Record<string, string> = {
  COMPONENT: "Component",
  PAGE: "Page",
  SERVICE: "Service",
  UTILITY: "Utility",
  HOOK: "Hook",
  CONTEXT: "Context",
  CONFIG: "Config",
  TYPE: "Type",
  UNKNOWN: "Unknown",
};

export default function GraphLegend({ fileTypes }: GraphLegendProps) {
  if (fileTypes.length === 0) return null;

  return (
    <div style={{
      background: "rgba(17,17,17,0.95)",
      border: "1px solid #4a4a4a",
      borderRadius: 8,
      padding: "10px 12px",
      minWidth: 140,
      boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: "#7a7a7a",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 8,
      }}>
        File Types
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "5px 10px",
      }}>
        {fileTypes.map((type) => {
          const color = getFileTypeColor(type);
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: "#777" }}>
                {TYPE_LABELS[type] ?? type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
