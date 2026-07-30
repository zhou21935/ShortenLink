import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from './App.vue'

describe('App', () => {
  it('mounts the Vue application', () => {
    const wrapper = mount(App)

    expect(wrapper.exists()).toBe(true)
  })
})
