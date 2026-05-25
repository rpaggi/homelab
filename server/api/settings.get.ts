import { loadSettings } from '../utils/settings'
import type { HomelabSettings } from '~/types/settings'

export default defineEventHandler(async (event): Promise<HomelabSettings> => {
  const config = useRuntimeConfig(event)
  return loadSettings(config.dataDir as string)
})
