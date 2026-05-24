import Docker from 'dockerode'

let client: Docker | null = null

export function getDocker(socketPath: string): Docker {
  if (!client) {
    client = new Docker({ socketPath })
  }
  return client
}
