// src/lib/pipeline/cloner.ts
// Step 1: Download a GitHub repo tarball and extract it (works on Vercel serverless)

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Downloads a GitHub repository to a local temp directory.
 * Uses the GitHub API tarball endpoint to automatically get the default branch,
 * circumventing the need for the `git` binary to be installed on the server.
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
    // Create the target directory if it doesn't exist
    fs.mkdirSync(clonePath, { recursive: true });

    // Download the tarball from GitHub API (gets default branch automatically)
    // tar --strip-components=1 removes the top-level repository folder from the tarball
    const tarballUrl = `https://api.github.com/repos/${owner}/${name}/tarball`;
    const cmd = `curl -sL "${tarballUrl}" | tar -xz -C "${clonePath}" --strip-components=1`;
    
    console.log(`[cloner] Running extraction...`);
    execSync(cmd, { stdio: "pipe" });

    console.log(`[cloner] ✓ Download and extraction complete: ${clonePath}`);
    return clonePath;
  } catch (err) {
    console.error(`[cloner] ✗ Clone/Download failed for ${repoUrl}:`, err);

    // Clean up partial clone if it exists
    try {
      if (fs.existsSync(clonePath)) {
        fs.rmSync(clonePath, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }

    throw new Error(
      "Failed to download repository. Make sure it is public and the URL is correct."
    );
  }
}

