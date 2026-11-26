import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

/**
 * Invoke Python agents.bridge with a JSON request; returns parsed JSON.
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} [env]
 * @param {number} [timeoutMs]
 */
export function runAgentBridge(payload, env = process.env, timeoutMs = 60000) {
  // Cursor CLI has per-call process startup overhead; a graph makes several calls.
  if (env.LLM_PROVIDER === 'cursor') timeoutMs = Math.max(timeoutMs, 360000)
  return new Promise((resolve, reject) => {
    const python = env.PYTHON || env.PYTHON_PATH || 'python'
    const child = spawn(python, ['-m', 'agents.bridge'], {
      cwd: ROOT,
      env: { ...env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill()
      reject(new Error(`agents.bridge timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(err)
    })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const text = stdout.trim()
      if (!text) {
        reject(new Error(stderr.trim() || `agents.bridge exited ${code} with empty stdout`))
        return
      }
      try {
        const parsed = JSON.parse(text)
        if (code !== 0 && parsed.ok !== true) {
          resolve(parsed)
          return
        }
        resolve(parsed)
      } catch (err) {
        reject(
          new Error(
            `Failed to parse agents.bridge JSON (exit ${code}): ${err instanceof Error ? err.message : String(err)}\n${text.slice(0, 500)}\n${stderr.slice(0, 500)}`,
          ),
        )
      }
    })

    child.stdin.write(JSON.stringify(payload ?? {}))
    child.stdin.end()
  })
}
