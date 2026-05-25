export interface ContainerSettings {
  hidden?: boolean
}

export interface HomelabSettings {
  order: string[]
  containers: Record<string, ContainerSettings>
}

export const DEFAULT_SETTINGS: HomelabSettings = {
  order: [],
  containers: {}
}
