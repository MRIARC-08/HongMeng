import simpleGit from 'simple-git'
import fs from 'fs'
import path from 'path'

export async function cloneRepository(
  repoUrl: string,
  repoId: string
): Promise<string> {

  const base = process.env.CLONE_BASE_PATH || '/tmp/devlens'
  const clonePath = path.join(base, repoId)

  try {
    fs.mkdirSync(clonePath, { recursive: true })

    const git = simpleGit()
    await git.clone(repoUrl, clonePath, ['--depth', '1'])

    console.log(`[cloner] ✓ Clone complete: ${clonePath}`)
    return clonePath

  } catch (error) {
    // Clean up failed clone directory
    try {
      fs.rmSync(clonePath, { recursive: true, force: true })
    } catch {}

    throw new Error(
      `Failed to clone repository. Make sure it is public and the URL is correct. ${error instanceof Error ? error.message : ''}`
    )
  }
}
