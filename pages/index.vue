<script setup lang="ts">
import type { HomelabContainer } from '~/types/container'

const config = useRuntimeConfig()
const search = ref('')

const { data, pending, error, refresh } = await useFetch<HomelabContainer[]>(
  '/api/containers',
  {
    default: () => [],
    server: false
  }
)

if (import.meta.client) {
  const interval = config.public.refreshInterval
  if (interval > 0) {
    const id = window.setInterval(() => refresh(), interval)
    onUnmounted(() => window.clearInterval(id))
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return data.value || []
  return (data.value || []).filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.image.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    )
  })
})

const groups = computed(() => {
  const map = new Map<string, HomelabContainer[]>()
  for (const c of filtered.value) {
    const list = map.get(c.group) || []
    list.push(c)
    map.set(c.group, list)
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return a.localeCompare(b)
  })
})

const totalRunning = computed(() => data.value?.length || 0)
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-10">
    <header class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Homelab
        </h1>
        <p class="mt-1 text-sm text-slate-400">
          {{ totalRunning }} containers em execução
        </p>
      </div>

      <div class="relative w-full sm:max-w-sm">
        <input
          v-model="search"
          type="search"
          placeholder="Filtrar por nome, imagem, grupo…"
          class="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-slate-600 focus:bg-slate-900"
        />
        <svg
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </div>
    </header>

    <div v-if="error" class="rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
      Erro lendo Docker: {{ error.message }}
    </div>

    <div v-else-if="pending && !data?.length" class="text-sm text-slate-500">
      carregando containers…
    </div>

    <div v-else-if="!filtered.length" class="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
      Nenhum container encontrado.
    </div>

    <div v-else class="space-y-10">
      <section v-for="[group, items] in groups" :key="group">
        <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {{ group }}
          <span class="ml-1 text-slate-600">· {{ items.length }}</span>
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ContainerCard
            v-for="c in items"
            :key="c.id"
            :container="c"
          />
        </div>
      </section>
    </div>
  </main>
</template>
