import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HomeView from './HomeView.vue'

async function fillAndSubmit(wrapper) {
  await wrapper.get('input[name="originalUrl"]').setValue('https://example.com/article')
  await wrapper.get('input[name="customCode"]').setValue('news_2026')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('HomeView', () => {
  it('creates and displays a short link from a valid request', async () => {
    const wrapper = mount(HomeView)
    await fillAndSubmit(wrapper)
    expect(wrapper.text()).toContain('https://sho.rt/news_2026')
    expect(wrapper.text()).toContain('https://example.com/article')
    expect(wrapper.text()).toContain('點擊數')
  })

  it('keeps input and reports an adapter rejection', async () => {
    const createLink = vi.fn().mockRejectedValue(new Error('offline'))
    const wrapper = mount(HomeView, { props: { createLink } })
    await fillAndSubmit(wrapper)
    expect(wrapper.text()).toContain('目前無法建立短網址，請稍後再試')
    expect(wrapper.get('input[name="originalUrl"]').element.value).toBe('https://example.com/article')
    expect(wrapper.get('input[name="customCode"]').element.value).toBe('news_2026')
  })
})
