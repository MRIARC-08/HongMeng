// src/lib/pipeline/cloner.ts
// Step 1: Download a GitHub repo zipball and extract it in pure Node.js

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

/**
 * Downloads a GitHub repository to a local temp directory.
 * Uses the GitHub API zipball endpoint (gets default branch automatically)
 * and extracts it natively without needing any system binaries like `git` or `tar`.
 *
 * @param repoUrl  Full GitHub URL e.g. "https://github.com/vercel/next.js"
 * @param repoId   Unique ID from DB — used as the folder name
 * @returns        Absolute path to the downloaded directory
 */
export async function cloneRepository(
  repoUrl: string,
  repoId: string
): Promise<string> {
  const base = process.env.CLONE_BASE_PATH ?? "/tmp/devlens";
  const clonePath = path.join(base, repoId);

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  const owner = match[1];
  const name = match[2].replace(/\.git$/, "");

  console.log(`[cloner] Starting download of ${owner}/${name} → ${clonePath}`);

  try {
    // 1. Fetch the zipball from GitHub
    const zipUrl = `https://api.github.com/repos/${owner}/${name}/zipball`;
    console.log(`[cloner] Fetching ${zipUrl}...`);
    
    // Using standard native fetch
    const response = await fetch(zipUrl, {
      headers: {
        "User-Agent": "DevLens-Pipeline",
        Accept: "application/vnd.github.v3+json",
      },
      // follow redirects is default in native fetch
    });

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract in memory to the target path
    console.log(`[cloner] Extracting zip payload...`);
    fs.mkdirSync(clonePath, { recursive: true });

    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    if (zipEntries.length === 0) {
      throw new Error("Downloaded zip archive is empty");
    }

    // GitHub zip archives have a single root folder (e.g. `vercel-next.js-af12b3/`)
    // We want to skip that root folder when extracting, simulating `--strip-components=1`
    const rootDirName = zipEntries[0].entryName.split("/")[0] + "/";

    for (const entry of zipEntries) {
      // Ignore root directory itself
      if (entry.entryName === rootDirName) continue;
      
      // Calculate path relative to the root directory
      if (entry.entryName.startsWith(rootDirName)) {
        const relativePath = entry.entryName.substring(rootDirName.length);
        const fullDestPath = path.join(clonePath, relativePath);
        
        if (entry.isDirectory) {
          fs.mkdirSync(fullDestPath, { recursive: true });
        } else {
          // Ensure parent directory exists
          fs.mkdirSync(path.dirname(fullDestPath), { recursive: true });
          fs.writeFileSync(fullDestPath, entry.getData());
        }
      }
    }

    console.log(`[cloner] ✓ Download and extraction complete: ${clonePath}`);
    return clonePath;
  } catch (err) {
    console.error(`[cloner] ✗ Download failed for ${repoUrl}:`, err);

    // Clean up partial downloads
    try {
      if (fs.existsSync(clonePath)) {
        fs.rmSync(clonePath, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }

    throw new Error(
      "Failed to download repository. Make sure it is public and the URL is correct."
    );
  }
}

