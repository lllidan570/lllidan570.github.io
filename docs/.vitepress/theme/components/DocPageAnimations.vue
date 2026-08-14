<script setup lang="ts">
/**
 * DocPageAnimations.vue
 * 文章页动效（仅文档页 .vp-doc 生效）：
 * 1. h1 标题 + 元信息（更新日期/字数/时长）淡入
 * 2. 正文图片滚动进入视口时逐张淡入（轻微放大）
 *
 * 设计要点：
 * - 只在 onMounted 后运行，SSR 预渲染不受影响
 * - 滚动触发的图片揭示使用 immediateRender: false：触发前图片保持可见
 * - 图片动画结束后清除内联样式，避免与 medium-zoom 冲突
 * - 路由切换时自动清理并重播
 */
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

const route = useRoute()
let ctx: gsap.Context | undefined

function init() {
  // 清理上一次路由的动画与触发点
  ctx?.revert()

  // 仅文档页生效；减弱动态效果时跳过（内容保持直接可见）
  if (prefersReducedMotion() || !document.querySelector('.vp-doc')) return

  ctx = gsap.context(() => {
    /* ---------- 1. h1 + 元信息入场 ---------- */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.vp-doc h1', { y: 26, opacity: 0, duration: 0.6 })
      .from('.vp-doc .word', { y: 14, opacity: 0, duration: 0.5 }, '-=0.3')

    /* ---------- 2. 正文图片滚动揭示 ---------- */
    const imgs = gsap.utils.toArray<HTMLElement>('.vp-doc img')
    if (imgs.length) {
      ScrollTrigger.batch(imgs, {
        start: 'top 92%', // 图片顶部进入视口 92% 即触发
        once: true,
        onEnter(batch) {
          gsap.from(batch, {
            y: 24,
            opacity: 0,
            scale: 1.03,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false,
            clearProps: 'all', // 结束后清除内联样式，避免与 medium-zoom 冲突
          })
        },
      })
    }
  })
}

onMounted(() => {
  init()
  // SPA 路由切换后重新初始化
  watch(
    () => route.path,
    () => nextTick(() => init()),
  )
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <!-- 本组件不渲染任何可见内容，仅挂载时执行动画 -->
</template>
