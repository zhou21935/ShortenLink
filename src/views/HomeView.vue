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
    <header class="hero">
      <a class="brand" href="/" aria-label="ShortenLink 首頁">
        <span class="brand-mark" aria-hidden="true">S</span><span>ShortenLink</span>
      </a>
      <div class="hero-copy">
        <p class="eyebrow">簡潔分享，清楚抵達</p>
        <h1>把冗長網址，變成俐落連結。</h1>
        <p class="hero-description">貼上你的網址，幾秒內建立好記、好分享的短連結。現在就開始，不需註冊。</p>
      </div>
    </header>

    <section class="workspace" aria-labelledby="form-title">
      <div class="workspace-heading">
        <div><p class="step-label">01 — 建立連結</p><h2 id="form-title">縮短你的網址</h2></div>
        <p>自訂一組短碼，或留白由我們自動產生。</p>
      </div>
      <ShortLinkForm :pending="pending" @submit="handleSubmit" />
      <p v-if="requestError" class="request-error" role="alert">{{ requestError }}</p>
    </section>

    <Transition name="result"><ShortLinkResult v-if="result" :result="result" /></Transition>
    <footer class="page-footer"><span>快速、安全、專注於分享。</span><span>© 2026 ShortenLink</span></footer>
  </main>
</template>
