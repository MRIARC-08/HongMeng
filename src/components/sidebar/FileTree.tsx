"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ChevronRight, ChevronDown,
  Folder, FolderOpen,
  FileCode, FileText, FileJson, File,
  Search, X,
} from "lucide-react";
import { FILE_TYPE_COLORS } from "@/components/graph/FileNode";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FileItem {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  directory: string;
  sizeBytes: number;
  parseStatus: string;
  functionCount: number;
}

type TreeNode =
  | { kind: "dir"; name: string; path: string; children: TreeNode[] }
  | { kind: "file"; name: string; path: string; file: FileItem };

interface FileTreeProps {
  repoId: string;
  selectedFileId: string | null;
  onFileSelect: (fileId: string) => void;
}

interface MutableDir {
  kind: "dir";
  name: string;
  path: string;
  children: Record<string, MutableDir | { kind: "file"; name: string; path: string; file: FileItem }>;
}

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(files: FileItem[]): TreeNode[] {
  const root: MutableDir["children"] = {};

  for (const file of files) {
    const parts = file.filePath.replace(/^\/+/, "").split("/").filter(Boolean);
    if (parts.length === 0) continue;

    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      const dirPath = parts.slice(0, i + 1).join("/");
      if (!cur[seg]) cur[seg] = { kind: "dir", name: seg, path: dirPath, children: {} };
      const node = cur[seg];
      if (node.kind === "dir") cur = node.children;
    }

    const fileName = parts[parts.length - 1];
    cur[fileName] = { kind: "file", name: fileName, path: file.filePath, file };
  }

  function toSortedNodes(map: MutableDir["children"]): TreeNode[] {
    const dirs: TreeNode[] = [];
    const files: TreeNode[] = [];
    for (const node of Object.values(map)) {
      if (node.kind === "dir") {
        dirs.push({ kind: "dir", name: node.name, path: node.path, children: toSortedNodes(node.children) });
      } else {
        files.push({ kind: "file", name: node.name, path: node.path, file: node.file });
      }
    }
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return [...dirs, ...files];
  }

  return toSortedNodes(root);
}

// ── File icon ─────────────────────────────────────────────────────────────────

function FileIcon({ name, fileType }: { name: string; fileType: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const color = FILE_TYPE_COLORS[fileType] ?? "#555555";
  if (["ts", "tsx", "js", "jsx", "mjs"].includes(ext)) return <FileCode size={13} color={color} />;
  if (["json", "jsonc"].includes(ext)) return <FileJson size={13} color="#f59e0b" />;
  if (["md", "mdx", "txt"].includes(ext)) return <FileText size={13} color="#888888" />;
  return <File size={13} color="#555555" />;
}

// ── Row constants ─────────────────────────────────────────────────────────────

const ROW_H = 28;

// ── Tree node row ─────────────────────────────────────────────────────────────

function TreeNodeRow({
  node, depth, expanded, toggleDir, selectedFileId, onFileSelect,
}: {
  node: TreeNode; depth: number;
  expanded: Set<string>; toggleDir: (p: string) => void;
  selectedFileId: string | null; onFileSelect: (id: string) => void;
}) {
  const indent = depth * 10 + 6;
  const isOpen = expanded.has(node.path);

  if (node.kind === "dir") {
    return (
      <>
        <button
          onClick={() => toggleDir(node.path)}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            height: ROW_H, paddingLeft: indent, paddingRight: 8,
            gap: 4, border: "none", background: "none",
            cursor: "pointer", color: "#cccccc", fontSize: 14,
            textAlign: "left", transition: "background 120ms ease",
            userSelect: "none",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#4a4a4a")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
        >
          {/* indent guides removed */}
          <span style={{ width: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isOpen
              ? <ChevronDown size={11} color="#555555" />
              : <ChevronRight size={11} color="#555555" />}
          </span>
          {isOpen
            ? <FolderOpen size={13} color="#888888" style={{ flexShrink: 0 }} />
            : <Folder size={13} color="#666666" style={{ flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </span>
        </button>
        {isOpen && node.children.map(child => (
          <TreeNodeRow key={child.path} node={child} depth={depth + 1}
            expanded={expanded} toggleDir={toggleDir}
            selectedFileId={selectedFileId} onFileSelect={onFileSelect}
          />
        ))}
      </>
    );
  }

  const isActive = node.file.id === selectedFileId;

  return (
    <button
      onClick={() => onFileSelect(node.file.id)}
      title={node.path}
      style={{
        width: "100%", position: "relative",
        display: "flex", alignItems: "center",
        height: ROW_H, paddingLeft: indent + 18, paddingRight: 10,
        gap: 6, border: "none",
        background: isActive ? "rgba(255,69,0,0.1)" : "none",
        borderLeft: `2px solid ${isActive ? "#ff4500" : "transparent"}`,
        cursor: "pointer",
        color: isActive ? "#ff6534" : "#666666",
        fontSize: 13, textAlign: "left",
        transition: "all 120ms ease",
        userSelect: "none",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "none"; }}
    >
      {/* indent guides removed */}
      <span style={{ flexShrink: 0 }}>
        <FileIcon name={node.name} fileType={node.file.fileType} />
      </span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
        {node.name}
      </span>
    </button>
  );
}

// ── Search result row ─────────────────────────────────────────────────────────

function SearchRow({ file, query, selectedFileId, onFileSelect }: {
  file: FileItem; query: string;
  selectedFileId: string | null; onFileSelect: (id: string) => void;
}) {
  const isActive = file.id === selectedFileId;
  const q = query.toLowerCase();
  const lo = file.fileName.toLowerCase();
  const idx = lo.indexOf(q);
  const namePart = idx >= 0
    ? <>{file.fileName.slice(0, idx)}<mark style={{ background: "rgba(255,69,0,0.35)", color: "#ff6534", borderRadius: 2 }}>{file.fileName.slice(idx, idx + q.length)}</mark>{file.fileName.slice(idx + q.length)}</>
    : file.fileName;

  return (
    <button
      onClick={() => onFileSelect(file.id)}
      style={{
        width: "100%", display: "flex", flexDirection: "column",
        alignItems: "flex-start", padding: "4px 12px", gap: 1,
        border: "none",
        background: isActive ? "rgba(255,69,0,0.1)" : "none",
        borderLeft: `2px solid ${isActive ? "#ff4500" : "transparent"}`,
        cursor: "pointer",
        color: isActive ? "#ff6534" : "#666666",
        fontSize: 13, textAlign: "left",
        transition: "all 120ms ease", userSelect: "none",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = "#4a4a4a"); }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = "none"); }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FileIcon name={file.fileName} fileType={file.fileType} />
        <span>{namePart}</span>
      </div>
      <span style={{ fontSize: 11, color: "#7a7a7a", paddingLeft: 19, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
        {file.filePath}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FileTree({ repoId, selectedFileId, onFileSelect }: FileTreeProps) {
  const [flatList, setFlatList] = useState<FileItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/repos/${repoId}/files`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setFlatList(data.flatList);
          const topDirs = new Set<string>();
          for (const f of data.flatList as FileItem[]) {
            const parts = f.filePath.split("/");
            if (parts.length > 1) topDirs.add(parts[0]);
          }
          setExpanded(topDirs);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [repoId]);

  const toggleDir = useCallback((path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const tree     = useMemo(() => buildTree(flatList), [flatList]);
  const filtered = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return flatList.filter(f => f.fileName.toLowerCase().includes(q) || f.filePath.toLowerCase().includes(q));
  }, [flatList, search]);

  if (loading) {
    return (
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="shimmer" style={{
            height: ROW_H - 4, borderRadius: 3,
            width: "100%",
            marginLeft: 0,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
      background: "#252525",
    }}>
      {/* Search bar */}
      <div style={{ padding: "8px 10px 6px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#303030", border: "1px solid #4a4a4a",
          borderRadius: 6, padding: "5px 9px",
          transition: "border-color 150ms ease",
        }}>
          <Search size={11} color="#444444" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#cccccc", fontSize: 13, fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
            >
              <X size={10} color="#444444" />
            </button>
          )}
        </div>
      </div>

      {/* File count */}
      {!search && (
        <div style={{
          padding: "2px 12px 4px",
          fontSize: 11, color: "#7a7a7a",
          textTransform: "uppercase", letterSpacing: "0.07em",
          flexShrink: 0,
        }}>
          {flatList.length} files
        </div>
      )}

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {search
          ? filtered.length > 0
            ? filtered.map(f => (
                <SearchRow key={f.id} file={f} query={search}
                  selectedFileId={selectedFileId} onFileSelect={onFileSelect} />
              ))
            : <div style={{ padding: "16px 14px", fontSize: 13, color: "#7a7a7a", textAlign: "center" }}>
                No files match &ldquo;{search}&rdquo;
              </div>
          : tree.map(node => (
              <TreeNodeRow key={node.path} node={node} depth={0}
                expanded={expanded} toggleDir={toggleDir}
                selectedFileId={selectedFileId} onFileSelect={onFileSelect}
              />
            ))
        }
      </div>
    </div>
  );
}
