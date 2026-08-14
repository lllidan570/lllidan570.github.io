<script setup lang="ts">
/**
 * NavScrollHide.vue
 * 导航栏滚动行为（仅桌面端 ≥960px 启用）：
 * - 向下滚动超过阈值 → 导航栏平滑隐藏
 * - 向上滚动 → 导航栏平滑显示
 * - 回到页面顶部 → 始终显示
 * - 移动端菜单展开时 → 不隐藏
 * - 减弱动态效果时 → 隐藏/显示无过渡动画
 *
 * ⚠️ 关键约束：任何对 .VPNav 的 transform 操作都必须限定在桌面端。
 * transform 会让 .VPNav 成为 position:fixed 后代的包含块，
 * 导致移动端菜单（VPNavScreen，fixed 定位）塌缩为 0 高度而无法显示。
 */
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

const route = useRoute()
let mm: gsap.MatchMedia | undefined

const NAV_SCROLL_THRESHOLD = 240
const isDesktop = () => window.matchMedia('(min-width: 960px)').matches

onMounted(() => {
  mm = gsap.matchMedia()

  // 仅在桌面端启用（移动端 .VPNav 为相对定位，隐藏会留出空隙）
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

  // 路由切换后：桌面端重置导航为显示状态；移动端绝不触碰 .VPNav 的 transform
  // （否则会破坏移动端菜单的 fixed 定位，导致菜单塌缩不可见）
  watch(
    () => route.path,
    () => {
      nextTick(() => {
        if (isDesktop()) {
          const nav = document.querySelector('.VPNav') as HTMLElement | null
          if (nav) gsap.set(nav, { yPercent: 0 })
        }
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
