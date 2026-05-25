<script setup lang="ts">
import type { HomelabContainer } from '~/types/container'

const props = defineProps<{
  container: HomelabContainer
  editMode?: boolean
}>()

const emit = defineEmits<{
  toggleHide: [key: string]
  openSettings: [key: string]
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

function onSettingsClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('openSettings', props.container.key)
}
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
    <div v-if="editMode" class="no-drag absolute right-2 top-2 flex items-center gap-1" @mousedown.stop>
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700 hover:text-white"
        title="Configurar"
        @click="onSettingsClick"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.107-1.204-.165-.397-.505-.71-.93-.78l-.893-.15c-.543-.09-.94-.56-.94-1.109v-1.094c0-.55.397-1.02.94-1.11l.893-.149c.425-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700 hover:text-white"
        :title="container.hidden ? 'Mostrar card' : 'Esconder card'"
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
    </div>

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

      <div class="min-w-0 flex-1 pr-16">
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

    <div v-if="container.ports.length || container.customPort" class="flex flex-wrap gap-1.5">
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
    <div v-else class="text-xs italic text-slate-500">
      sem portas expostas
    </div>
  </component>
</template>
