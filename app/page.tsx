"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdjustPanel } from "@/components/AdjustPanel";
import { Scene } from "@/components/Scene";
import { Toolbar } from "@/components/Toolbar";
import { devices, getDeviceById } from "@/lib/devices";
import { t } from "@/lib/i18n";
import { usePreviewStore } from "@/lib/store";

export default function HomePage() {
  const locale = usePreviewStore((state) => state.locale);
  const currentDeviceId = usePreviewStore((state) => state.currentDevice);
  const currentTextureUrl = usePreviewStore((state) => state.currentTextureUrl);
  const importedFileName = usePreviewStore((state) => state.importedFileName);
  const fitMode = usePreviewStore((state) => state.fitMode);
  const previewOrientation = usePreviewStore((state) => state.previewOrientation);
  const textureAdjustments = usePreviewStore((state) => state.textureAdjustments);
  const history = usePreviewStore((state) => state.history);
  const historyIndex = usePreviewStore((state) => state.historyIndex);
  const setCurrentDevice = usePreviewStore((state) => state.setCurrentDevice);
  const setCurrentTextureUrl = usePreviewStore((state) => state.setCurrentTextureUrl);
  const setFitMode = usePreviewStore((state) => state.setFitMode);
  const setLocale = usePreviewStore((state) => state.setLocale);
  const setPreviewOrientation = usePreviewStore((state) => state.setPreviewOrientation);
  const setTextureAdjustments = usePreviewStore((state) => state.setTextureAdjustments);
  const commitTextureAdjustments = usePreviewStore((state) => state.commitTextureAdjustments);
  const resetTextureAdjustments = usePreviewStore((state) => state.resetTextureAdjustments);
  const undo = usePreviewStore((state) => state.undo);
  const redo = usePreviewStore((state) => state.redo);

  const currentDevice = useMemo(
    () => getDeviceById(currentDeviceId),
    [currentDeviceId],
  );
  const objectUrlsRef = useRef<string[]>([]);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [exportHandler, setExportHandler] = useState<(() => void) | null>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [fitToken, setFitToken] = useState(0);
  const [isGlobalPreview, setIsGlobalPreview] = useState(false);

  const handleExportReady = (handler: (() => void) | null) => {
    setExportHandler(() => handler);
  };

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!currentTextureUrl && isMoveMode) {
      setIsMoveMode(false);
    }
  }, [currentTextureUrl, isMoveMode]);

  const importImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objectUrl);
    setCurrentTextureUrl(objectUrl, file.name, { resetAdjustments: true });
  };

  const handleSave = () => {
    const session = {
      currentDevice: currentDeviceId,
      currentTextureUrl,
      importedFileName,
      previewOrientation,
      fitMode,
      textureAdjustments,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "apple-3d-preview-session.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      onDragEnter={() => setIsPageDragging(true)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsPageDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) {
          setIsPageDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsPageDragging(false);
        const file = event.dataTransfer.files?.[0];

        if (file) {
          importImage(file);
        }
      }}
    >
      {!isGlobalPreview ? (
        <Toolbar
          currentDevice={currentDevice}
          devices={devices}
          fitMode={fitMode}
          locale={locale}
          previewOrientation={previewOrientation}
          isMoveMode={isMoveMode}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onImportFile={importImage}
          onUndo={undo}
          onRedo={redo}
          onSave={handleSave}
          onExportPng={() => exportHandler?.()}
          onDeviceChange={setCurrentDevice}
          onFitModeChange={setFitMode}
          onLocaleChange={setLocale}
          onPreviewOrientationChange={setPreviewOrientation}
          onMoveModeToggle={() => setIsMoveMode((value) => !value)}
          onEnterGlobalPreview={() => {
            setFitToken((value) => value + 1);
            setIsGlobalPreview(true);
          }}
        />
      ) : null}

      {!isGlobalPreview ? (
        <div className="fixed top-36 right-4 bottom-4 z-20 w-[300px] overflow-y-auto pr-1">
          <AdjustPanel
            locale={locale}
            textureAdjustments={textureAdjustments}
            onTextureAdjustmentsChange={setTextureAdjustments}
            onTextureAdjustmentsCommit={commitTextureAdjustments}
            onTextureAdjustmentsReset={resetTextureAdjustments}
          />
        </div>
      ) : null}

      <main
        className={`h-screen ${isGlobalPreview ? "p-0" : "pr-[320px] pt-36 pb-4 pl-4"}`}
      >
        <section className="relative h-full">
          <Scene
            onExportReady={handleExportReady}
            isMoveMode={isMoveMode}
            importedFileName={importedFileName}
            fitToken={fitToken}
            isGlobalPreview={isGlobalPreview}
            locale={locale}
            onExitGlobalPreview={() => {
              setIsGlobalPreview(false);
              setFitToken((value) => value + 1);
            }}
          />
        </section>
      </main>

      {isPageDragging ? (
        <div className="pointer-events-none fixed inset-6 z-40 rounded-[40px] border border-dashed border-blue-300/70 bg-blue-400/10 backdrop-blur-sm">
          <div className="flex h-full items-center justify-center">
            <div className="rounded-[28px] border border-blue-200/40 bg-slate-950/70 px-8 py-6 text-center text-white shadow-2xl">
              <p className="text-xs tracking-[0.24em] text-blue-100/70 uppercase">
                {t(locale, "dropUiImage")}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {t(locale, "dropUiImageHint")}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
