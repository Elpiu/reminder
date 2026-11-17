<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const { data: inbox } = useInbox()

const items = computed(() => [
  { to: '/', label: t('nav.today'), icon: 'i-lucide-sun', active: route.path === '/' },
  { to: '/calendario', label: t('nav.calendar'), icon: 'i-lucide-calendar-days', active: route.path.startsWith('/calendario') },
  { to: '/andamento', label: t('nav.progress'), icon: 'i-lucide-chart-no-axes-column', active: route.path.startsWith('/andamento') },
  { to: '/inbox', label: t('nav.inbox'), icon: 'i-lucide-inbox', active: route.path.startsWith('/inbox'), count: inbox.value.length },
])
</script>

<template>
  <nav
    :aria-label="$t('nav.aria')"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-default/60 bg-default/90 backdrop-blur safe-bottom"
  >
    <ul class="mx-auto grid h-(--nav-h) max-w-2xl grid-cols-4">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          :class="item.active ? 'text-primary' : 'text-muted hover:text-default'"
          :aria-current="item.active ? 'page' : undefined"
        >
          <span class="relative flex h-8 w-14 items-center justify-center rounded-full transition-colors" :class="item.active ? 'bg-primary/12' : ''">
            <UIcon :name="item.icon" class="size-5" />
            <span
              v-if="item.count"
              class="absolute -top-0.5 right-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-inverted"
            >{{ item.count > 99 ? '99+' : item.count }}</span>
          </span>
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
