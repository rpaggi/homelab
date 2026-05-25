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
      settings.value = data
    } catch (err: any) {
      error.value = err?.message || 'failed to load settings'
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  async function persist(next: HomelabSettings) {
    if (saveTimer) clearTimeout(saveTimer)
    settings.value = next
    saveTimer = setTimeout(async () => {
      pending.value = true
      try {
        const data = await $fetch<HomelabSettings>('/api/settings', {
          method: 'PUT',
          body: next
        })
        settings.value = data
        error.value = null
      } catch (err: any) {
        error.value = err?.message || 'failed to save settings'
      } finally {
        pending.value = false
      }
    }, 200)
  }

  function setHidden(key: string, hidden: boolean) {
    const next: HomelabSettings = {
      order: settings.value.order,
      containers: {
        ...settings.value.containers,
        [key]: { ...settings.value.containers[key], hidden }
      }
    }
    persist(next)
  }

  function setOrder(order: string[]) {
    persist({ ...settings.value, order })
  }

  return {
    settings,
    pending,
    error,
    load,
    setHidden,
    setOrder
  }
}
