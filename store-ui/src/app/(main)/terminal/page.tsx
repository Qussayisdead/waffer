"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrScanner } from "../../../components/QrScanner";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { InvoiceForm } from "../../../components/InvoiceForm";
import { ResultCard } from "../../../components/ResultCard";
import { useI18n } from "../../../i18n";
import { apiRequest, cachedRequest, invalidateCache } from "../../../lib/api";
import { StoreSidebar } from "../../../components/StoreSidebar";

type ScanData = {
  qrToken: string;
  customerName: string;
  discountPercent: number;
};

type StoreSummary = {
  subtotal: number;
  totalSales: number;
  discountsGiven: number;
  commissionsTotal: number;
  invoiceCount: number;
};

type StoreDailyRow = {
  bucket: string;
  subtotal: number;
  totalSales: number;
  discountsGiven: number;
  commissionsTotal: number;
  invoiceCount: number;
};

type OtpResponse = {
  qr_token: string;
  expires_at: string;
  card_number: string;
};

type RecentInvoice = {
  id: string;
  customerName: string;
  cardNumber: string | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  createdAt: string;
};

type ScanHistoryItem = {
  id: string;
  cardNumber: string;
  customerName: string;
  usedAt: string;
  source: string;
};

type CardSearchResult = {
  id: string;
  cardNumber: string;
  status: string;
  customerName: string;
  phone: string | null;
  email: string | null;
};

const ALLOWED_SECTIONS = [
  "store-summary",
  "store-otp",
  "store-invoices",
  "store-search",
  "store-scans"
];

export default function StoreTerminalPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState("store-summary");
  const [scanData, setScanData] = useState<ScanData>({
    qrToken: "",
    customerName: "",
    discountPercent: 0
  });
  const [amount, setAmount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpData, setOtpData] = useState<OtpResponse | null>(null);
  const [otpQrPng, setOtpQrPng] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [dailyRows, setDailyRows] = useState<StoreDailyRow[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [recentInvoicesLoading, setRecentInvoicesLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState({
    discountAmount: 0,
    finalAmount: 0,
    pointsEarned: 0
  });
  const [profile, setProfile] = useState<{ name: string; storeName: string | null } | null>(
    null
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await cachedRequest<{
          name: string;
          store_name: string | null;
        }>("/api/v1/auth/me");
        setProfile({
          name: response.data.name,
          storeName: response.data.store_name
        });
      } catch (err) {
        setError(t((err as Error).message));
      }
    };
    loadProfile();
  }, [t]);

  useEffect(() => {
    loadSummary();
  }, [t]);

  useEffect(() => {
    const setFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ALLOWED_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      } else if (!hash) {
        setActiveSection("store-summary");
      }
    };
    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    return () => window.removeEventListener("hashchange", setFromHash);
  }, []);

  const handleSectionSelect = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  useEffect(() => {
    if (activeSection === "store-invoices" && recentInvoices.length === 0) {
      loadRecentInvoices();
    }
    if (activeSection === "store-scans" && scanHistory.length === 0) {
      loadScanHistory();
    }
  }, [activeSection]);

  const loadRecentInvoices = async (force = false) => {
    try {
      setRecentInvoicesLoading(true);
      if (force) {
        invalidateCache("/api/v1/store/invoices/recent");
      }
      const response = await cachedRequest<{ invoices: RecentInvoice[] }>(
        "/api/v1/store/invoices/recent"
      );
      setRecentInvoices(response.data.invoices);
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setRecentInvoicesLoading(false);
    }
  };

  const loadScanHistory = async (force = false) => {
    try {
      setScanHistoryLoading(true);
      if (force) {
        invalidateCache("/api/v1/store/scans/recent");
      }
      const response = await cachedRequest<{ scans: ScanHistoryItem[] }>(
        "/api/v1/store/scans/recent"
      );
      setScanHistory(response.data.scans);
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setScanHistoryLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }
    try {
      setSearchError(null);
      setSearchLoading(true);
      setHasSearched(true);
      const response = await apiRequest<{ results: CardSearchResult[] }>(
        `/api/v1/store/cards/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data.results);
    } catch (err) {
      setSearchError(t((err as Error).message));
    } finally {
      setSearchLoading(false);
    }
  };

  const loadSummary = async (force = false) => {
    try {
      setSummaryLoading(true);
      if (force) {
        invalidateCache("/api/v1/store/summary");
        invalidateCache("/api/v1/store/daily");
      }
      const [summaryRes, dailyRes] = await Promise.all([
        cachedRequest<{ summary: StoreSummary }>("/api/v1/store/summary"),
        cachedRequest<{ daily: StoreDailyRow[] }>("/api/v1/store/daily")
      ]);
      setSummary(summaryRes.data.summary);
      setDailyRows(dailyRes.data.daily);
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleScan = async (payload: { qrToken: string }) => {
    try {
      setError(null);
      setShowResult(false);
      setScanData((prev) => ({
        ...prev,
        qrToken: payload.qrToken
      }));
      const response = await apiRequest<{
        customer_name: string;
        customer_discount_percent: number;
      }>("/api/v1/store/cards/lookup", {
        method: "POST",
        body: JSON.stringify({ qr_token: payload.qrToken })
      });
      setScanData({
        qrToken: payload.qrToken,
        customerName: response.data.customer_name,
        discountPercent: response.data.customer_discount_percent
      });
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!scanData.qrToken) {
        setError(t("scan.required"));
        return;
      }
      const response = await apiRequest<{
        applied_discount_percent: number;
        customer_name: string;
        invoice: {
          discount_amount: number | string;
          total: number | string;
          points_earned: number;
        };
        store_name: string | null;
      }>("/api/v1/invoices/scan", {
        method: "POST",
        body: JSON.stringify({
          qr_token: scanData.qrToken,
          subtotal: amount,
          currency: "ILS"
        })
      });
      setResult({
        discountAmount: Number(response.data.invoice.discount_amount),
        finalAmount: Number(response.data.invoice.total),
        pointsEarned: Number(response.data.invoice.points_earned || 0)
      });
      setScanData((prev) => ({
        ...prev,
        customerName: response.data.customer_name,
        discountPercent: response.data.applied_discount_percent
      }));
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              storeName: response.data.store_name || prev.storeName
            }
          : prev
      );
      invalidateCache("/api/v1/store/summary");
      invalidateCache("/api/v1/store/daily");
      invalidateCache("/api/v1/store/invoices/recent");
      invalidateCache("/api/v1/store/scans/recent");
      setShowResult(true);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleGenerateOtp = async () => {
    const identifier = otpIdentifier.trim();
    if (!identifier) {
      setOtpError(t("storeOtp.required"));
      return;
    }
    try {
      setOtpError(null);
      setOtpLoading(true);
      const response = await apiRequest<OtpResponse>("/api/v1/store/cards/otp", {
        method: "POST",
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : undefined,
          phone: identifier.includes("@") ? undefined : identifier
        })
      });
      setOtpData(response.data);
      const png = await QRCode.toDataURL(response.data.qr_token, { width: 220, margin: 1 });
      setOtpQrPng(png);
    } catch (err) {
      setOtpError(t((err as Error).message));
      setOtpQrPng(null);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10">
      <div className="bg-orb -right-32 top-20 h-64 w-64 bg-mint/30" />
      <div className="bg-orb -left-20 top-1/2 h-72 w-72 bg-amber-200/50" />
      <div className="mx-auto flex max-w-7xl gap-8">
        <StoreSidebar
          greeting={profile?.name || ""}
          activeId={activeSection}
          onSelect={handleSectionSelect}
          items={[
            { id: "store-summary", label: t("storeNav.summary") },
            { id: "store-otp", label: t("storeNav.qr") },
            { id: "store-invoices", label: t("storeNav.invoices") },
            { id: "store-search", label: t("storeNav.search") },
            { id: "store-scans", label: t("storeNav.scans") }
          ]}
        />
        <div className="flex-1 space-y-10">
          <header className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/70 px-8 py-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <img className="h-10 w-10 object-contain" src="/logo.png" alt="Logo" />
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-semibold text-ink">{t("app.title")}</h1>
                  <p className="mt-2 text-sm text-night/60">{t("app.subtitle")}</p>
                </div>
              </div>
            <button
              className="rounded-2xl border border-night/20 px-4 py-2 text-sm text-night"
              type="button"
              onClick={async () => {
                try {
                  await apiRequest("/api/v1/auth/logout", { method: "POST" });
                } finally {
                  window.location.href = "/login";
                }
              }}
            >
              {t("auth.logout")}
            </button>
            </div>
            {profile && (
              <div className="mt-2 grid gap-2 text-sm text-night/70 sm:grid-cols-2">
                <div>
                  {t("store.name")}: <span className="font-semibold">{profile.storeName || "-"}</span>
                </div>
                <div>
                  {t("store.cashier")}: <span className="font-semibold">{profile.name}</span>
                </div>
              </div>
            )}
          </header>

          {activeSection === "store-summary" && (
            <section
              className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              id="store-summary"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{t("storeSummary.title")}</h2>
                  <p className="mt-1 text-sm text-night/60">{t("storeSummary.subtitle")}</p>
                </div>
                <Button type="button" variant="ghost" onClick={() => loadSummary(true)} disabled={summaryLoading}>
                  {summaryLoading ? t("storeSummary.loading") : t("storeSummary.refresh")}
                </Button>
              </div>
              {summary ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <div className="text-xs text-night/60">{t("storeSummary.subtotal")}</div>
                    <div className="mt-2 text-lg font-semibold text-night">
                      {summary.subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <div className="text-xs text-night/60">{t("storeSummary.discounts")}</div>
                    <div className="mt-2 text-lg font-semibold text-night">
                      {summary.discountsGiven.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <div className="text-xs text-night/60">{t("storeSummary.sales")}</div>
                    <div className="mt-2 text-lg font-semibold text-night">
                      {summary.totalSales.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <div className="text-xs text-night/60">{t("storeSummary.commissions")}</div>
                    <div className="mt-2 text-lg font-semibold text-night">
                      {summary.commissionsTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <div className="text-xs text-night/60">{t("storeSummary.invoiceCount")}</div>
                    <div className="mt-2 text-lg font-semibold text-night">{summary.invoiceCount}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-night/60">{t("storeSummary.empty")}</div>
              )}
              {dailyRows.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-[720px] text-sm">
                    <thead>
                      <tr className="text-night/60">
                        <th className="pb-2 text-right">{t("storeSummary.day")}</th>
                        <th className="pb-2 text-right">{t("storeSummary.subtotal")}</th>
                        <th className="pb-2 text-right">{t("storeSummary.discounts")}</th>
                        <th className="pb-2 text-right">{t("storeSummary.sales")}</th>
                        <th className="pb-2 text-right">{t("storeSummary.commissions")}</th>
                        <th className="pb-2 text-right">{t("storeSummary.invoiceCount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRows.map((row) => (
                        <tr key={String(row.bucket)} className="border-t border-white/60">
                          <td className="py-2 text-night">
                            {new Date(row.bucket).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="py-2 text-night">{row.subtotal.toFixed(2)}</td>
                          <td className="py-2 text-night">{row.discountsGiven.toFixed(2)}</td>
                          <td className="py-2 text-night">{row.totalSales.toFixed(2)}</td>
                          <td className="py-2 text-night">{row.commissionsTotal.toFixed(2)}</td>
                          <td className="py-2 text-night">{row.invoiceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeSection === "store-otp" && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]" id="store-otp">
              <QrScanner onScan={handleScan} />
              <div className="space-y-6">
                <div
                  className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between text-sm text-night/70">
                    <span>{t("customer.name")}</span>
                    <span className="text-base font-semibold text-night">
                      {scanData.customerName}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-night/70">
                    <span>{t("customer.discount")}</span>
                    <span className="text-base font-semibold text-night">
                      {scanData.discountPercent}%
                    </span>
                  </div>
                  {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                </div>

                <InvoiceForm amount={amount} onAmountChange={setAmount} onSubmit={handleSubmit} />
                <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <h3 className="text-lg font-semibold text-ink">{t("storeOtp.title")}</h3>
                  <p className="mt-2 text-sm text-night/60">{t("storeOtp.subtitle")}</p>
                  <div className="mt-4 grid gap-3">
                    <Field
                      label={t("storeOtp.identifier")}
                      value={otpIdentifier}
                      onChange={(event) => setOtpIdentifier(event.target.value)}
                    />
                    {otpError && <p className="text-sm text-red-600">{otpError}</p>}
                    <Button type="button" onClick={handleGenerateOtp} disabled={otpLoading}>
                      {otpLoading ? t("storeOtp.generating") : t("storeOtp.generate")}
                    </Button>
                  </div>
                  {otpData && (
                    <div className="mt-5 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-night">
                      {otpQrPng && (
                        <img
                          src={otpQrPng}
                          alt="QR"
                          className="mx-auto h-40 w-40 rounded-xl border"
                        />
                      )}
                      <div className="mt-3 space-y-1 text-xs text-night/70">
                        <div>
                          {t("storeOtp.qrToken")}: {otpData.qr_token}
                        </div>
                        <div>
                          {t("storeOtp.expiresAt")}:{" "}
                          {new Date(otpData.expires_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "store-invoices" && (
            <section className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{t("terminal.recentInvoicesTitle")}</h2>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => loadRecentInvoices(true)}
                  disabled={recentInvoicesLoading}
                >
                  {recentInvoicesLoading ? t("storeSummary.loading") : t("storeSummary.refresh")}
                </Button>
              </div>
              {recentInvoices.length === 0 ? (
                <div className="mt-4 text-sm text-night/60">{t("terminal.recentInvoicesEmpty")}</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[760px] text-sm">
                    <thead>
                      <tr className="text-night/60">
                        <th className="pb-2 text-right">{t("terminal.customer")}</th>
                        <th className="pb-2 text-right">{t("terminal.cardNumber")}</th>
                        <th className="pb-2 text-right">{t("terminal.subtotal")}</th>
                        <th className="pb-2 text-right">{t("terminal.discount")}</th>
                        <th className="pb-2 text-right">{t("terminal.total")}</th>
                        <th className="pb-2 text-right">{t("terminal.createdAt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-t border-white/60">
                          <td className="py-2 text-night">{invoice.customerName}</td>
                          <td className="py-2 text-night">{invoice.cardNumber || "-"}</td>
                          <td className="py-2 text-night">
                            {invoice.subtotal.toFixed(2)} {invoice.currency}
                          </td>
                          <td className="py-2 text-night">
                            {invoice.discountAmount.toFixed(2)} {invoice.currency}
                          </td>
                          <td className="py-2 text-night">
                            {invoice.total.toFixed(2)} {invoice.currency}
                          </td>
                          <td className="py-2 text-night">
                            {new Date(invoice.createdAt).toLocaleString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeSection === "store-search" && (
            <section className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-ink">{t("terminal.searchTitle")}</h2>
              <p className="mt-2 text-sm text-night/60">{t("terminal.searchHint")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="min-w-[240px] flex-1">
                  <Field
                    label={t("terminal.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? t("storeSummary.loading") : t("terminal.searchButton")}
                </Button>
              </div>
              {searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}
              {hasSearched && searchResults.length === 0 ? (
                <div className="mt-4 text-sm text-night/60">{t("terminal.searchEmpty")}</div>
              ) : searchResults.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[760px] text-sm">
                    <thead>
                      <tr className="text-night/60">
                        <th className="pb-2 text-right">{t("terminal.customer")}</th>
                        <th className="pb-2 text-right">{t("terminal.cardNumber")}</th>
                        <th className="pb-2 text-right">{t("terminal.status")}</th>
                        <th className="pb-2 text-right">{t("terminal.phone")}</th>
                        <th className="pb-2 text-right">{t("terminal.email")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result) => (
                        <tr key={result.id} className="border-t border-white/60">
                          <td className="py-2 text-night">{result.customerName}</td>
                          <td className="py-2 text-night">{result.cardNumber}</td>
                          <td className="py-2 text-night">{result.status}</td>
                          <td className="py-2 text-night">{result.phone || "-"}</td>
                          <td className="py-2 text-night">{result.email || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          )}

          {activeSection === "store-scans" && (
            <section className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{t("terminal.scanHistoryTitle")}</h2>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => loadScanHistory(true)}
                  disabled={scanHistoryLoading}
                >
                  {scanHistoryLoading ? t("storeSummary.loading") : t("storeSummary.refresh")}
                </Button>
              </div>
              {scanHistory.length === 0 ? (
                <div className="mt-4 text-sm text-night/60">{t("terminal.scanHistoryEmpty")}</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[680px] text-sm">
                    <thead>
                      <tr className="text-night/60">
                        <th className="pb-2 text-right">{t("terminal.customer")}</th>
                        <th className="pb-2 text-right">{t("terminal.cardNumber")}</th>
                        <th className="pb-2 text-right">{t("terminal.usedAt")}</th>
                        <th className="pb-2 text-right">{t("terminal.source")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanHistory.map((scan) => (
                        <tr key={scan.id} className="border-t border-white/60">
                          <td className="py-2 text-night">{scan.customerName}</td>
                          <td className="py-2 text-night">{scan.cardNumber}</td>
                          <td className="py-2 text-night">
                            {new Date(scan.usedAt).toLocaleString("ar-EG")}
                          </td>
                          <td className="py-2 text-night">
                            {scan.source === "store"
                              ? t("terminal.sourceStore")
                              : t("terminal.sourceCustomer")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}


          {showResult && (
            <ResultCard
              customerName={scanData.customerName}
              storeName={profile?.storeName || "-"}
              discountPercent={scanData.discountPercent}
              amount={amount}
              discountAmount={result.discountAmount}
              finalAmount={result.finalAmount}
              pointsEarned={result.pointsEarned}
            />
          )}
        </div>
      </div>
    </div>
  );
}
