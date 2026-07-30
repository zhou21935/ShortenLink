<script setup>
import { nextTick, reactive, ref } from 'vue'

import { validateOriginalUrl, validateShortCode } from '../utils/validators'

const props = defineProps({
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const originalUrl = ref('')
const customCode = ref('')
const originalUrlInput = ref(null)
const customCodeInput = ref(null)
const errors = reactive({ originalUrl: '', customCode: '' })

async function submitForm() {
  if (props.pending) return

  errors.originalUrl = validateOriginalUrl(originalUrl.value)
  errors.customCode = validateShortCode(customCode.value)

  if (errors.originalUrl || errors.customCode) {
    await nextTick()
    ;(errors.originalUrl ? originalUrlInput : customCodeInput).value?.focus()
    return
  }

  emit('submit', {
    originalUrl: originalUrl.value.trim(),
    customCode: customCode.value,
  })
}
</script>

<template>
  <form class="short-link-form" novalidate @submit.prevent="submitForm">
    <div class="field">
      <label for="original-url">原始網址</label>
      <input
        id="original-url"
        ref="originalUrlInput"
        v-model="originalUrl"
        name="originalUrl"
        type="url"
        inputmode="url"
        autocomplete="url"
        placeholder="https://example.com/article"
        :aria-invalid="Boolean(errors.originalUrl)"
        :aria-describedby="errors.originalUrl ? 'original-url-error' : undefined"
      />
      <p v-if="errors.originalUrl" id="original-url-error" class="field-error">
        {{ errors.originalUrl }}
      </p>
    </div>

    <div class="field">
      <label for="custom-code">自訂短碼 <span>選填</span></label>
      <input
        id="custom-code"
        ref="customCodeInput"
        v-model="customCode"
        name="customCode"
        type="text"
        autocomplete="off"
        placeholder="news_2026"
        :aria-invalid="Boolean(errors.customCode)"
        :aria-describedby="errors.customCode ? 'custom-code-error' : 'custom-code-hint'"
      />
      <p id="custom-code-hint" class="field-hint">3–32 位英數字、連字號或底線</p>
      <p v-if="errors.customCode" id="custom-code-error" class="field-error">
        {{ errors.customCode }}
      </p>
    </div>

    <button class="primary-button" type="submit" :disabled="pending">
      {{ pending ? '建立中…' : '建立短網址' }}
    </button>
  </form>
</template>
