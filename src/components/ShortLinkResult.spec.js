import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ShortLinkResult from './ShortLinkResult.vue'

const result = {
  originalUrl: 'https://example.com/article',
  shortCode: 'news_2026',
  shortUrl: 'https://sho.rt/news_2026',
  clickCount: 0,
}

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  })
}

describe('ShortLinkResult', () => {
  it('shows the result and copy success feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    const wrapper = mount(ShortLinkResult, { props: { result } })

    await wrapper.get('.copy-button').trigger('click')
    await vi.waitFor(() => expect(wrapper.get('.copy-button').text()).toBe('已複製'))

    expect(writeText).toHaveBeenCalledWith('https://sho.rt/news_2026')
    expect(wrapper.text()).toContain('https://example.com/article')
    expect(wrapper.text()).toContain('點擊數')
    expect(wrapper.text()).toContain('短網址已複製')
  })

  it('keeps the result and shows guidance when copying fails', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    const wrapper = mount(ShortLinkResult, { props: { result } })

    await wrapper.get('.copy-button').trigger('click')
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('無法自動複製，請手動選取短網址'),
    )

    expect(wrapper.text()).toContain('https://sho.rt/news_2026')
  })
})
