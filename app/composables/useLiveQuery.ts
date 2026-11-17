import { liveQuery, type Subscription } from 'dexie'
import type { WatchSource } from 'vue'

/**
 * Esegue una query Dexie e la ri-esegue quando cambiano i dati in IndexedDB
 * o quando cambiano le sorgenti reattive passate in `deps`.
 */
export function useLiveQuery<T>(
  querier: () => T | Promise<T>,
  deps: WatchSource[] = [],
  initial: T,
) {
  const data = shallowRef<T>(initial)
  const ready = ref(false)
  let sub: Subscription | undefined

  const start = () => {
    sub?.unsubscribe()
    sub = liveQuery(querier).subscribe({
      next: (value) => {
        data.value = value
        ready.value = true
      },
      error: error => console.error('[useLiveQuery]', error),
    })
  }

  if (deps.length) watch(deps, start, { immediate: true })
  else start()

  onScopeDispose(() => sub?.unsubscribe())

  return { data, ready }
}
