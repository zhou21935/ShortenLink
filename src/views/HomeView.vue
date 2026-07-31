<script setup>
import { ref } from 'vue'
import { createShortLink } from '../api/shortLinksApi'
import ShortLinkForm from '../components/ShortLinkForm.vue'
import ShortLinkResult from '../components/ShortLinkResult.vue'

const props = defineProps({ createLink: { type: Function, default: createShortLink } })
const pending = ref(false)
const result = ref(null)
const requestError = ref('')

async function handleSubmit(payload) {
  if (pending.value) return
  pending.value = true
  requestError.value = ''
  try {
    result.value = await props.createLink(payload)
  } catch {
    requestError.value = '目前無法建立短網址，請稍後再試'
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
