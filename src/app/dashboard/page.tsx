"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Link2, Code2, Loader2 } from "lucide-react";
import RepoCard from "@/components/dashboard/RepoCard";

interface RecentRepo {
  repoId: string;
  fullName: string;
  url: string;
  analyzedAt: string;
}

const GITHUB_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/;
const LS_KEY = "devlens_recent";

export default function DashboardPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<RecentRepo[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
      setRepos(data);
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = url.trim();
    if (!GITHUB_RE.test(trimmed)) { 
      setError("Please enter a valid GitHub repository URL"); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/repos/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!data.success) { 
        setError(data.error ?? "Something went wrong"); 
        setLoading(false); 
        return; 
      }
      
      const match = trimmed.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
      const fullName = match ? match[1] : trimmed;
      const entry = { repoId: data.repoId, fullName, url: trimmed, analyzedAt: new Date().toISOString() };
      
      const existing = repos.filter((r) => r.repoId !== entry.repoId);
      const newList = [entry, ...existing].slice(0, 10); // Store up to 10 on dashboard
      setRepos(newList);
      localStorage.setItem(LS_KEY, JSON.stringify(newList));
      
      setUrl("");
      setLoading(false);
    } catch { 
      setError("Failed to connect. Please try again."); 
      setLoading(false); 
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#161616", color: "#e0e0e0", fontFamily: "var(--font-sans)" }}>
      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", background: "rgba(22,22,22,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #303030",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button 
            onClick={() => router.push("/")}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, background: "none", 
              border: "none", color: "#a0a0a0", cursor: "pointer", fontSize: 14, fontWeight: 500
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#a0a0a0"}
          >
            <ArrowLeft size={16} /> Home
          </button>
          <div style={{ width: 1, height: 24, background: "#303030" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "#ff4500",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Code2 size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
              Dev<span style={{ color: "#ff4500" }}>Lens</span> Dashboard
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 40px 100px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Your Workspaces
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 16, color: "#909090" }}>
              Analyze new repositories or continue where you left off.
            </p>
          </div>
        </div>

        {/* New Analysis Input */}
        <div style={{ 
          background: "#1e1e1e", border: "1px solid #303030", borderRadius: 16, 
          padding: 24, marginBottom: 48, boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: 12,
                background: "#161616", border: `1px solid ${error ? "#ef4444" : "#303030"}`,
                borderRadius: 10, padding: "0 16px", transition: "border-color 0.2s",
              }}>
                <Link2 size={18} color="#7a7a7a" />
                <input
                  type="text" value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  placeholder="Paste GitHub URL to analyze..."
                  disabled={loading}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontSize: 15, padding: "16px 0",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                />
              </div>
              <button
                type="submit" disabled={loading || !url.trim()}
                style={{
                  background: "#ff4500", color: "#fff", border: "none",
                  borderRadius: 10, padding: "0 28px", fontSize: 15, fontWeight: 600,
                  cursor: loading || !url.trim() ? "default" : "pointer",
                  opacity: loading || !url.trim() ? 0.6 : 1,
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.2s"
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Analyze
              </button>
            </div>
            {error && <p style={{ margin: "10px 0 0 12px", color: "#ef4444", fontSize: 13 }}>{error}</p>}
          </form>
        </div>

        {/* Grid of Repos */}
        {repos.length === 0 ? (
          <div style={{ 
            padding: "60px 0", textAlign: "center", border: "1px dashed #303030", 
            borderRadius: 16, background: "rgba(30,30,30,0.3)" 
          }}>
            <Code2 size={40} color="#424242" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ margin: 0, fontSize: 18, color: "#a0a0a0", fontWeight: 500 }}>No repositories analyzed yet</h3>
            <p style={{ margin: "8px 0 0", color: "#7a7a7a", fontSize: 14 }}>
              Paste a URL above to start your first analysis.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", 
            gap: 20 
          }}>
            {repos.map(repo => (
              <RepoCard key={repo.repoId} {...repo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
