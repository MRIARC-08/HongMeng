"use client";

import { memo } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";

/**
 * SupabaseEdge
 *
 * Dashed bezier edge with marching-ants animation.
 * Renders two <path> elements directly in SVG context:
 *   1. Glow under-path (highlighted only)
 *   2. Dashed main path with CSS class animation
 *
 * Uses global CSS classes `edge-march` / `edge-march-fast` from globals.css
 * so animation runs purely in CSS — no inline keyframes, no EdgeLabelRenderer.
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
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature: 0.25,
  });

  const d = data as Record<string, unknown> | undefined;
  const isHighlighted = !!d?.highlighted || !!selected;
  const isDimmed      = !!d?.dimmed;

  const stroke     = isHighlighted ? "#ff4500"  : isDimmed ? "#303030" : "#3a2a20";
  const strokeW    = isHighlighted ? 2          : 1.5;
  const dashArray  = isHighlighted ? "6 3"      : "4 5";
  const opacity    = isDimmed      ? 0.06       : isHighlighted ? 1 : 0.4;
  const marchClass = isHighlighted ? "edge-march-fast" : "edge-march";

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
      />
    </>
  );
}

export default memo(SupabaseEdge);
