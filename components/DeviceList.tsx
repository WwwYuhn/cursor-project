"use client";

import { Laptop, Smartphone } from "lucide-react";
import { getCategoryLabel, t } from "@/lib/i18n";
import { deviceGroups, type AppleDevice, type DeviceCategory } from "@/lib/devices";
import type { Locale } from "@/lib/store";

type DeviceListProps = {
  currentDeviceId: string;
  locale: Locale;
  onSelect: (deviceId: string) => void;
};

const categoryIcons: Record<DeviceCategory, typeof Smartphone> = {
  iPhone: Smartphone,
  Mac: Laptop,
};

export function DeviceList({ currentDeviceId, locale, onSelect }: DeviceListProps) {
  return (
    <aside className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/10 bg-[rgba(17,22,32,0.82)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.24em] text-white/45 uppercase">
            {t(locale, "deviceLibrary")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {t(locale, "appleHardwarePresets")}
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
          {t(locale, "devicesCount")}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {(Object.keys(deviceGroups) as DeviceCategory[]).map((category) => {
          const Icon = categoryIcons[category];
          const list = deviceGroups[category];

          return (
            <section key={category}>
              <div className="mb-3 flex items-center gap-2 text-white/55">
                <Icon className="h-4 w-4" />
                <h3 className="text-sm font-medium">{getCategoryLabel(locale, category)}</h3>
              </div>

              <div className="space-y-2">
                {list.map((device) => {
                  const isActive = device.id === currentDeviceId;

                  return (
                    <button
                      key={device.id}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-blue-300/45 bg-blue-400/12"
                          : "border-white/8 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.06]"
                      }`}
                      onClick={() => onSelect(device.id)}
                    >
                      <DeviceThumbnail device={device} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {device.name}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {t(locale, "mesh")}: {device.screenMeshName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 rounded-3xl border border-dashed border-white/12 bg-black/20 p-4 text-xs leading-6 text-white/52">
        {t(locale, "realModelHintBefore")}
        <span className="font-medium text-white/72"> public/models </span>
        {t(locale, "realModelHintAfter")}
      </div>
    </aside>
  );
}

function DeviceThumbnail({ device }: { device: AppleDevice }) {
  const variantClasses: Record<AppleDevice["fallbackVariant"], string> = {
    phone: "h-14 w-8 rounded-[14px]",
    tablet: "h-12 w-16 rounded-[16px]",
    laptop: "h-10 w-16 rounded-[12px] before:absolute before:top-full before:left-1/2 before:h-2 before:w-20 before:-translate-x-1/2 before:rounded-full before:bg-white/12",
  };

  return (
    <div className="relative flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/12 to-white/[0.03]">
      <div
        className={`relative border border-white/14 bg-gradient-to-br from-slate-200/80 to-slate-500/30 shadow-[0_10px_28px_rgba(0,0,0,0.35)] ${variantClasses[device.fallbackVariant]}`}
      >
        <div className="absolute inset-[9%] rounded-[inherit] bg-gradient-to-br from-slate-950 to-slate-800" />
      </div>
      <span className="absolute right-2 bottom-2 text-[10px] font-semibold text-white/55">
        {device.thumbnailLabel}&quot;
      </span>
    </div>
  );
}
