"use client";

import { useId, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  Grid2x2,
  Hand,
  ImagePlus,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import type { AppleDevice } from "@/lib/devices";
import { getCategoryLabel, t } from "@/lib/i18n";
import type { FitMode, Locale, PreviewOrientation } from "@/lib/store";

type ToolbarProps = {
  currentDevice: AppleDevice;
  devices: AppleDevice[];
  fitMode: FitMode;
  locale: Locale;
  previewOrientation: PreviewOrientation;
  isMoveMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onImportFile: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExportPng: () => void;
  onDeviceChange: (deviceId: string) => void;
  onFitModeChange: (mode: FitMode) => void;
  onLocaleChange: (locale: Locale) => void;
  onPreviewOrientationChange: (orientation: PreviewOrientation) => void;
  onMoveModeToggle: () => void;
  onEnterGlobalPreview: () => void;
};

const toolbarButtonClass =
  "inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

export function Toolbar({
  currentDevice,
  devices,
  fitMode,
  locale,
  previewOrientation,
  isMoveMode,
  canUndo,
  canRedo,
  onImportFile,
  onUndo,
  onRedo,
  onSave,
  onExportPng,
  onDeviceChange,
  onFitModeChange,
  onLocaleChange,
  onPreviewOrientationChange,
  onMoveModeToggle,
  onEnterGlobalPreview,
}: ToolbarProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    onImportFile(file);
    setIsDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0b0f15] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="space-y-3">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/20 to-white/5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-white to-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-white/60 uppercase">
                {t(locale, "appTitle")}
              </p>
              <p className="text-xs text-white/45">{t(locale, "appSubtitle")}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label
              htmlFor={inputId}
              className={`${toolbarButtonClass} ${
                isDragging ? "border-blue-300/60 bg-blue-400/15 text-blue-100" : ""
              }`}
              onDragEnter={() => setIsDragging(true)}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
              }}
            >
              <ImagePlus className="h-4 w-4" />
              {t(locale, "importImage")}
            </label>
            <input
              ref={fileInputRef}
              id={inputId}
              hidden
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => handleFiles(event.target.files)}
              onClick={(event) => {
                event.currentTarget.value = "";
              }}
            />

            <button
              type="button"
              className={toolbarButtonClass}
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
              {t(locale, "undo")}
            </button>

            <button
              type="button"
              className={toolbarButtonClass}
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
              {t(locale, "redo")}
            </button>

            <button type="button" className={toolbarButtonClass} onClick={onSave}>
              <Save className="h-4 w-4" />
              {t(locale, "save")}
            </button>

            <button type="button" className={toolbarButtonClass} onClick={onExportPng}>
              <Download className="h-4 w-4" />
              {t(locale, "exportPng")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs tracking-[0.24em] text-white/45 uppercase">
              {getCategoryLabel(locale, currentDevice.category)}
            </div>
            <div className="relative">
              <select
                className="h-11 min-w-[220px] appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-11 text-sm font-medium text-white outline-none transition hover:border-white/20 focus:border-blue-300/40"
                value={currentDevice.id}
                onChange={(event) => onDeviceChange(event.target.value)}
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.id} className="bg-slate-950">
                    {device.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-white/55" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["fit", "fill"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    fitMode === mode
                      ? "bg-white text-slate-950"
                      : "text-white/65 hover:text-white"
                  }`}
                  onClick={() => onFitModeChange(mode)}
                >
                  {mode === "fit" ? t(locale, "fit") : t(locale, "fill")}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={toolbarButtonClass}
              aria-label={t(locale, "gridView")}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>

            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["zh", "en"] as const).map((nextLocale) => (
                <button
                  key={nextLocale}
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    locale === nextLocale
                      ? "bg-white text-slate-950"
                      : "text-white/65 hover:text-white"
                  }`}
                  onClick={() => onLocaleChange(nextLocale)}
                >
                  {nextLocale === "zh" ? "中文" : "EN"}
                </button>
              ))}
            </div>

            {currentDevice.category === "iPhone" ? (
              <button
                type="button"
                className={`${toolbarButtonClass} ${
                  previewOrientation === "landscape"
                    ? "border-blue-300/55 bg-blue-400/15 text-blue-100"
                    : ""
                }`}
                onClick={() =>
                  onPreviewOrientationChange(
                    previewOrientation === "portrait" ? "landscape" : "portrait",
                  )
                }
              >
                {previewOrientation === "portrait"
                  ? t(locale, "phoneLandscape")
                  : t(locale, "phonePortrait")}
              </button>
            ) : null}

            <button
              type="button"
              className={`${toolbarButtonClass} ${
                isMoveMode ? "border-blue-300/55 bg-blue-400/15 text-blue-100" : ""
              }`}
              aria-pressed={isMoveMode}
              onClick={onMoveModeToggle}
              title={t(locale, "moveModeHint")}
            >
              <Hand className="h-4 w-4" />
              {t(locale, "moveImage")}
            </button>

            <button type="button" className={toolbarButtonClass} onClick={onEnterGlobalPreview}>
              {t(locale, "globalPreview")}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
