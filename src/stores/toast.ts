import { ref } from 'vue'
import { defineStore } from 'pinia'
export const useToastStore = defineStore('toast', () => {
  const items = ref<Array<{ id: number; kind: 'success' | 'error' | 'info'; title: string; description?: string }>>([])
  let counter = 0
  function show(input: Omit<(typeof items.value)[number], 'id'>) {
    const id = ++counter; items.value.push({ id, ...input })
    window.setTimeout(() => { items.value = items.value.filter((item) => item.id !== id) }, 4200)
  }
  return { items, show }
})
