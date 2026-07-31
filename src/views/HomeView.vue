<script setup>
import { ref } from 'vue'
import { createShortLink } from '../api/shortLinksApi'
import ShortLinkForm from '../components/ShortLinkForm.vue'
import ShortLinkResult from '../components/ShortLinkResult.vue'

const props = defineProps({ createLink: { type: Function, default: createShortLink } })
const pending = ref(false)
const result = ref(null)
const requestError = ref('')

const ERROR_MESSAGES = {
  SHORT_CODE_CONFLICT: '此短碼已被使用，請換一組',
  INVALID_ORIGINAL_URL: '請重新檢查原始網址',
  INVALID_SHORT_CODE: '請重新檢查自訂短碼',
  SHORT_CODE_GENERATION_FAILED: '目前無法產生短碼，請稍後再試',
}

function getRequestError(error) {
  return ERROR_MESSAGES[error?.code] || '目前無法建立短網址，請稍後再試'
}

async function handleSubmit(payload) {
  if (pending.value) return
  pending.value = true
  requestError.value = ''
  try {
    result.value = await props.createLink(payload)
  } catch (error) {
    requestError.value = getRequestError(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="page-shell">
    <section class="workspace" aria-labelledby="form-title">
      <div class="workspace-heading">
        <div><h2 id="form-title">縮短你的網址</h2></div>
        <p>自訂一組短碼，或留白由我們自動產生。</p>
      </div>
      <ShortLinkForm :pending="pending" @submit="handleSubmit" />
      <p v-if="requestError" class="request-error" role="alert">{{ requestError }}</p>
    </section>
    <Transition name="result"><ShortLinkResult v-if="result" :result="result" /></Transition>
  </main>
</template>