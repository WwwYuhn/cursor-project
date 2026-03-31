"use client";

import type { Locale } from "@/lib/store";

type Messages = {
  appTitle: string;
  appSubtitle: string;
  importImage: string;
  undo: string;
  redo: string;
  save: string;
  exportPng: string;
  fit: string;
  fill: string;
  phoneLandscape: string;
  phonePortrait: string;
  moveImage: string;
  globalPreview: string;
  imageAdjust: string;
  adjustHint: string;
  reset: string;
  rotate: string;
  zoom: string;
  brightness: string;
  contrast: string;
  shadowAdjust: string;
  shadowHint: string;
  shadowHeight: string;
  shadowRotation: string;
  longScrollPreview: string;
  longScrollHint: string;
  moveModeHint: string;
  deviceLibrary: string;
  appleHardwarePresets: string;
  devicesCount: string;
  mesh: string;
  realModelHintBefore: string;
  realModelHintPath: string;
  realModelHintAfter: string;
  preview: string;
  importHint: string;
  loadingDevice: string;
  loadingPreview: string;
  globalInfo: string;
  dropUiImage: string;
  dropUiImageHint: string;
  language: string;
  chinese: string;
  english: string;
  gridView: string;
  workspaceSettings: string;
  imageTypeHint: string;
  categoryIphone: string;
  categoryMac: string;
};

const messages: Record<Locale, Messages> = {
  zh: {
    appTitle: "Apple 3D 预览",
    appSubtitle: "高保真设备预览工作台",
    importImage: "导入图片",
    undo: "撤销",
    redo: "重做",
    save: "保存",
    exportPng: "导出 PNG",
    fit: "适应",
    fill: "填充",
    phoneLandscape: "手机横屏",
    phonePortrait: "手机竖屏",
    moveImage: "移动图片",
    globalPreview: "全局预览",
    imageAdjust: "图片调节",
    adjustHint: "旋转、缩放、亮度、对比度和位置会实时应用到当前设备屏幕。",
    reset: "重置",
    rotate: "旋转",
    zoom: "缩放",
    brightness: "亮度",
    contrast: "对比度",
    shadowAdjust: "阴影调节",
    shadowHint: "调整灯光高度与绕设备中心的角度，实时改变设备落影方向。",
    shadowHeight: "阴影高度",
    shadowRotation: "阴影旋转",
    longScrollPreview: "长图滚动预览",
    longScrollHint: "启用后按键盘上下方向键，可在设备屏幕内预览长图的真实上下滑动效果。",
    moveModeHint: "先点击上方的移动图片，再用左键拖图片。关闭该模式后，左键恢复为旋转模型。",
    deviceLibrary: "设备库",
    appleHardwarePresets: "Apple 设备预设",
    devicesCount: "3 台设备",
    mesh: "网格",
    realModelHintBefore: "当前优先支持真实的 iPhone 和 Mac 设备模型。把同名 GLB 放进",
    realModelHintPath: "public/models",
    realModelHintAfter: "后会自动切换为真实模型。",
    preview: "预览",
    importHint: "导入图片或将 PNG/JPG 拖到这里",
    loadingDevice: "正在加载设备...",
    loadingPreview: "正在准备预览...",
    globalInfo:
      "真实的 iPhone 和 Mac GLB 放在 public/models 中，并会把上传的 UI 贴到当前设备屏幕上。",
    dropUiImage: "拖入 UI 图片",
    dropUiImageHint: "松开鼠标即可把你的界面贴到当前设备上",
    language: "语言",
    chinese: "中文",
    english: "English",
    gridView: "网格视图",
    workspaceSettings: "工作区设置",
    imageTypeHint: "仅支持图片文件",
    categoryIphone: "iPhone",
    categoryMac: "Mac",
  },
  en: {
    appTitle: "Apple 3D Preview",
    appSubtitle: "Premium device mockup workspace",
    importImage: "Import Image",
    undo: "Undo",
    redo: "Redo",
    save: "Save",
    exportPng: "Export PNG",
    fit: "Fit",
    fill: "Fill",
    phoneLandscape: "Phone Landscape",
    phonePortrait: "Phone Portrait",
    moveImage: "Move Image",
    globalPreview: "Global Preview",
    imageAdjust: "Image Adjust",
    adjustHint: "Rotation, scale, brightness, contrast, and position update the active device screen in real time.",
    reset: "Reset",
    rotate: "Rotate",
    zoom: "Zoom",
    brightness: "Brightness",
    contrast: "Contrast",
    shadowAdjust: "Shadow Adjust",
    shadowHint: "Adjust light height and rotate it around the device center to change the shadow direction in real time.",
    shadowHeight: "Shadow Height",
    shadowRotation: "Shadow Rotation",
    longScrollPreview: "Long Scroll Preview",
    longScrollHint: "When enabled, use the keyboard Arrow Up and Arrow Down keys to preview vertical scrolling inside the device screen.",
    moveModeHint: "Click Move Image first, then drag with the left mouse button. Turn it off to restore model rotation.",
    deviceLibrary: "Device Library",
    appleHardwarePresets: "Apple hardware presets",
    devicesCount: "3 devices",
    mesh: "Mesh",
    realModelHintBefore: "Real iPhone and Mac device models are preferred. Drop matching GLB files into",
    realModelHintPath: "public/models",
    realModelHintAfter: "to switch to the real models automatically.",
    preview: "Preview",
    importHint: "Import Image or drag a PNG/JPG here",
    loadingDevice: "Loading device...",
    loadingPreview: "Loading preview...",
    globalInfo:
      "Real iPhone and Mac GLBs live in public/models and receive uploaded UI textures on the active device screen.",
    dropUiImage: "Drop UI Image",
    dropUiImageHint: "Release to map your UI onto the active device",
    language: "Language",
    chinese: "中文",
    english: "English",
    gridView: "Grid view",
    workspaceSettings: "Workspace settings",
    imageTypeHint: "Image files only",
    categoryIphone: "iPhone",
    categoryMac: "Mac",
  },
};

export const t = (locale: Locale, key: keyof Messages) => messages[locale][key];

export const getCategoryLabel = (locale: Locale, category: "iPhone" | "Mac") =>
  category === "iPhone" ? t(locale, "categoryIphone") : t(locale, "categoryMac");
