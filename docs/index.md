---
layout: false
---
<!-- 双首页随机跳转：每次打开 50/50 在电影首页 /cinema/ 与空间首页 /space/ 之间随机 -->
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  const target = Math.random() < 0.5 ? '/cinema/' : '/space/'
  window.location.replace(target)
})
</script>
