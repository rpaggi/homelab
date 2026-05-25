import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { DEFAULT_SETTINGS, type HomelabSettings } from '~/types/settings'

let cached: HomelabSettings | null = null

function fileFor(dataDir: string): string {
  return join(dataDir, 'settings.json')
}

export async function loadSettings(dataDir: string): Promise<HomelabSettings> {
  if (cached) return cached
  const file = fileFor(dataDir)
  try {
    const raw = await fs.readFile(file, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<HomelabSettings>
    cached = {
      order: Array.isArray(parsed.order) ? parsed.order : [],
      containers:
        parsed.containers && typeof parsed.containers === 'object'
          ? parsed.containers
          : {}
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.warn('[settings] failed to read, using defaults:', err.message)
    }
    cached = { ...DEFAULT_SETTINGS }
  }
  return cached
}

export async function saveSettings(
  dataDir: string,
  next: HomelabSettings
): Promise<HomelabSettings> {
  const file = fileFor(dataDir)
  const clean: HomelabSettings = {
    order: Array.isArray(next.order) ? next.order : [],
    containers:
      next.containers && typeof next.containers === 'object'
        ? next.containers
        : {}
  }
  await fs.mkdir(dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(clean, null, 2), 'utf-8')
  cached = clean
  return clean
}
