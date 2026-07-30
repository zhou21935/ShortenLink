<script setup>
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  result: { type: Object, required: true },
})

const copyState = ref('idle')
let resetTimer

async function copyShortUrl(shortUrl) {
  clearTimeout(resetTimer)
  copyState.value = 'idle'

  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(shortUrl)
    copyState.value = 'success'
    resetTimer = setTimeout(() => {
      copyState.value = 'idle'
    }, 2000)
  } catch {
    copyState.value = 'error'
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <section class="result-card" aria-labelledby="result-title">
    <div class="result-heading">
      <div>
        <p class="eyebrow">建立完成</p>
        <h2 id="result-title">你的短網址已準備好</h2>
      </div>
      <span class="status-badge">可立即使用</span>
    </div>

    <div class="short-url-row">
      <a :href="result.shortUrl" class="short-url">{{ result.shortUrl }}</a>
      <button class="copy-button" type="button" @click="copyShortUrl(result.shortUrl)">
        {{ copyState === 'success' ? '已複製' : '複製網址' }}
      </button>
    </div>

    <dl class="result-details">
      <div>
        <dt>原始網址</dt>
        <dd><a :href="result.originalUrl">{{ result.originalUrl }}</a></dd>
      </div>
      <div>
        <dt>點擊數</dt>
        <dd>{{ result.clickCount }}</dd>
      </div>
    </dl>

    <p class="sr-only" aria-live="polite">
      {{ copyState === 'success' ? '短網址已複製' : '' }}
    </p>
    <p v-if="copyState === 'error'" class="copy-error" role="status">
      無法自動複製，請手動選取短網址
    </p>
  </section>
</template>
