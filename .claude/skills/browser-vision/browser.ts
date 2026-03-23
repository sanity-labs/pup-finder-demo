/**
 * browser.ts — Generic headless Chromium tool for visual verification via AI vision.
 *
 * Subcommands:
 *   describe <url> [prompt]              — Screenshot + Anthropic vision API description
 *   screenshot <url> [output-path]       — Navigate, wait for ready, save PNG
 *   eval <url> <playwright-js>           — Run arbitrary Playwright code with `page` in scope
 *
 * URLs can be full (http://localhost:3000/page) or paths (/page).
 * Path-only URLs are resolved against http://localhost:$PORT where PORT comes from
 * --port flag or BROWSER_VISION_PORT env var.
 *
 * The browser is launched headless via Playwright.
 */

import {execSync} from 'node:child_process'
import {readFileSync, readdirSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {createConnection} from 'node:net'

// ---------------------------------------------------------------------------
// Preflight checks
// ---------------------------------------------------------------------------

function chromiumCacheDir(): string {
  return (
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    join(
      process.env.HOME || process.env.USERPROFILE || '~',
      'Library',
      'Caches',
      'ms-playwright',
    )
  )
}

function readdirSafe(dir: string): string[] {
  try {
    return readdirSync(dir)
  } catch {
    return []
  }
}

function preflight(subcommand: string): void {
  // Check Chromium browser binary exists in the Playwright cache
  const cacheDir = chromiumCacheDir()
  const hasChromium =
    existsSync(cacheDir) && readdirSafe(cacheDir).some((entry) => entry.startsWith('chromium'))

  if (!hasChromium) {
    console.error('Error: Chromium browser not found in Playwright cache.')
    console.error(`Looked in: ${cacheDir}`)
    console.error('Run: pnpm browser:setup')
    process.exit(1)
  }

  // Check ANTHROPIC_API_KEY for commands that need it
  if (subcommand === 'describe' || subcommand === 'eval') {
    const key = loadApiKey()
    if (!key && subcommand === 'describe') {
      console.error('Error: ANTHROPIC_API_KEY not found.')
      console.error('Set it in .env at the project root or as an environment variable.')
      console.error('See .claude/skills/browser-vision/setup.md for instructions.')
      process.exit(1)
    }
    if (!key && subcommand === 'eval') {
      console.warn(
        'Warning: ANTHROPIC_API_KEY not set — describe() will fail if called in eval code.',
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const _gitRoot = execSync('git rev-parse --show-toplevel', {encoding: 'utf8'}).trim()

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = createConnection({port, host: '127.0.0.1'}, () => {
      sock.destroy()
      resolve(true)
    })
    sock.on('error', () => resolve(false))
    sock.setTimeout(500, () => {
      sock.destroy()
      resolve(false)
    })
  })
}

interface ParsedArgs {
  subcommand: string
  port: number | undefined
  waitFor: string | undefined
  browserArgs: string[]
  rest: string[]
}

function parseArgs(argv: string[]): ParsedArgs {
  const rest: string[] = []
  const browserArgs: string[] = []
  let port: number | undefined
  let waitFor: string | undefined
  let subcommand = ''
  let i = 0

  while (i < argv.length) {
    if (argv[i] === '--port' && argv[i + 1]) {
      port = Number(argv[i + 1])
      i += 2
    } else if (argv[i] === '--wait-for' && argv[i + 1]) {
      waitFor = argv[i + 1]
      i += 2
    } else if (argv[i] === '--browser-arg' && argv[i + 1]) {
      browserArgs.push(argv[i + 1])
      i += 2
    } else if (!subcommand) {
      subcommand = argv[i]
      i++
    } else {
      rest.push(argv[i])
      i++
    }
  }

  if (!port && process.env.BROWSER_VISION_PORT) {
    port = Number(process.env.BROWSER_VISION_PORT)
  }

  return {subcommand, port, waitFor, browserArgs, rest}
}

async function resolveUrl(pathOrUrl: string, port: number | undefined): Promise<string> {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl

  if (!port) {
    console.error('Error: Path-only URLs require a port.')
    console.error('Use --port <port> or set BROWSER_VISION_PORT env var.')
    console.error('Example: npx tsx browser.ts describe --port 3000 "/page"')
    process.exit(1)
  }

  if (!(await isPortOpen(port))) {
    console.error(`Error: Nothing is listening on port ${port}.`)
    console.error('Start your dev server first, then retry.')
    process.exit(1)
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl
  return `http://localhost:${port}${path}`
}

function loadApiKey(): string | null {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  for (const file of ['.env.local', '.env']) {
    try {
      const envContent = readFileSync(join(_gitRoot, file), 'utf8')
      const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m)
      if (match) return match[1].trim()
    } catch {
      /* file doesn't exist */
    }
  }
  return null
}

let _browserArgs: string[] = []

async function launchBrowser() {
  const {chromium} = await import('playwright-core')
  return chromium.launch({
    headless: true,
    args: _browserArgs,
  })
}

/** Wait for the page to be ready. Uses `networkidle` + optional --wait-for selector. */
async function waitForReady(
  page: import('playwright-core').Page,
  waitForSelector: string | undefined,
): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', {timeout: 30_000})
  } catch {
    console.warn('Warning: networkidle not reached after 30s, continuing anyway')
  }
  if (waitForSelector) {
    try {
      await page.waitForSelector(waitForSelector, {timeout: 15_000})
    } catch {
      console.warn(`Warning: selector "${waitForSelector}" not found after 15s, continuing anyway`)
    }
  }
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

async function cmdScreenshot(
  url: string,
  waitFor: string | undefined,
  outputPath = '/tmp/screenshot.png',
): Promise<void> {
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 720}})
    await page.goto(url, {waitUntil: 'domcontentloaded'})
    await waitForReady(page, waitFor)
    await page.screenshot({path: outputPath})
    console.log(outputPath)
  } finally {
    await browser.close()
  }
}

async function describeScreenshot(
  page: import('playwright-core').Page,
  prompt: string,
  apiKey: string,
): Promise<string> {
  const screenshotBuffer = await page.screenshot()
  const base64Image = screenshotBuffer.toString('base64')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {type: 'base64', media_type: 'image/png', data: base64Image},
            },
            {type: 'text', text: prompt},
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`)
  }

  const result = (await response.json()) as {content?: Array<{text?: string}>}
  return result.content?.[0]?.text || 'No description returned'
}

async function cmdDescribe(
  url: string,
  waitFor: string | undefined,
  prompt = 'Describe what you see on this page. Focus on the visual elements, colors, layout, and any animations or effects visible.',
): Promise<void> {
  const apiKey = loadApiKey()!
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 720}})
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60_000})
    await waitForReady(page, waitFor)
    console.log(await describeScreenshot(page, prompt, apiKey))
  } finally {
    await browser.close()
  }
}

async function cmdEval(url: string, waitFor: string | undefined, code: string): Promise<void> {
  const apiKey = loadApiKey()
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 720}})
    await page.goto(url, {waitUntil: 'domcontentloaded'})
    await waitForReady(page, waitFor)

    const describe = async (prompt: string) => {
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set — describe() requires it')
      const result = await describeScreenshot(page, prompt, apiKey)
      console.log(result)
      return result
    }

    const fn = new Function('page', 'browser', 'describe', `return (async () => { ${code} })();`)
    await fn(page, browser, describe)
  } finally {
    await browser.close()
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const USAGE = `Usage:
  browser.ts describe <url> [prompt]           — Vision AI description (preferred)
  browser.ts screenshot <url> [output.png]     — Save PNG to disk
  browser.ts eval <url> '<playwright-js>'      — Run Playwright code with page in scope

Options:
  --port <port>          Port for resolving path-only URLs (e.g. --port 3000).
                         Also reads BROWSER_VISION_PORT env var.
  --wait-for <selector>  Wait for a CSS selector before capturing (e.g. --wait-for "main").
                         Useful for apps with lazy loading or SSR hydration.
  --browser-arg <arg>    Pass a Chromium launch arg (repeatable).
                         E.g. --browser-arg "--use-gl=angle" --browser-arg "--use-angle=swiftshader"

Paths like /page are resolved to http://localhost:<port>/page.
Full URLs (http://...) are used as-is.`

async function main(): Promise<void> {
  const {subcommand, port, waitFor, browserArgs, rest} = parseArgs(process.argv.slice(2))
  _browserArgs = browserArgs

  if (!subcommand || !['describe', 'screenshot', 'eval'].includes(subcommand)) {
    console.error(USAGE)
    process.exit(1)
  }

  preflight(subcommand)

  switch (subcommand) {
    case 'describe':
      if (!rest[0]) {
        console.error(USAGE)
        process.exit(1)
      }
      await cmdDescribe(await resolveUrl(rest[0], port), waitFor, rest[1])
      break
    case 'screenshot':
      if (!rest[0]) {
        console.error(USAGE)
        process.exit(1)
      }
      await cmdScreenshot(await resolveUrl(rest[0], port), waitFor, rest[1])
      break
    case 'eval':
      if (!rest[0] || !rest[1]) {
        console.error(USAGE)
        process.exit(1)
      }
      await cmdEval(await resolveUrl(rest[0], port), waitFor, rest[1])
      break
  }
}

main()
