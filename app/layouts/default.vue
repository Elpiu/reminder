<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
    <slot />
    <div class="h-[calc(var(--nav-h)+env(safe-area-inset-bottom))] shrink-0" aria-hidden="true" />
    <BottomNav />
  </div>
</template>
