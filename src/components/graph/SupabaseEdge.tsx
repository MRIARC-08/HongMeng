"use client";

import { memo, useState } from "react";
import {
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";

/**
 * SupabaseEdge
 *
 * Dashed bezier edge with marching-ants animation + hover tooltip.
 * Shows a "imports from" popup at the midpoint when hovered.
 */
function SupabaseEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature: 0.25,
  });

  const d = data as Record<string, unknown> | undefined;
  const isHighlighted = !!d?.highlighted || !!selected;
  const isDimmed      = !!d?.dimmed;
  const importRaw     = (d?.importRaw as string | undefined) ?? "";

  const stroke     = isHighlighted ? "#ff4500"  : isDimmed ? "#2a2a2a" : "#aaaaaa";
  const strokeW    = isHighlighted ? 2          : isDimmed ? 1         : 1;
  const dashArray  = isHighlighted ? "6 3"      : "4 6";
  const opacity    = isDimmed      ? 0.7        : isHighlighted ? 1 : 0.45;
  const marchClass = isHighlighted ? "edge-march-fast" : isDimmed ? undefined : "edge-march";

  // Only show tooltip on non-dimmed edges
  const showTooltip = hovered && !isDimmed && !!importRaw;

  return (
    <>
      {/* Glow under-path — only when highlighted */}
      {isHighlighted && (
        <path
          d={edgePath}
          fill="none"
          stroke="#ff4500"
          strokeWidth={10}
          opacity={0.08}
          strokeLinecap="round"
        />
      )}

      {/* Invisible wider hit-area for hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: isDimmed ? "default" : "pointer" }}
      />

      {/* Dashed animated path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        opacity={opacity}
        className={isDimmed ? undefined : marchClass}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Hover tooltip via EdgeLabelRenderer (renders outside SVG) */}
      {showTooltip && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY - 10}px)`,
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: "#1a1a1a",
                border: "1px solid #ff4500",
                borderRadius: 8,
                padding: "6px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,69,0,0.1)",
                maxWidth: 240,
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Arrow label */}
              <div
                style={{
                  fontSize: 10,
                  color: "#ff4500",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                imports from
              </div>
              {/* The raw import path */}
              <div
                style={{
                  fontSize: 12,
                  color: "#e0e0e0",
                  fontFamily: "var(--font-mono, monospace)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 220,
                }}
                title={importRaw}
              >
                {importRaw}
              </div>
            </div>
            {/* Caret */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #ff4500",
                margin: "0 auto",
              }}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(SupabaseEdge);
