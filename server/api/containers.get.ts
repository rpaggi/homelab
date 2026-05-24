import { getDocker } from '../utils/docker'
import type { HomelabContainer, ContainerPort } from '~/types/container'

function cleanName(raw: string): string {
  return raw.replace(/^\//, '')
}

function prettifyName(raw: string): string {
  return cleanName(raw)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default defineEventHandler(async (event): Promise<HomelabContainer[]> => {
  const config = useRuntimeConfig(event)
  const docker = getDocker(config.dockerSocket as string)

  let raw
  try {
    raw = await docker.listContainers({ all: false })
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to read Docker socket: ${err.message}`
    })
  }

  const items: HomelabContainer[] = []

  for (const c of raw) {
    const labels = c.Labels || {}
    if (labels['homelab.enable'] === 'false') continue

    const rawName = c.Names[0] || c.Id.slice(0, 12)
    const name = labels['homelab.name'] || prettifyName(rawName)

    const ports: ContainerPort[] = (c.Ports || [])
      .filter((p) => p.PublicPort)
      .map((p) => ({
        privatePort: p.PrivatePort,
        publicPort: p.PublicPort,
        type: p.Type,
        ip: p.IP
      }))

    const uniquePorts = Array.from(
      new Map(ports.map((p) => [`${p.publicPort}/${p.type}`, p])).values()
    ).sort((a, b) => (a.publicPort ?? 0) - (b.publicPort ?? 0))

    items.push({
      id: c.Id,
      name,
      image: c.Image,
      state: c.State,
      status: c.Status,
      description: labels['homelab.description'],
      icon: labels['homelab.icon'],
      group: labels['homelab.group'] || 'Uncategorized',
      url: labels['homelab.url'],
      ports: uniquePorts,
      labels
    })
  }

  return items.sort((a, b) => a.name.localeCompare(b.name))
})
