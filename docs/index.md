---
layout: false
head:
  - - meta
    - { http-equiv: refresh, content: "0; url=/cinema/" }
---
<!-- SPA 路由入口：跳转到独立电影首页 /cinema/ -->
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  window.location.replace('/cinema/')
})
</script>
