"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { useI18n } from "../i18n";
import { getCsrfToken } from "../lib/api";

type ScanPayload = {
  qrToken: string;
  raw: string;
};

type QrScannerProps = {
  onScan: (payload: ScanPayload) => void;
};

type BarcodeDetectorType = new (args: { formats: string[] }) => {
  detect: (source: HTMLVideoElement | ImageBitmap) => Promise<{ rawValue: string }[]>;
};

type BarcodeDetectorGlobal = Window & typeof globalThis & {
  BarcodeDetector?: BarcodeDetectorType;
};

function parsePayload(raw: string): ScanPayload | null {
  if (raw.length > 3) {
    return {
      qrToken: raw,
      raw
    };
  }
  return null;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const zxingRef = useRef<null | { reset: () => void }>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  const [usbValue, setUsbValue] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const supportsDetector =
    typeof window !== "undefined" && "BarcodeDetector" in (window as BarcodeDetectorGlobal);
  const supportsImageUpload = supportsDetector && typeof window.createImageBitmap === "function";

  const stopScan = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (zxingRef.current) {
      zxingRef.current.reset();
      zxingRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const startZxingScan = async () => {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const { BarcodeFormat, DecodeHintType } = await import("@zxing/library");
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128
    ]);
    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 700 });
    zxingRef.current = reader;
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
      if (!result) return;
      const raw = result.getText();
      setLastRaw(raw);
      const payload = parsePayload(raw);
      if (payload) {
        onScan(payload);
        controls.stop();
        stopScan();
      } else {
        setError(t("scan.invalid"));
      }
    });
  };

  const startScan = async () => {
    try {
      setError(null);
      if (supportsDetector) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const Detector = (window as BarcodeDetectorGlobal).BarcodeDetector;
        if (!Detector) {
          setError(t("scan.notSupported"));
          return;
        }
        const detector = new Detector({ formats: ["qr_code", "code_128"] });
        intervalRef.current = window.setInterval(async () => {
          if (!videoRef.current) return;
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const raw = codes[0].rawValue;
            setLastRaw(raw);
            const payload = parsePayload(raw);
            if (payload) {
              onScan(payload);
              stopScan();
            } else {
              setError(t("scan.invalid"));
            }
          }
        }, 700);
        setIsActive(true);
        return;
      }

      await startZxingScan();
      setIsActive(true);
    } catch {
      setError(t("errors.camera"));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      if (supportsImageUpload) {
        const bitmap = await createImageBitmap(file);
        const Detector = (window as BarcodeDetectorGlobal).BarcodeDetector;
        if (!Detector) {
          setError(t("scan.notSupported"));
          return;
        }
        const detector = new Detector({ formats: ["qr_code", "code_128"] });
        const codes = await detector.detect(bitmap);
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          setLastRaw(raw);
          const payload = parsePayload(raw);
          if (payload) {
            onScan(payload);
            return;
          }
        }
      } else {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const url = URL.createObjectURL(file);
        try {
          const result = await reader.decodeFromImageUrl(url);
          const raw = result.getText();
          setLastRaw(raw);
          const payload = parsePayload(raw);
          if (payload) {
            onScan(payload);
            return;
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${apiBase}/api/v1/store/qr/decode`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCsrfToken() || ""
        },
        body: formData
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message || "errors.generic";
        setError(t(message));
        return;
      }
      const decoded = await response.json();
      const raw = decoded?.data?.qr_token;
      if (!raw) {
        setError(t("scan.invalid"));
        return;
      }
      setLastRaw(raw);
      const payload = parsePayload(raw);
      if (payload) {
        onScan(payload);
      } else {
        setError(t("scan.invalid"));
      }
    } catch {
      setError(t("scan.invalid"));
    }
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/15 text-mint">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3h4M7 3v4M17 3h-4M17 3v4M7 21h4M7 21v-4M17 21h-4M17 21v-4" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-ink">{t("scan.title")}</h2>
        </div>
        <div className="flex gap-3">
          {!isActive ? (
            <Button type="button" onClick={startScan}>
              {t("scan.start")}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={stopScan}>
              {t("scan.stop")}
            </Button>
          )}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-night/10 bg-black/5">
        <video ref={videoRef} className="h-60 w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-mint/30" />
      </div>
      <p className="mt-4 text-sm text-night/60">{t("scan.ready")}</p>
      <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4">
        <div className="text-sm font-semibold text-ink">{t("scan.usbTitle")}</div>
        <p className="mt-1 text-xs text-night/60">{t("scan.usbHint")}</p>
        <input
          className="mt-3 w-full rounded-xl border border-night/10 bg-white/90 px-4 py-3 text-sm text-night outline-none focus:border-mint"
          placeholder={t("scan.usbPlaceholder")}
          value={usbValue}
          onChange={(event) => setUsbValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const raw = usbValue.trim();
              if (!raw) return;
              setLastRaw(raw);
              const payload = parsePayload(raw);
              if (payload) {
                onScan(payload);
                setUsbValue("");
              } else {
                setError(t("scan.invalid"));
              }
            }
          }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label className="rounded-xl border border-night/20 bg-white/70 px-4 py-2 text-sm text-night">
          {t("scan.upload")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        <span className="text-xs text-night/50">{t("scan.uploadHint")}</span>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {lastRaw && (
        <p className="mt-3 text-xs text-night/50">
          {t("scan.last")}: {lastRaw}
        </p>
      )}
    </div>
  );
}
