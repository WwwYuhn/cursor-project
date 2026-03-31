"use client";

import { t } from "@/lib/i18n";
import type { Locale, TextureAdjustments } from "@/lib/store";

type AdjustPanelProps = {
  locale: Locale;
  textureAdjustments: TextureAdjustments;
  onTextureAdjustmentsChange: (
    patch: Partial<TextureAdjustments>,
    options?: { commitHistory?: boolean },
  ) => void;
  onTextureAdjustmentsCommit: () => void;
  onTextureAdjustmentsReset: () => void;
};

export function AdjustPanel({
  locale,
  textureAdjustments,
  onTextureAdjustmentsChange,
  onTextureAdjustmentsCommit,
  onTextureAdjustmentsReset,
}: AdjustPanelProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(17,22,32,0.82)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.24em] text-white/45 uppercase">
            {t(locale, "imageAdjust")}
          </p>
          <p className="mt-1 text-sm text-white/70">{t(locale, "adjustHint")}</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
          onClick={onTextureAdjustmentsReset}
        >
          {t(locale, "reset")}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-xs leading-5 text-white/55">{t(locale, "longScrollHint")}</p>

        <AdjustmentSlider
          label={t(locale, "rotate")}
          value={textureAdjustments.rotation}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={(value) =>
            onTextureAdjustmentsChange({ rotation: value }, { commitHistory: false })
          }
          onCommit={onTextureAdjustmentsCommit}
        />
        <AdjustmentSlider
          label={t(locale, "zoom")}
          value={textureAdjustments.scale}
          min={0.5}
          max={3}
          step={0.01}
          unit="x"
          onChange={(value) =>
            onTextureAdjustmentsChange({ scale: value }, { commitHistory: false })
          }
          onCommit={onTextureAdjustmentsCommit}
        />
        <AdjustmentSlider
          label={t(locale, "brightness")}
          value={textureAdjustments.brightness}
          min={40}
          max={180}
          step={1}
          unit="%"
          onChange={(value) =>
            onTextureAdjustmentsChange({ brightness: value }, { commitHistory: false })
          }
          onCommit={onTextureAdjustmentsCommit}
        />
        <AdjustmentSlider
          label={t(locale, "contrast")}
          value={textureAdjustments.contrast}
          min={40}
          max={180}
          step={1}
          unit="%"
          onChange={(value) =>
            onTextureAdjustmentsChange({ contrast: value }, { commitHistory: false })
          }
          onCommit={onTextureAdjustmentsCommit}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs leading-5 text-white/58">
        {t(locale, "moveModeHint")}
      </div>
    </section>
  );
}

type AdjustmentSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  onCommit: () => void;
};

function AdjustmentSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onCommit,
}: AdjustmentSliderProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-sm text-white/72">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <input
            className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-right text-sm text-white outline-none transition focus:border-blue-300/40"
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number.isInteger(value) ? value : value.toFixed(2)}
            onChange={(event) => onChange(Number(event.target.value))}
            onBlur={(event) => {
              const nextValue = Number(event.target.value);

              if (Number.isFinite(nextValue)) {
                const clampedValue = Math.min(max, Math.max(min, nextValue));
                onChange(clampedValue);
              }

              onCommit();
            }}
          />
          <span className="font-medium text-white">{unit}</span>
        </div>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-white"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
      />
    </label>
  );
}
