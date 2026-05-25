export interface ContainerSettings {
  hidden?: boolean
  port?: number
  name?: string
  description?: string
  icon?: string
  group?: string
  url?: string
}

export interface HomelabSettings {
  order: string[]
  containers: Record<string, ContainerSettings>
}

export const DEFAULT_SETTINGS: HomelabSettings = {
  order: [],
  containers: {}
}
