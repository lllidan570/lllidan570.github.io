<script setup lang="ts">
/**
 * HomePageAnimations.vue
 * 首页样板动画（GSAP + ScrollTrigger）：
 * 1. Hero 进场时间轴（名字/标题/副标题/按钮/logo 错峰入场）
 * 2. Logo 悬浮呼吸（无限循环）
 * 3. Hero 滚动视差（内容上移淡出）
 * 4. 特性卡片滚动错峰上浮
 * 5. 友链卡片滚动错峰淡入
 *
 * 设计要点：
 * - 只在 onMounted（浏览器端）运行，SSR 预渲染不受影响
 * - 滚动触发的入场动画使用 immediateRender: false：
 *   触发前内容保持可见，即使触发器因布局测量问题未触发，
 *   也绝不会出现内容滞留隐藏（无滚动也始终看得到）
 * - 触发点统一为"进入视口即播放"，加载时已在视口内的区域无需滚动也会立即播放
 * - 组件卸载时 ctx.revert() 自动还原所有内联样式与 ScrollTrigger
 */
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

let ctx: gsap.Context | undefined
let onLoadRefresh: (() => void) | undefined

onMounted(() => {
  // 系统开启"减弱动态效果"时，跳过所有动画，保证内容直接可见
  if (prefersReducedMotion()) return

  // 页面资源（懒加载图片/iframe 等）加载完后重新测量滚动触发点，
  // 避免布局变化导致触发位置计算失效
  onLoadRefresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', onLoadRefresh)

  ctx = gsap.context(() => {
    /* ---------- 1. Hero 进场时间轴 ---------- */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.VPHero .name', { y: 56, opacity: 0, duration: 0.9 })
      .from('.VPHero .text', { y: 34, opacity: 0, duration: 0.8 }, '-=0.55')
      .from('.VPHero .tagline', { y: 22, opacity: 0, duration: 0.7 }, '-=0.45')
      .from(
        '.VPHero .actions .VPButton',
        { y: 22, opacity: 0, duration: 0.6, stagger: 0.14 },
        '-=0.4',
      )
      .from(
        '.VPHero .image-container',
        { scale: 0.82, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' },
        '-=0.75',
      )

    /* ---------- 2. Logo 悬浮呼吸（无限） ---------- */
    gsap.to('.VPHero .image-container img', {
      y: -14,
      duration: 2.6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })

    /* ---------- 3. Hero 滚动视差 ---------- */
    gsap.to('.VPHero .main', {
      yPercent: -18,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.VPHero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    })

    // logo 容器随滚动轻微上移（比文字慢，形成景深）
    gsap.to('.VPHero .image', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.VPHero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    })

    /* ---------- 4. 特性卡片滚动错峰上浮 ---------- */
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

    /* ---------- 5. 友链卡片滚动错峰淡入 ---------- */
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
            // 关键：触发前保持可见，绝不残留隐藏状态。
            // start: 'top bottom' 表示"区域顶部一进入视口就播放"——
            // 若加载时已在视口内（无需滚动），也会立即播放
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
