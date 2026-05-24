<script setup lang="ts">
import type { HomelabContainer } from '~/types/container'

const props = defineProps<{
  container: HomelabContainer
}>()

const hostname = ref('')
onMounted(() => {
  hostname.value = window.location.hostname
})

const resolvedUrl = computed<string | undefined>(() => {
  if (props.container.url) return props.container.url
  if (!hostname.value) return undefined
  const first = props.container.ports[0]
  if (!first?.publicPort) return undefined
  const scheme = first.publicPort === 443 ? 'https' : 'http'
  return `${scheme}://${hostname.value}:${first.publicPort}`
})

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
  return props.container.state === 'running'
    ? 'bg-emerald-500'
    : 'bg-slate-500'
})
</script>

<template>
  <component
    :is="resolvedUrl ? 'a' : 'div'"
    :href="resolvedUrl"
    :target="resolvedUrl ? '_blank' : undefined"
    :rel="resolvedUrl ? 'noopener noreferrer' : undefined"
    class="group relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/40"
    :class="{ 'cursor-pointer': resolvedUrl, 'cursor-default': !resolvedUrl }"
  >
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
        class="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300"
      >
        {{ p.publicPort }}<span class="text-slate-500">/{{ p.type }}</span>
      </span>
    </div>
    <div v-else class="text-xs text-slate-500 italic">
      sem portas expostas
    </div>
  </component>
</template>
