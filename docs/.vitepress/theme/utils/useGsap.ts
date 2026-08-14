/* .vitepress/theme/utils/useGsap.ts
 * GSAP 基础封装：
 * - SSR 安全（仅在浏览器端注册插件）
 * - 统一导出 gsap / ScrollTrigger
 * - 提供"减弱动态效果"检测，供各组件决定是否跳过动画
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { inBrowser } from 'vitepress'

if (inBrowser) {
  gsap.registerPlugin(ScrollTrigger)
  // 移动端尺寸变化时不重算滚动位置（减少不必要的性能开销）
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger }

/**
 * 用户是否开启了系统级"减弱动态效果"
 * 开启时所有组件应跳过动画（且不能残留 opacity: 0 的初始态）
 */
export function prefersReducedMotion(): boolean {
  return inBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
