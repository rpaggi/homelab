export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Homelab',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  runtimeConfig: {
    dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    dataDir: process.env.HOMELAB_DATA_DIR || '/app/data',
    public: {
      refreshInterval: Number(process.env.HOMELAB_REFRESH_MS || 10000)
    }
  },
  nitro: {
    preset: 'node-server'
  }
})
