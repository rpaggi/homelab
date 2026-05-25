export interface ContainerPort {
  privatePort: number
  publicPort?: number
  type: string
  ip?: string
}

export interface HomelabContainer {
  id: string
  key: string
  name: string
  image: string
  state: string
  status: string
  description?: string
  icon?: string
  group: string
  url?: string
  ports: ContainerPort[]
  labels: Record<string, string>
  hidden: boolean
}
