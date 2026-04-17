"use client";

export default function GraphControls() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "rgba(17,17,17,0.9)",
      border: "1px solid #4a4a4a",
      borderRadius: 6,
      padding: "4px 12px",
      backdropFilter: "blur(8px)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
    }}>
      {["Scroll to zoom", "Drag to pan", "F to fit", "Esc to deselect"].map((hint, i, arr) => (
        <span key={hint} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#7a7a7a" }}>{hint}</span>
          {i < arr.length - 1 && (
            <span style={{ fontSize: 11, color: "#4a4a4a", margin: "0 6px" }}>·</span>
          )}
        </span>
      ))}
    </div>
  );
}
