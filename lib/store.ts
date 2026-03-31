"use client";

import { create } from "zustand";

export type FitMode = "fit" | "fill";
export type Locale = "zh" | "en";
export type PreviewOrientation = "portrait" | "landscape";
export type TextureAdjustments = {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
};

export type ShadowAdjustments = {
  height: number;
  rotation: number;
};

export const DEFAULT_TEXTURE_ADJUSTMENTS: TextureAdjustments = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  brightness: 75,
  contrast: 100,
};

export const DEFAULT_SHADOW_ADJUSTMENTS: ShadowAdjustments = {
  height: 10,
  rotation: 45,
};

export type HistorySnapshot = {
  currentDevice: string;
  currentTextureUrl: string | null;
  fitMode: FitMode;
  importedFileName: string | null;
  previewOrientation: PreviewOrientation;
  scrollPreviewEnabled: boolean;
  scrollProgress: number;
  textureAdjustments: TextureAdjustments;
  shadowAdjustments: ShadowAdjustments;
};

type PreviewStore = {
  locale: Locale;
  currentDevice: string;
  currentTextureUrl: string | null;
  fitMode: FitMode;
  importedFileName: string | null;
  previewOrientation: PreviewOrientation;
  scrollPreviewEnabled: boolean;
  scrollProgress: number;
  textureAdjustments: TextureAdjustments;
  shadowAdjustments: ShadowAdjustments;
  history: HistorySnapshot[];
  historyIndex: number;
  deviceRenderKey: number;
  setLocale: (locale: Locale) => void;
  setCurrentDevice: (deviceId: string) => void;
  setCurrentTextureUrl: (
    textureUrl: string | null,
    fileName?: string | null,
    options?: { resetAdjustments?: boolean },
  ) => void;
  setFitMode: (mode: FitMode) => void;
  setPreviewOrientation: (orientation: PreviewOrientation) => void;
  setScrollPreviewEnabled: (
    enabled: boolean,
    options?: { commitHistory?: boolean },
  ) => void;
  setScrollProgress: (progress: number, options?: { commitHistory?: boolean }) => void;
  commitScrollPreview: () => void;
  setTextureAdjustments: (
    patch: Partial<TextureAdjustments>,
    options?: { commitHistory?: boolean },
  ) => void;
  commitTextureAdjustments: () => void;
  resetTextureAdjustments: (options?: { commitHistory?: boolean }) => void;
  setShadowAdjustments: (
    patch: Partial<ShadowAdjustments>,
    options?: { commitHistory?: boolean },
  ) => void;
  commitShadowAdjustments: () => void;
  resetShadowAdjustments: (options?: { commitHistory?: boolean }) => void;
  undo: () => void;
  redo: () => void;
};

const createSnapshot = (
  currentDevice: string,
  currentTextureUrl: string | null,
  fitMode: FitMode,
  importedFileName: string | null,
  previewOrientation: PreviewOrientation,
  scrollPreviewEnabled: boolean,
  scrollProgress: number,
  textureAdjustments: TextureAdjustments,
  shadowAdjustments: ShadowAdjustments,
): HistorySnapshot => ({
  currentDevice,
  currentTextureUrl,
  fitMode,
  importedFileName,
  previewOrientation,
  scrollPreviewEnabled,
  scrollProgress,
  textureAdjustments: { ...textureAdjustments },
  shadowAdjustments: { ...shadowAdjustments },
});

const initialSnapshot = createSnapshot(
  "iphone-16-pro",
  null,
  "fill",
  null,
  "portrait",
  false,
  0,
  DEFAULT_TEXTURE_ADJUSTMENTS,
  DEFAULT_SHADOW_ADJUSTMENTS,
);

const areAdjustmentsEqual = (a: TextureAdjustments, b: TextureAdjustments) =>
  a.offsetX === b.offsetX &&
  a.offsetY === b.offsetY &&
  a.scale === b.scale &&
  a.rotation === b.rotation &&
  a.brightness === b.brightness &&
  a.contrast === b.contrast;

const areShadowAdjustmentsEqual = (a: ShadowAdjustments, b: ShadowAdjustments) =>
  a.height === b.height && a.rotation === b.rotation;

const isSnapshotEqual = (a: HistorySnapshot, b: HistorySnapshot) =>
  a.currentDevice === b.currentDevice &&
  a.currentTextureUrl === b.currentTextureUrl &&
  a.fitMode === b.fitMode &&
  a.importedFileName === b.importedFileName &&
  a.previewOrientation === b.previewOrientation &&
  a.scrollPreviewEnabled === b.scrollPreviewEnabled &&
  a.scrollProgress === b.scrollProgress &&
  areAdjustmentsEqual(a.textureAdjustments, b.textureAdjustments) &&
  areShadowAdjustmentsEqual(a.shadowAdjustments, b.shadowAdjustments);

const applySnapshot = (snapshot: HistorySnapshot): Omit<PreviewStore, "locale" | "history" | "historyIndex" | "deviceRenderKey" | "setLocale" | "setCurrentDevice" | "setCurrentTextureUrl" | "setFitMode" | "setPreviewOrientation" | "setScrollPreviewEnabled" | "setScrollProgress" | "commitScrollPreview" | "setTextureAdjustments" | "commitTextureAdjustments" | "resetTextureAdjustments" | "setShadowAdjustments" | "commitShadowAdjustments" | "resetShadowAdjustments" | "undo" | "redo"> => ({
  currentDevice: snapshot.currentDevice,
  currentTextureUrl: snapshot.currentTextureUrl,
  fitMode: snapshot.fitMode,
  importedFileName: snapshot.importedFileName,
  previewOrientation: snapshot.previewOrientation,
  scrollPreviewEnabled: snapshot.scrollPreviewEnabled,
  scrollProgress: snapshot.scrollProgress,
  textureAdjustments: { ...snapshot.textureAdjustments },
  shadowAdjustments: { ...snapshot.shadowAdjustments },
});

const commitSnapshot = (
  state: PreviewStore,
  nextSnapshot: HistorySnapshot,
): Partial<PreviewStore> => {
  const currentSnapshot = state.history[state.historyIndex];

  if (currentSnapshot && isSnapshotEqual(currentSnapshot, nextSnapshot)) {
    return {};
  }

  const trimmedHistory = state.history.slice(0, state.historyIndex + 1);
  const history = [...trimmedHistory, nextSnapshot];

  return {
    ...applySnapshot(nextSnapshot),
    history,
    historyIndex: history.length - 1,
  };
};

export const usePreviewStore = create<PreviewStore>((set, get) => ({
  locale: "zh",
  ...applySnapshot(initialSnapshot),
  history: [initialSnapshot],
  historyIndex: 0,
  deviceRenderKey: 0,
  setLocale: (locale) => set({ locale }),
  setCurrentDevice: (deviceId) => {
    const state = get();
    const nextSnapshot = createSnapshot(
      deviceId,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set({
      ...commitSnapshot(state, nextSnapshot),
      deviceRenderKey: state.deviceRenderKey + 1,
    });
  },
  setCurrentTextureUrl: (textureUrl, fileName = null, options) => {
    const state = get();
    const nextAdjustments =
      options?.resetAdjustments === false
        ? state.textureAdjustments
        : DEFAULT_TEXTURE_ADJUSTMENTS;
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      textureUrl,
      state.fitMode,
      fileName,
      state.previewOrientation,
      false,
      0,
      nextAdjustments,
      state.shadowAdjustments,
    );

    set({
      ...commitSnapshot(state, nextSnapshot),
      deviceRenderKey: state.deviceRenderKey + 1,
    });
  },
  setFitMode: (mode) => {
    const state = get();
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      mode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  setPreviewOrientation: (orientation) => {
    const state = get();
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      orientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set({
      ...commitSnapshot(state, nextSnapshot),
      deviceRenderKey: state.deviceRenderKey + 1,
    });
  },
  setScrollPreviewEnabled: (enabled, options) => {
    const state = get();
    const nextScrollProgress = enabled ? state.scrollProgress : 0;

    if (options?.commitHistory === false) {
      set({
        scrollPreviewEnabled: enabled,
        scrollProgress: nextScrollProgress,
      });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      enabled,
      nextScrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  setScrollProgress: (progress, options) => {
    const state = get();
    const clampedProgress = Math.min(1, Math.max(0, progress));

    if (options?.commitHistory === false) {
      set({ scrollProgress: clampedProgress });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      clampedProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  commitScrollPreview: () => {
    const state = get();
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  setTextureAdjustments: (patch, options) => {
    const state = get();
    const textureAdjustments = {
      ...state.textureAdjustments,
      ...patch,
    };

    if (options?.commitHistory === false) {
      set({ textureAdjustments });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  commitTextureAdjustments: () => {
    const state = get();
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  resetTextureAdjustments: (options) => {
    const state = get();
    const textureAdjustments = { ...DEFAULT_TEXTURE_ADJUSTMENTS };

    if (options?.commitHistory === false) {
      set({ textureAdjustments });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  setShadowAdjustments: (patch, options) => {
    const state = get();
    const shadowAdjustments = {
      ...state.shadowAdjustments,
      ...patch,
    };

    if (options?.commitHistory === false) {
      set({ shadowAdjustments });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  commitShadowAdjustments: () => {
    const state = get();
    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      state.shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  resetShadowAdjustments: (options) => {
    const state = get();
    const shadowAdjustments = { ...DEFAULT_SHADOW_ADJUSTMENTS };

    if (options?.commitHistory === false) {
      set({ shadowAdjustments });
      return;
    }

    const nextSnapshot = createSnapshot(
      state.currentDevice,
      state.currentTextureUrl,
      state.fitMode,
      state.importedFileName,
      state.previewOrientation,
      state.scrollPreviewEnabled,
      state.scrollProgress,
      state.textureAdjustments,
      shadowAdjustments,
    );

    set(commitSnapshot(state, nextSnapshot));
  },
  undo: () => {
    const state = get();

    if (state.historyIndex === 0) {
      return;
    }

    const previousSnapshot = state.history[state.historyIndex - 1];
    set({
      ...applySnapshot(previousSnapshot),
      history: state.history,
      historyIndex: state.historyIndex - 1,
      deviceRenderKey: state.deviceRenderKey + 1,
    });
  },
  redo: () => {
    const state = get();

    if (state.historyIndex >= state.history.length - 1) {
      return;
    }

    const nextSnapshot = state.history[state.historyIndex + 1];
    set({
      ...applySnapshot(nextSnapshot),
      history: state.history,
      historyIndex: state.historyIndex + 1,
      deviceRenderKey: state.deviceRenderKey + 1,
    });
  },
}));
