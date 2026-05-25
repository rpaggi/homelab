import { saveSettings } from '../utils/settings'
import type { HomelabSettings } from '~/types/settings'

export default defineEventHandler(async (event): Promise<HomelabSettings> => {
  const config = useRuntimeConfig(event)
  const body = await readBody<Partial<HomelabSettings>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'invalid body' })
  }
  return saveSettings(config.dataDir as string, {
    order: Array.isArray(body.order) ? body.order : [],
    containers: body.containers && typeof body.containers === 'object' ? body.containers : {}
  })
})
