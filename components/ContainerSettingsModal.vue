<script setup lang="ts">
import type { HomelabContainer } from '~/types/container'
import type { ContainerSettings } from '~/types/settings'

const props = defineProps<{
  container: HomelabContainer
  current: ContainerSettings
}>()

const emit = defineEmits<{
  close: []
  update: [patch: Partial<ContainerSettings>]
  reset: []
}>()

const name = ref(props.current.name || '')
const description = ref(props.current.description || '')
const icon = ref(props.current.icon || '')
const group = ref(props.current.group || '')
const url = ref(props.current.url || '')
const port = ref(props.current.port ? String(props.current.port) : '')

const namePlaceholder = computed(() => props.container.name)
const descriptionPlaceholder = computed(
  () => props.container.description || props.container.image
)
const iconPlaceholder = computed(
  () => props.container.icon || 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/…'
)
const groupPlaceholder = computed(
  () => props.container.group || 'Uncategorized'
)
const autoPort = computed(() => props.container.ports[0]?.publicPort)
const portPlaceholder = computed(() =>
  autoPort.value ? String(autoPort.value) : 'ex: 8080'
)
const urlPlaceholder = computed(() => {
  if (props.container.url) return props.container.url
  if (autoPort.value) return `http://<host>:${autoPort.value}`
  return 'https://...'
})

const iconPreviewSrc = computed(() => icon.value || props.container.icon || '')
const showIconPreview = computed(
  () => !!iconPreviewSrc.value && /^(https?:\/\/|\/)/.test(iconPreviewSrc.value)
)

function commit(field: keyof ContainerSettings, raw: string) {
  const trimmed = raw.trim()
  if (field === 'port') {
    if (!trimmed) return emit('update', { port: undefined })
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n <= 0 || n > 65535) return
    emit('update', { port: n })
    return
  }
  emit('update', { [field]: trimmed || undefined } as Partial<ContainerSettings>)
}

function onResetAll() {
  name.value = ''
  description.value = ''
  icon.value = ''
  group.value = ''
  url.value = ''
  port.value = ''
  emit('reset')
}

onMounted(() => {
  function handler(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close')
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <header class="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div class="min-w-0">
            <h2 class="truncate text-base font-semibold text-slate-100">
              Configurar {{ container.name }}
            </h2>
            <p class="truncate font-mono text-xs text-slate-500">{{ container.key }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Fechar (Esc)"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div class="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <p class="text-xs text-slate-500">
            Os campos vazios usam o valor padrão (label do container ou auto-detectado).
            Limpar um campo desfaz o override.
          </p>

          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Nome</label>
            <input
              v-model="name"
              type="text"
              :placeholder="namePlaceholder"
              class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
              @change="commit('name', name)"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Descrição</label>
            <input
              v-model="description"
              type="text"
              :placeholder="descriptionPlaceholder"
              class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
              @change="commit('description', description)"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Ícone (URL)</label>
            <div class="flex gap-2">
              <input
                v-model="icon"
                type="url"
                :placeholder="iconPlaceholder"
                class="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
                @change="commit('icon', icon)"
              />
              <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800">
                <img v-if="showIconPreview" :src="iconPreviewSrc" :alt="container.name" class="h-7 w-7 object-contain" />
                <span v-else class="text-[10px] text-slate-600">prévia</span>
              </div>
            </div>
            <p class="mt-1 text-[11px] text-slate-500">
              Veja
              <a href="https://github.com/walkxcode/dashboard-icons" target="_blank" rel="noopener" class="text-sky-400 hover:underline">
                dashboard-icons
              </a>
              pra ícones prontos.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Grupo</label>
            <input
              v-model="group"
              type="text"
              :placeholder="groupPlaceholder"
              class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
              @change="commit('group', group)"
            />
          </div>

          <div class="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">URL custom</label>
              <input
                v-model="url"
                type="url"
                :placeholder="urlPlaceholder"
                class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
                @change="commit('url', url)"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Porta</label>
              <input
                v-model="port"
                type="number"
                min="1"
                max="65535"
                :placeholder="portPlaceholder"
                class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-slate-600"
                @change="commit('port', port)"
              />
            </div>
          </div>
          <p class="text-[11px] text-slate-500">
            URL custom sobrescreve tudo. Senão, monta <code>http://&lt;host atual&gt;:&lt;porta&gt;</code>.
          </p>
        </div>

        <footer class="flex items-center justify-between gap-2 border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-red-300"
            @click="onResetAll"
          >
            Resetar tudo
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
            @click="emit('close')"
          >
            Concluído
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
