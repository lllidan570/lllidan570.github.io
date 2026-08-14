<script setup lang="ts">
/**
 * ScrollProgress.vue
 * 顶部滚动进度条：页面滚动时渐变进度条从左到右填充
 * - 使用 ScrollTrigger 的 scrub 实现，跟随滚动平滑联动
 * - 路由切换后自动刷新 ScrollTrigger 的测量
 */
import { onMounted, onBeforeUnmount, watch, nextTick, ref } from 'vue'
import { useRoute } from 'vitepress'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

const route = useRoute()
const bar = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion() || !bar.value) return

  ctx = gsap.context(() => {
    gsap.to(bar.value, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        scrub: 0.3,
      },
    })
  })

  // SPA 路由切换后，文档高度变化，需重新测量滚动范围
  watch(
    () => route.path,
    () => nextTick(() => ScrollTrigger.refresh()),
  )
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="bar" class="scroll-progress" aria-hidden="true"></div>
</template>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 1000;
  transform-origin: 0 50%;
  transform: scaleX(0);
  background: linear-gradient(90deg, var(--rainbow-prev), var(--rainbow-next));
  pointer-events: none;
}
</style>
