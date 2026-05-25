<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { HomelabContainer } from '~/types/container'

const config = useRuntimeConfig()
const search = ref('')
const editMode = ref(false)

const { settings, pending: savingSettings, load: loadSettings, setHidden, setOrder } =
  useHomelabSettings()

const { data, pending, error, refresh } = await useFetch<HomelabContainer[]>(
  '/api/containers',
  {
    default: () => [],
    server: false
  }
)

await loadSettings()

if (import.meta.client) {
  const interval = config.public.refreshInterval
  if (interval > 0) {
    const id = window.setInterval(() => {
      if (!editMode.value) refresh()
    }, interval)
    onUnmounted(() => window.clearInterval(id))
  }
}

interface GroupView {
  name: string
  items: HomelabContainer[]
}

const groups = ref<GroupView[]>([])

function rebuildGroups() {
  const q = search.value.trim().toLowerCase()
  const all = data.value || []
  const filtered = all.filter((c) => {
    if (!editMode.value && c.hidden) return false
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.image.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    )
  })

  const map = new Map<string, HomelabContainer[]>()
  for (const c of filtered) {
    if (!map.has(c.group)) map.set(c.group, [])
    map.get(c.group)!.push(c)
  }

  const entries = Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return a.localeCompare(b)
  })

  groups.value = entries.map(([name, items]) => ({ name, items }))
}

watch(
  [data, () => settings.value.containers, editMode, search],
  rebuildGroups,
  { immediate: true, deep: true }
)

function onReorder() {
  const order = groups.value.flatMap((g) => g.items.map((c) => c.key))
  const hiddenKeys = (data.value || [])
    .filter((c) => c.hidden && !order.includes(c.key))
    .map((c) => c.key)
  setOrder([...order, ...hiddenKeys])
}

function onToggleHide(key: string) {
  const current = settings.value.containers[key]?.hidden === true
  setHidden(key, !current)
}

const totalRunning = computed(() => data.value?.length || 0)
const totalHidden = computed(
  () => (data.value || []).filter((c) => c.hidden).length
)
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
          <template v-if="totalHidden">
            · <span class="text-slate-500">{{ totalHidden }} escondido{{ totalHidden > 1 ? 's' : '' }}</span>
          </template>
        </p>
      </div>

      <div class="flex w-full gap-2 sm:max-w-md sm:items-center">
        <div class="relative flex-1">
          <input
            v-model="search"
            type="search"
            placeholder="Filtrar…"
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

        <button
          type="button"
          class="shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
          :class="
            editMode
              ? 'border-sky-700 bg-sky-900/40 text-sky-100 hover:bg-sky-900/60'
              : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
          "
          @click="editMode = !editMode"
        >
          <span v-if="editMode" class="flex items-center gap-1.5">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Pronto
            <span v-if="savingSettings" class="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
          </span>
          <span v-else class="flex items-center gap-1.5">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Editar
          </span>
        </button>
      </div>
    </header>

    <div v-if="editMode" class="mb-6 rounded-xl border border-sky-900/60 bg-sky-950/30 p-3 text-xs text-sky-200">
      Modo edição: arraste os cards pra reordenar dentro de cada grupo e use o
      botão de olho pra esconder/mostrar.
    </div>

    <div v-if="error" class="rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
      Erro lendo Docker: {{ error.message }}
    </div>

    <div v-else-if="pending && !data?.length" class="text-sm text-slate-500">
      carregando containers…
    </div>

    <div v-else-if="!groups.length" class="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
      Nenhum container encontrado.
    </div>

    <div v-else class="space-y-10">
      <section v-for="group in groups" :key="group.name">
        <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {{ group.name }}
          <span class="ml-1 text-slate-600">· {{ group.items.length }}</span>
        </h2>
        <VueDraggable
          v-model="group.items"
          :disabled="!editMode"
          :animation="180"
          filter=".no-drag"
          :prevent-on-filter="false"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          @end="onReorder"
        >
          <ContainerCard
            v-for="c in group.items"
            :key="c.id"
            :container="c"
            :edit-mode="editMode"
            @toggle-hide="onToggleHide"
          />
        </VueDraggable>
      </section>
    </div>
  </main>
</template>
