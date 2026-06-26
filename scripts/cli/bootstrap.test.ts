/**
 * Unit tests for scripts/cli/bootstrap.mjs
 *
 * Runs the bootstrap script in a temp directory and verifies all expected
 * files are created with the correct project-name substitution.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Resolve the bootstrap script path relative to the repo root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')
const BOOTSTRAP = path.join(REPO_ROOT, 'scripts', 'cli', 'bootstrap.mjs')

/** Run the bootstrap script synchronously; returns { stdout, stderr, exitCode } */
function runBootstrap(args: string[], cwd: string): { stdout: string; stderr: string; ok: boolean } {
  try {
    const stdout = execSync(`node "${BOOTSTRAP}" ${args.join(' ')}`, {
      cwd,
      timeout: 120_000, // npm install can be slow
      encoding: 'utf8',
    })
    return { stdout, stderr: '', ok: true }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      ok: false,
    }
  }
}

describe('bootstrap CLI', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'open-stellar-bootstrap-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  // ── Happy-path ─────────────────────────────────────────────────────────────

  it('creates the project directory with all expected files', () => {
    const projectName = 'test-agent'
    const { ok } = runBootstrap([projectName], tmpDir)

    expect(ok).toBe(true)

    const projectDir = path.join(tmpDir, projectName)
    const expectedFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.mjs',
      '.env.example',
      'README.md',
      'lib/agent.ts',
      'app/page.tsx',
    ]

    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(projectDir, file)), `Missing: ${file}`).toBe(true)
    }
  })

  it('substitutes {{PROJECT_NAME}} in package.json', () => {
    const projectName = 'my-cool-agent'
    runBootstrap([projectName], tmpDir)

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, projectName, 'package.json'), 'utf8')
    )
    expect(pkg.name).toBe(projectName)
    expect(JSON.stringify(pkg)).not.toContain('{{PROJECT_NAME}}')
  })

  it('substitutes {{PROJECT_NAME}} in README.md', () => {
    const projectName = 'stellar-bot'
    runBootstrap([projectName], tmpDir)

    const readme = fs.readFileSync(path.join(tmpDir, projectName, 'README.md'), 'utf8')
    expect(readme).toContain(projectName)
    expect(readme).not.toContain('{{PROJECT_NAME}}')
  })

  it('substitutes {{PROJECT_NAME}} in app/page.tsx', () => {
    const projectName = 'agent-alpha'
    runBootstrap([projectName], tmpDir)

    const page = fs.readFileSync(path.join(tmpDir, projectName, 'app', 'page.tsx'), 'utf8')
    expect(page).toContain(projectName)
    expect(page).not.toContain('{{PROJECT_NAME}}')
  })

  it('.env.example contains all required env var keys', () => {
    const projectName = 'env-test-agent'
    runBootstrap([projectName], tmpDir)

    const envContent = fs.readFileSync(path.join(tmpDir, projectName, '.env.example'), 'utf8')

    const requiredVars = [
      'STELLAR_NETWORK',
      'DEV_MODE',
      'ANTHROPIC_API_KEY',
      'MOLTBOT_GATEWAY_TOKEN',
      'CF_ACCESS_CLIENT_ID',
      'DEBUG_ROUTES',
      'STELLAR_TREASURY_ADDRESS',
      'LOGTAIL_SOURCE_TOKEN',
      'NEXT_PUBLIC_BNB_RPC_URL',
      'NEXT_PUBLIC_BASE_RPC_URL',
    ]

    for (const key of requiredVars) {
      expect(envContent, `Missing env var: ${key}`).toContain(key)
    }
  })

  it('installs node_modules via npm install', () => {
    const projectName = 'install-test'
    const { ok } = runBootstrap([projectName], tmpDir)

    expect(ok).toBe(true)
    const nodeModulesDir = path.join(tmpDir, projectName, 'node_modules')
    expect(fs.existsSync(nodeModulesDir)).toBe(true)
  })

  // ── Error cases ────────────────────────────────────────────────────────────

  it('exits with error if project directory already exists', () => {
    const projectName = 'existing-project'
    const projectDir = path.join(tmpDir, projectName)
    fs.mkdirSync(projectDir)

    const { ok, stdout, stderr } = runBootstrap([projectName], tmpDir)

    expect(ok).toBe(false)
    const output = stdout + stderr
    expect(output.toLowerCase()).toMatch(/already exists/)
  })

  it('exits with error when no project name is given', () => {
    const { ok, stdout, stderr } = runBootstrap([], tmpDir)

    expect(ok).toBe(false)
    const output = stdout + stderr
    expect(output.toLowerCase()).toMatch(/required|usage/i)
  })

  it('exits with error for invalid project name with uppercase letters', () => {
    const { ok, stdout, stderr } = runBootstrap(['MyAgent'], tmpDir)

    expect(ok).toBe(false)
    const output = stdout + stderr
    expect(output.toLowerCase()).toMatch(/invalid/i)
  })
})
