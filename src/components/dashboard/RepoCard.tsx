"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Loader2, Clock, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

export interface RepoCardProps {
  repoId: string;
  fullName: string;
  url: string;
  analyzedAt: string;
}

export default function RepoCard({ repoId, fullName, url, analyzedAt }: RepoCardProps) {
  const router = useRouter();
  
  // start in "loading status" state implicitly until first fetch finishes
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    async function checkStatus() {
      try {
        const res = await fetch(`/api/repos/${repoId}/status`);
        const data = await res.json();
        
        if (!data.success) {
          setError(data.error || "Failed to check status");
          setProcessing(false);
          return;
        }

        if (data.failed) {
          setError(data.error || "Analysis failed");
          setProcessing(false);
          clearInterval(interval);
        } else if (data.ready) {
          setProcessing(false);
          clearInterval(interval);
        } else {
          setProcessing(true);
        }
      } catch (err) {
        // ignore network hiccups temporarily, but if it persists we could error out
      }
    }

    // initial check immediately
    checkStatus();
    
    // poll every 2 seconds
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [repoId]);

  const handleNavigate = () => {
    if (!processing && !error) {
      router.push(`/repo/${repoId}`);
    }
  };

  const timeStr = new Date(analyzedAt).toLocaleDateString(undefined, { 
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit" 
  });

  return (
    <div 
      onClick={handleNavigate}
      style={{
        background: "#161616",
        border: `1px solid ${processing ? "#2a2a2a" : "#303030"}`,
        borderRadius: 12,
        padding: "20px 24px",
        cursor: processing || error ? "default" : "pointer",
        opacity: processing ? 0.6 : 1,
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: !processing && !error ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
      }}
      onMouseEnter={e => {
        if (!processing && !error) {
          const el = e.currentTarget;
          el.style.borderColor = "#ff4500";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 30px rgba(255,69,0,0.15)";
        }
      }}
      onMouseLeave={e => {
        if (!processing && !error) {
          const el = e.currentTarget;
          el.style.borderColor = "#303030";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 8, 
            background: processing ? "#1e1e1e" : "rgba(255,69,0,0.1)",
            color: processing ? "#888" : "#ff4500",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <GitBranch size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: processing ? "#aaa" : "#fff" }}>
              {fullName}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7a7a7a", fontFamily: "var(--font-mono, monospace)" }}>
              {url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{ padding: "4px 10px", borderRadius: 20, background: "#1e1e1e" }}>
          {error ? (
             <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444" }}>
                <AlertCircle size={14} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Failed</span>
             </div>
          ) : processing ? (
             <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ff8a50" }}>
                <Loader2 size={14} className="animate-spin" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Processing</span>
             </div>
          ) : (
             <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981" }}>
                <CheckCircle size={14} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Ready</span>
             </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7a7a7a", fontSize: 12 }}>
          <Clock size={12} />
          <span>Added {timeStr}</span>
        </div>
        
        {!processing && !error && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ff4500", fontSize: 13, fontWeight: 500 }}>
             Open Workspace <ChevronRight size={14} />
          </div>
        )}
      </div>

    </div>
  );
}
