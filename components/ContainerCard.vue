<script setup lang="ts">
import type { HomelabContainer } from '~/types/container'

const props = defineProps<{
  container: HomelabContainer
  editMode?: boolean
}>()

const emit = defineEmits<{
  toggleHide: [key: string]
  setPort: [key: string, port: number | null]
}>()

const hostname = ref('')
onMounted(() => {
  hostname.value = window.location.hostname
})

const effectivePort = computed<number | undefined>(() => {
  return props.container.customPort ?? props.container.ports[0]?.publicPort
})

const resolvedUrl = computed<string | undefined>(() => {
  if (props.container.url) return props.container.url
  if (!hostname.value) return undefined
  const port = effectivePort.value
  if (!port) return undefined
  const scheme = port === 443 ? 'https' : 'http'
  return `${scheme}://${hostname.value}:${port}`
})

const portInput = ref<string>('')
watch(
  () => props.container.customPort,
  (val) => {
    portInput.value = val ? String(val) : ''
  },
  { immediate: true }
)

function onPortChange(e: Event) {
  const raw = (e.target as HTMLInputElement).value.trim()
  if (!raw) {
    emit('setPort', props.container.key, null)
    return
  }
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0 || n > 65535) return
  emit('setPort', props.container.key, n)
}

const isLink = computed(() => !props.editMode && !!resolvedUrl.value)

const initials = computed(() => {
  return props.container.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const isUrlIcon = computed(() => {
  const icon = props.container.icon
  return !!icon && /^(https?:\/\/|\/)/.test(icon)
})

const stateColor = computed(() => {
  return props.container.state === 'running' ? 'bg-emerald-500' : 'bg-slate-500'
})

function onHideClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('toggleHide', props.container.key)
}

const autoDetectedPort = computed(() => props.container.ports[0]?.publicPort)
</script>

<template>
  <component
    :is="isLink ? 'a' : 'div'"
    :href="isLink ? resolvedUrl : undefined"
    :target="isLink ? '_blank' : undefined"
    :rel="isLink ? 'noopener noreferrer' : undefined"
    class="group relative flex flex-col gap-3 rounded-2xl border bg-slate-900/60 p-5 transition"
    :class="[
      isLink ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/40' : '',
      editMode && !container.hidden ? 'border-sky-700/60 cursor-grab active:cursor-grabbing' : 'border-slate-800',
      editMode && container.hidden ? 'border-dashed border-slate-700 opacity-50' : '',
      !editMode && container.hidden ? 'hidden' : ''
    ]"
  >
    <button
      v-if="editMode"
      type="button"
      class="no-drag absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700 hover:text-white"
      :title="container.hidden ? 'Mostrar card' : 'Esconder card'"
      @mousedown.stop
      @click="onHideClick"
    >
      <svg v-if="container.hidden" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    </button>

    <div class="flex items-start gap-3">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-700">
        <img
          v-if="isUrlIcon"
          :src="container.icon"
          :alt="container.name"
          class="h-8 w-8 object-contain"
        />
        <span v-else class="text-sm font-bold text-slate-300">{{ initials }}</span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate text-base font-semibold text-slate-100">
            {{ container.name }}
          </h3>
          <span
            class="inline-block h-2 w-2 rounded-full"
            :class="stateColor"
            :title="container.status"
          />
        </div>
        <p class="truncate text-xs text-slate-400">
          {{ container.description || container.image }}
        </p>
      </div>
    </div>

    <div v-if="container.ports.length" class="flex flex-wrap gap-1.5">
      <span
        v-for="p in container.ports"
        :key="`${p.publicPort}-${p.type}`"
        class="rounded-md px-2 py-0.5 font-mono text-xs"
        :class="
          container.customPort && container.customPort === p.publicPort
            ? 'bg-sky-900/50 text-sky-200 ring-1 ring-sky-700/50'
            : 'bg-slate-800 text-slate-300'
        "
      >
        {{ p.publicPort }}<span class="text-slate-500">/{{ p.type }}</span>
      </span>
      <span
        v-if="container.customPort && !container.ports.some(p => p.publicPort === container.customPort)"
        class="rounded-md bg-sky-900/50 px-2 py-0.5 font-mono text-xs text-sky-200 ring-1 ring-sky-700/50"
      >
        {{ container.customPort }}<span class="text-slate-400">/custom</span>
      </span>
    </div>
    <div v-else-if="!editMode && container.customPort" class="flex flex-wrap gap-1.5">
      <span class="rounded-md bg-sky-900/50 px-2 py-0.5 font-mono text-xs text-sky-200 ring-1 ring-sky-700/50">
        {{ container.customPort }}<span class="text-slate-400">/custom</span>
      </span>
    </div>
    <div v-else-if="!editMode" class="text-xs italic text-slate-500">
      sem portas expostas
    </div>

    <div v-if="editMode" class="no-drag" @mousedown.stop @click.stop>
      <label class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5">
        <span class="text-[10px] uppercase tracking-wider text-slate-500">Porta</span>
        <input
          :value="portInput"
          type="number"
          min="1"
          max="65535"
          :placeholder="autoDetectedPort ? String(autoDetectedPort) : 'ex: 8080'"
          class="w-full bg-transparent text-xs font-mono text-slate-100 placeholder-slate-600 outline-none"
          @input="(e) => portInput = (e.target as HTMLInputElement).value"
          @change="onPortChange"
        />
      </label>
    </div>
  </component>
</template>
