<script setup lang="ts">
/**
 * NavScrollHide.vue
 * 导航栏滚动行为（仅桌面端 ≥960px 启用）：
 * - 向下滚动超过阈值 → 导航栏平滑隐藏
 * - 向上滚动 → 导航栏平滑显示
 * - 回到页面顶部 → 始终显示
 * - 移动端菜单展开时 → 不隐藏
 * - 减弱动态效果时 → 隐藏/显示无过渡动画
 * - 路由切换后重置为显示状态
 *
 * 为何仅桌面端：移动端 .VPNav 为相对定位，平移隐藏会留下空隙。
 */
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

const route = useRoute()
let mm: gsap.MatchMedia | undefined

const NAV_SCROLL_THRESHOLD = 240

onMounted(() => {
  mm = gsap.matchMedia()

  mm.add('(min-width: 960px)', () => {
    const apply = (shouldHide: boolean) => {
      const nav = document.querySelector('.VPNav') as HTMLElement | null
      if (!nav) return
      // 移动端菜单展开时不隐藏（保险起见仍检查）
      if (document.querySelector('.VPNavBar')?.classList.contains('screen-open')) return
      if (prefersReducedMotion()) {
        gsap.set(nav, { yPercent: shouldHide ? -100 : 0 })
      } else {
        gsap.to(nav, {
          yPercent: shouldHide ? -100 : 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
    }

    ScrollTrigger.create({
      start: NAV_SCROLL_THRESHOLD,
      end: 'max',
      onUpdate(self) {
        // direction: 1 = 向下滚动；scroll() > 阈值才隐藏
        apply(self.direction === 1 && self.scroll() > NAV_SCROLL_THRESHOLD)
      },
    })
  })

  // 路由切换后重置导航栏为显示状态，并重新测量滚动触发点
  watch(
    () => route.path,
    () => {
      nextTick(() => {
        const nav = document.querySelector('.VPNav') as HTMLElement | null
        if (nav) gsap.set(nav, { yPercent: 0 })
        ScrollTrigger.refresh()
      })
    },
  )
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <!-- 本组件不渲染任何可见内容 -->
</template>
