import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import StatusBadge from './StatusBadge.vue'

function renderStatusBadge(status?: string) {
  const host = document.createElement('div')
  const app = createApp({ render: () => h(StatusBadge, { status }) })
  app.mount(host)
  return { text: host.textContent || '', unmount: () => app.unmount() }
}

describe('StatusBadge', () => {
  it('shows the Indonesian label for a known status', () => {
    const view = renderStatusBadge('IN_PROGRESS')
    expect(view.text).toContain('Sedang dikerjakan')
    view.unmount()
  })

  it('normalizes unknown statuses without crashing', () => {
    const view = renderStatusBadge('CUSTOM_STATE')
    expect(view.text).toContain('custom state')
    view.unmount()
  })

  it('uses a neutral status when none is provided', () => {
    const view = renderStatusBadge()
    expect(view.text).toContain('unknown')
    view.unmount()
  })
})
