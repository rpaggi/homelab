import type { ContainerSettings, HomelabSettings } from '~/types/settings'

const STATE_KEY = 'homelab-settings'

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

export function useHomelabSettings() {
  const settings = useState<HomelabSettings>(STATE_KEY, () => ({
    order: [],
    containers: {}
  }))
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    try {
      const data = await $fetch<HomelabSettings>('/api/settings')
      settings.value.order = data.order
      settings.value.containers = data.containers
    } catch (err: any) {
      error.value = err?.message || 'failed to load settings'
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function schedulePersist() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      pending.value = true
      try {
        await $fetch('/api/settings', {
          method: 'PUT',
          body: {
            order: settings.value.order,
            containers: settings.value.containers
          }
        })
        error.value = null
      } catch (err: any) {
        error.value = err?.message || 'failed to save settings'
      } finally {
        pending.value = false
      }
    }, 200)
  }

  function setOverride(key: string, patch: Partial<ContainerSettings>) {
    const current: ContainerSettings = { ...(settings.value.containers[key] || {}) }
    for (const [k, v] of Object.entries(patch) as [keyof ContainerSettings, unknown][]) {
      if (isEmpty(v)) {
        delete current[k]
      } else {
        ;(current as any)[k] = v
      }
    }
    if (Object.keys(current).length === 0) {
      delete settings.value.containers[key]
    } else {
      settings.value.containers[key] = current
    }
    schedulePersist()
  }

  function setHidden(key: string, hidden: boolean) {
    setOverride(key, { hidden: hidden ? true : null as any })
  }

  function setOrder(order: string[]) {
    settings.value.order = order
    schedulePersist()
  }

  function setPort(key: string, port: number | null) {
    setOverride(key, { port: port as any })
  }

  return {
    settings,
    pending,
    error,
    load,
    setHidden,
    setOrder,
    setPort,
    setOverride
  }
}
