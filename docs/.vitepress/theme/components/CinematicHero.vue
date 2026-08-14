<script setup lang="ts">
/**
 * CinematicHero.vue
 * 首页 hero 电影化：把默认 .VPHero 包装进 sticky 舞台，用 GSAP ScrollTrigger 驱动三层镜头。
 *
 * 镜头编排（滚动余量 desktop 2200px / mobile 1500px，按比例分配）：
 *   进场  —— 加载时名字/标题/按钮/logo 错峰入场 + 天空渐变浮现
 *   第二幕 —— hero 内容上移淡出、光晕球放大、装饰光环与天空鼠标视差
 *   第三幕 —— 光环向两侧分开，中文衬线大字口号逐行升起
 *   收束  —— 口号上移淡出、天空变暗 + 品牌色遮罩（景深），页面内容接棒
 *
 * 设计要点：
 * - 运行时 DOM 包装（wrapper 包住 .VPHero），卸载时还原，不侵入 VitePress 结构
 * - 初始隐藏态用 gsap 在 JS 里设置（减弱动效/JS 失败时内容直接可见）
 * - 相同元素上不叠加 transform 动画（orb 缩放与视差分层到嵌套元素）
 * - prefers-reduced-motion 时完全跳过（页面保持普通布局）
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/useGsap'

let ctx: gsap.Context | undefined
let wrapper: HTMLElement | null = null
let stage: HTMLElement | null = null
let hero: HTMLElement | null = null
let clearParallax: (() => void) | undefined

/* ---------- DOM 构建：包装 .VPHero 并注入分层装饰 ---------- */
function buildStage(): boolean {
  hero = document.querySelector('.VPHero')
  if (!hero) return false
  // 幂等：已包装则跳过（HMR / 重复挂载）
  if (hero.closest('.cine-scroll')) return true

  wrapper = document.createElement('div')
  wrapper.className = 'cine-scroll'
  stage = document.createElement('div')
  stage.className = 'cine-stage'

  const deco = document.createElement('div')
  deco.className = 'cine-deco'
  deco.innerHTML = [
    '<div class="cine-sky"></div>',
    '<div class="cine-orb"><div class="cine-orb-core"></div></div>',
    '<div class="cine-rings"><div class="ring ring-l"></div><div class="ring ring-r"></div></div>',
    '<div class="cine-shade"></div>',
  ].join('')
  stage.appendChild(deco)

  // 把 .VPHero 移入 stage（保持其在页面中的原有位置）
  hero.parentNode?.insertBefore(wrapper, hero)
  stage.appendChild(hero)
  wrapper.appendChild(stage)

  // 第三幕的口号层（装饰性，与 tagline 同文案）
  const motto = document.createElement('div')
  motto.className = 'cine-motto'
  motto.setAttribute('aria-hidden', 'true')
  motto.innerHTML = '<p>你的时间花在哪里</p><p>你的收获就在哪里</p>'
  stage.appendChild(motto)

  // 滚动余量：桌面 2200px / 移动 1500px
  const room = window.innerWidth < 640 ? 1500 : 2200
  wrapper.style.height = `calc(100vh + ${room}px)`
  return true
}

/* ---------- 卸载时还原 DOM ---------- */
function teardown() {
  if (wrapper && hero) {
    wrapper.parentNode?.insertBefore(hero, wrapper)
    wrapper.remove()
  }
  wrapper = null
  stage = null
}

onMounted(() => {
  // 减弱动态效果：完全跳过（页面保持普通布局，hero 直接可见）
  if (prefersReducedMotion()) return
  if (!buildStage() || !wrapper || !stage) return

  ctx = gsap.context(() => {
    /* ===== 进场（加载时播放，非 scrub） ===== */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.cine-sky', { opacity: 0, duration: 1.2 }, 0)
      .from('.cine-stage .VPHero .name', { y: 56, opacity: 0, duration: 0.9 }, 0.15)
      .from('.cine-stage .VPHero .text', { y: 34, opacity: 0, duration: 0.8 }, '-=0.55')
      .from('.cine-stage .VPHero .tagline', { y: 22, opacity: 0, duration: 0.7 }, '-=0.45')
      .from(
        '.cine-stage .VPHero .actions .VPButton',
        { y: 22, opacity: 0, duration: 0.6, stagger: 0.14 },
        '-=0.4',
      )
      .from(
        '.cine-stage .VPHero .image-container',
        { scale: 0.82, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' },
        '-=0.75',
      )
      .from('.cine-orb-core', { opacity: 0, scale: 0.6, duration: 1.1 }, '-=0.9')
      .from('.cine-rings', { opacity: 0, duration: 1 }, '-=0.6')

    /* ===== Logo 悬浮呼吸 ===== */
    gsap.to('.cine-stage .VPHero .image-container img', {
      y: -14,
      duration: 2.6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })

    /* ===== 三层镜头（滚动 scrub，位置为总滚动余量的比例） ===== */
    const scenes = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })

    // 第二幕：hero 内容上移淡出，光晕球放大
    scenes
      .to('.cine-stage .VPHero .main', { yPercent: -26, opacity: 0, ease: 'power1.in' }, 0)
      .to('.cine-stage .VPHero .image-container', { yPercent: -34, opacity: 0, ease: 'power1.in' }, 0)
      .to('.cine-orb', { scale: 1.35, opacity: 0.9, ease: 'power1.inOut' }, 0)

    // 第三幕：光环分开，口号逐行升起
    scenes
      .to('.cine-rings .ring-l', { x: '-16vw', opacity: 0.9, ease: 'power1.inOut' }, 0.38)
      .to('.cine-rings .ring-r', { x: '16vw', opacity: 0.9, ease: 'power1.inOut' }, 0.38)
      .to('.cine-orb', { scale: 2.1, opacity: 0.5, ease: 'power1.inOut' }, 0.38)
      .fromTo(
        '.cine-motto p',
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.16, ease: 'power2.out' },
        0.44,
      )

    // 收束：口号离场，天空变暗 + 品牌色遮罩
    scenes
      .to('.cine-motto', { yPercent: -46, opacity: 0, ease: 'power1.in' }, 0.72)
      .to('.cine-sky', { filter: 'brightness(0.72) saturate(0.9)', ease: 'none' }, 0.72)
      .to('.cine-shade', { opacity: 0.55, ease: 'none' }, 0.72)
      .to('.cine-rings', { opacity: 0, ease: 'none' }, 0.8)

    /* ===== 鼠标视差（quickTo，各层不同倍率） ===== */
    const skyX = gsap.quickTo('.cine-sky', 'x', { duration: 0.9, ease: 'power2.out' })
    const skyY = gsap.quickTo('.cine-sky', 'y', { duration: 0.9, ease: 'power2.out' })
    const ringsX = gsap.quickTo('.cine-rings', 'x', { duration: 0.9, ease: 'power2.out' })
    const ringsY = gsap.quickTo('.cine-rings', 'y', { duration: 0.9, ease: 'power2.out' })
    const orbX = gsap.quickTo('.cine-orb-core', 'x', { duration: 0.9, ease: 'power2.out' })
    const orbY = gsap.quickTo('.cine-orb-core', 'y', { duration: 0.9, ease: 'power2.out' })

    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      skyX(nx * -22); skyY(ny * -14)
      ringsX(nx * 26); ringsY(ny * 16)
      orbX(nx * 14); orbY(ny * 10)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    clearParallax = () => window.removeEventListener('pointermove', onPointerMove)
  })
})

onBeforeUnmount(() => {
  clearParallax?.()
  ctx?.revert()
  teardown()
})
</script>

<template>
  <!-- 无渲染：运行时包装现有 .VPHero -->
</template>

<style>
/* ---------- 电影化舞台 ---------- */
.cine-scroll {
  position: relative;
  width: 100%;
}

.cine-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 620px;
  overflow: hidden;
  isolation: isolate;
  background: #0b1410;
}

/* ---------- 分层装饰（在 hero 内容之下） ---------- */
.cine-deco {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.cine-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(130% 100% at 50% 0%, rgba(61, 214, 140, 0.22) 0%, transparent 52%),
    radial-gradient(140% 110% at 50% 108%, rgba(24, 121, 78, 0.55) 0%, transparent 58%),
    linear-gradient(180deg, #08120e 0%, #0c1f17 42%, #123525 100%);
  will-change: transform, filter;
}

.cine-orb {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46vmin;
  height: 46vmin;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

.cine-orb-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(253, 241, 225, 0.85) 0%, rgba(253, 241, 225, 0.12) 30%, transparent 60%),
    radial-gradient(circle at 50% 50%, rgba(61, 214, 140, 0.35) 0%, transparent 65%);
  filter: blur(6px);
  will-change: transform, opacity;
}

.cine-rings {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 78vmin;
  height: 78vmin;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

.cine-rings .ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(253, 241, 225, 0.28);
  will-change: transform, opacity;
}

.cine-rings .ring-r {
  border-color: rgba(61, 214, 140, 0.3);
}

.cine-shade {
  position: absolute;
  inset: 0;
  z-index: 12;
  opacity: 0;
  background: linear-gradient(180deg,
    rgba(11, 20, 16, 0) 0%,
    rgba(11, 20, 16, 0.32) 48%,
    rgba(11, 20, 16, 0.72) 100%);
  will-change: opacity;
}

/* ---------- 第三幕口号 ---------- */
.cine-motto {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 8;
  width: min(760px, calc(100vw - 42px));
  text-align: center;
  opacity: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  will-change: transform, opacity;
}

.cine-motto p {
  margin: 0;
  color: #fdf1e1;
  font-family: Georgia, "Songti SC", "Noto Serif SC", "SimSun", serif;
  font-size: clamp(2.6rem, 7vw, 5.2rem);
  font-weight: 500;
  line-height: 1.12;
  text-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
  will-change: transform, opacity;
}

/* ---------- hero 内容在深色舞台上的文字适配 ---------- */
.cine-stage .VPHero .text,
.cine-stage .VPHero .tagline {
  color: #fdf1e1;
}

.cine-stage .VPHero .actions .VPButton.alt {
  color: #fdf1e1;
  border-color: rgba(253, 241, 225, 0.55);
  background: rgba(253, 241, 225, 0.08);
}

@media (max-width: 640px) {
  .cine-rings { width: 96vmin; height: 96vmin; }
}
</style>
