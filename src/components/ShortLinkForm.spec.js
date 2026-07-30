import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ShortLinkForm from './ShortLinkForm.vue'

describe('ShortLinkForm', () => {
  it('blocks invalid input and focuses the first invalid field', async () => {
    const wrapper = mount(ShortLinkForm, { attachTo: document.body })

    await wrapper.get('input[name="customCode"]').setValue('ab')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('請輸入原始網址')
    expect(wrapper.text()).toContain('短碼需為 3–32 位英數字、連字號或底線')
    expect(document.activeElement).toBe(wrapper.get('input[name="originalUrl"]').element)

    wrapper.unmount()
  })

  it('emits one valid request and blocks another while pending', async () => {
    const wrapper = mount(ShortLinkForm)

    await wrapper.get('input[name="originalUrl"]').setValue('https://example.com/article')
    await wrapper.get('input[name="customCode"]').setValue('news_2026')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ originalUrl: 'https://example.com/article', customCode: 'news_2026' }],
    ])

    await wrapper.setProps({ pending: true })
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').text()).toBe('建立中…')
  })
})
