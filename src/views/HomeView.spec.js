import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ShortLinkApiError } from '../api/shortLinksApi'
import HomeView from './HomeView.vue'

const createdLink = {
  originalUrl: 'https://example.com/article',
  shortCode: 'news_2026',
  shortUrl: 'https://sho.rt/news_2026',
  clickCount: 0,
}

async function fillForm(wrapper) {
  await wrapper.get('input[name="originalUrl"]').setValue(createdLink.originalUrl)
  await wrapper.get('input[name="customCode"]').setValue(createdLink.shortCode)
}

async function fillAndSubmit(wrapper) {
  await fillForm(wrapper)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('HomeView', () => {
  it('creates and displays the exact backend result from a valid request', async () => {
    const createLink = vi.fn().mockResolvedValue(createdLink)
    const wrapper = mount(HomeView, { props: { createLink } })

    await fillAndSubmit(wrapper)

    expect(createLink).toHaveBeenCalledWith({
      originalUrl: createdLink.originalUrl,
      customCode: createdLink.shortCode,
    })
    expect(wrapper.text()).toContain(createdLink.shortUrl)
    expect(wrapper.text()).toContain(createdLink.originalUrl)
    expect(wrapper.text()).toContain('點擊數')
  })

  it.each([
    ['SHORT_CODE_CONFLICT', '此短碼已被使用，請換一組'],
    ['SHORT_CODE_GENERATION_FAILED', '目前無法產生短碼，請稍後再試'],
    ['UNKNOWN_ERROR', '目前無法建立短網址，請稍後再試'],
  ])('maps %s to safe feedback and restores submission', async (code, message) => {
    const createLink = vi.fn().mockRejectedValue(new ShortLinkApiError(code, 'server detail'))
    const wrapper = mount(HomeView, { props: { createLink } })

    await fillAndSubmit(wrapper)

    expect(wrapper.text()).toContain(message)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).not.toContain('server detail')
  })

  it('keeps the previous successful result after a later failure', async () => {
    const createLink = vi
      .fn()
      .mockResolvedValueOnce(createdLink)
      .mockRejectedValueOnce(new ShortLinkApiError('SHORT_CODE_CONFLICT', 'server detail', 409))
    const wrapper = mount(HomeView, { props: { createLink } })

    await fillAndSubmit(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(createdLink.shortUrl)
    expect(wrapper.text()).toContain('此短碼已被使用，請換一組')
  })

  it('ignores duplicate submissions while a request is pending', async () => {
    let resolveRequest
    const createLink = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )
    const wrapper = mount(HomeView, { props: { createLink } })
    await fillForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(createLink).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    resolveRequest(createdLink)
    await flushPromises()
    expect(wrapper.text()).toContain(createdLink.shortUrl)
  })
})