<script setup lang="ts">
/**
 * HomePageAnimations.vue
 * 首页滚动揭示动画（GSAP + ScrollTrigger）：
 * - 特性卡片滚动错峰上浮
 * - 友链卡片滚动错峰淡入
 *
 * hero 的电影化动画已由 CinematicHero.vue 接管。
 * 设计要点：
 * - 滚动触发动画使用 immediateRender: false：触发前内容保持可见
 * - 触发点为"进入视口即播放"，加载时已在视口内则立即播放
 * - 组件卸载时 ctx.revert() 自动还原所有内联样式与 ScrollTrigger
 */
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

let ctx: gsap.Context | undefined
let onLoadRefresh: (() => void) | undefined

onMounted(() => {
  // 系统开启"减弱动态效果"时，跳过所有动画，保证内容直接可见
  if (prefersReducedMotion()) return

  // 页面资源（懒加载图片/iframe 等）加载完后重新测量滚动触发点
  onLoadRefresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', onLoadRefresh)

  ctx = gsap.context(() => {
    /* ---------- 1. 特性卡片滚动错峰上浮 ---------- */
    gsap.from('.VPFeatures .VPFeature', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      immediateRender: false, // 触发前不隐藏内容
      scrollTrigger: {
        trigger: '.VPFeatures',
        start: 'top 82%',
        once: true,
        invalidateOnRefresh: true, // 布局变化后重新测量
      },
    })

    /* ---------- 2. 友链卡片滚动错峰淡入 ---------- */
    // 友链区由 <ClientOnly> 在客户端渲染，卡片在 onMounted 之后才出现，
    // 因此用 nextTick + rAF 重试等待 DOM 就绪（最多约 20 帧），
    // 并通过 ctx.add() 让后续创建的动画仍受 context 统一清理
    nextTick(() => {
      const setupFriends = (attempt = 0) => {
        const container = document.querySelector('.m-nav-links')
        if (!container) {
          if (attempt < 20) requestAnimationFrame(() => setupFriends(attempt + 1))
          return
        }
        ctx?.add(() => {
          gsap.from('.m-nav-links .m-nav-link', {
            y: 26,
            opacity: 0,
            duration: 0.55,
            stagger: 0.06,
            ease: 'power2.out',
            // 触发前保持可见，绝不残留隐藏状态
            immediateRender: false,
            scrollTrigger: {
              trigger: '.m-nav-links',
              start: 'top bottom',
              once: true,
              invalidateOnRefresh: true,
            },
          })
        })
        // 创建后立即重新测量一次，避免懒加载资源导致触发点计算失效
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }
      setupFriends()
    })
  })
})

onBeforeUnmount(() => {
  // 路由离开首页时，还原所有内联样式并销毁 ScrollTrigger
  if (onLoadRefresh) window.removeEventListener('load', onLoadRefresh)
  ctx?.revert()
})
</script>

<template>
  <!-- 本组件不渲染任何可见内容，仅在首页挂载时执行动画 -->
</template>
