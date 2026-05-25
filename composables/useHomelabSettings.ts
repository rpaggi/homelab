import type { HomelabSettings } from '~/types/settings'

const STATE_KEY = 'homelab-settings'

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

  function setHidden(key: string, hidden: boolean) {
    settings.value.containers[key] = {
      ...settings.value.containers[key],
      hidden
    }
    schedulePersist()
  }

  function setOrder(order: string[]) {
    settings.value.order = order
    schedulePersist()
  }

  function setPort(key: string, port: number | null) {
    const current = { ...settings.value.containers[key] }
    if (port === null) delete current.port
    else current.port = port
    settings.value.containers[key] = current
    schedulePersist()
  }

  return {
    settings,
    pending,
    error,
    load,
    setHidden,
    setOrder,
    setPort
  }
}
