<script setup lang="ts">
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide } from "vue";
import ScrollProgress from "./ScrollProgress.vue";
import DocPageAnimations from "./DocPageAnimations.vue";
import NavScrollHide from "./NavScrollHide.vue";

const { isDark } = useData();

const enableTransitions = () => "startViewTransition" in document && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px at ${x}px ${y}px)`];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: "ease-in",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    }
  );
});
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 为较宽的屏幕的导航栏添加阅读增强菜单 -->
    <template #nav-bar-content-after>
      <NolebaseEnhancedReadabilitiesMenu />
    </template>
    <!-- 为较窄的屏幕（通常是小于 iPad Mini）添加阅读增强菜单 -->
    <template #nav-screen-content-after>
      <NolebaseEnhancedReadabilitiesScreenMenu />
    </template>
    <!-- 闪烁高亮当前的目标标题 -->
    <template #layout-top>
      <NolebaseHighlightTargetedHeading />
      <!-- 顶部滚动进度条（全站） -->
      <ScrollProgress />
      <!-- 文章页动效（h1/元信息/图片） -->
      <DocPageAnimations />
      <!-- 导航栏滚动隐藏/显示（仅桌面端） -->
      <NavScrollHide />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* 修正因视图过渡导致的按钮图标偏移 */
.check .icon {
  top: -2px;
}
</style>
