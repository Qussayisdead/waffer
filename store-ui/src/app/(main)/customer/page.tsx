"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useI18n } from "../../../i18n";
import { apiRequest, cachedRequest, clearAccessToken, invalidateCache } from "../../../lib/api";
import { Button } from "../../../components/Button";

type Store = {
  id: string;
  name_ar: string;
  name_en?: string | null;
};

type CardResponse = {
  id: string;
  card_number: string;
  qr_token: string;
  qr_svg: string | null;
};

type OtpResponse = {
  qr_token: string;
  expires_at: string;
  qr_svg: string | null;
};

type PointsBalance = {
  points_balance: number;
};

type PointsTransaction = {
  id: string;
  type: string;
  points: number;
  created_at: string;
};

type RewardItem = {
  id: string;
  name: string;
  points_cost: number;
  value_amount: number;
  currency: string;
  store_name: string | null;
  type: string;
};

type VoucherItem = {
  id: string;
  code: string;
  reward_name: string;
  value_amount: number;
  currency: string;
  expires_at: string;
  used_at: string | null;
};

export default function CustomerDashboardPage() {
  const { t } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [card, setCard] = useState<CardResponse | null>(null);
  const [otp, setOtp] = useState<OtpResponse | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [rewardStoreFilter, setRewardStoreFilter] = useState("all");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const toSvgDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const refreshPoints = async (force = false) => {
    try {
      setError(null);
      if (force) {
        invalidateCache("/api/v1/customer/points");
        invalidateCache("/api/v1/customer/points/history");
        invalidateCache("/api/v1/customer/rewards");
        invalidateCache("/api/v1/customer/vouchers");
      }
      const [balance, history, rewardsList, vouchersList] = await Promise.all([
        cachedRequest<PointsBalance>("/api/v1/customer/points"),
        cachedRequest<PointsTransaction[]>("/api/v1/customer/points/history"),
        cachedRequest<RewardItem[]>("/api/v1/customer/rewards"),
        cachedRequest<VoucherItem[]>("/api/v1/customer/vouchers")
      ]);
      setPointsBalance(balance.data.points_balance);
      setPointsHistory(history.data);
      setRewards(rewardsList.data);
      setVouchers(vouchersList.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await cachedRequest<Store[]>("/api/v1/customer/stores");
        setStores(response.data);
      } catch (err) {
        setError(t((err as Error).message));
      }
    };
    const loadCustomer = async () => {
      try {
        const response = await apiRequest<{ name: string }>("/api/v1/auth/customer/me");
        setCustomerName(response.data.name);
      } catch {
        setCustomerName("");
      }
    };
    loadStores();
    loadCustomer();
    refreshPoints();
  }, [t]);

  useEffect(() => {
    if (!otp?.qr_token || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, otp.qr_token, {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 80,
        margin: 8,
        width: 2
      });
    } catch {
      // Ignore barcode render failures.
    }
  }, [otp?.qr_token]);

  const generateOtp = async (cardId: string) => {
    try {
      setError(null);
      setIsOtpLoading(true);
      const response = await apiRequest<OtpResponse>(`/api/v1/customer/cards/${cardId}/otp`, {
        method: "POST"
      });
      setOtp(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeemMessage(null);
      setRedeemLoading(true);
      const response = await apiRequest<PointsBalance>("/api/v1/customer/rewards/redeem", {
        method: "POST",
        body: JSON.stringify({ reward_id: rewardId })
      });
      invalidateCache("/api/v1/customer/points");
      invalidateCache("/api/v1/customer/points/history");
      invalidateCache("/api/v1/customer/rewards");
      invalidateCache("/api/v1/customer/vouchers");
      setPointsBalance(response.data.points_balance);
      setRedeemMessage(t("points.redeemSuccess"));
      const history = await apiRequest<PointsTransaction[]>("/api/v1/customer/points/history");
      setPointsHistory(history.data);
      const voucherResponse = await apiRequest<VoucherItem[]>("/api/v1/customer/vouchers");
      setVouchers(voucherResponse.data);
    } catch (err) {
      setRedeemMessage(t((err as Error).message));
    } finally {
      setRedeemLoading(false);
    }
  };

  const issueCard = async () => {
    if (!selectedStore) return;
    try {
      setError(null);
      const response = await apiRequest<CardResponse>("/api/v1/customer/cards", {
        method: "POST",
        body: JSON.stringify({ store_id: selectedStore })
      });
      setCard(response.data);
      setOtp(null);
      await generateOtp(response.data.id);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-50/40 px-6 py-10">
      <div className="bg-orb -left-24 top-10 h-72 w-72 bg-emerald-200/40" />
      <div className="bg-orb -right-20 top-1/3 h-80 w-80 bg-emerald-100/60" />
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200/70 bg-emerald-100/80 px-8 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 shadow-sm">
              <img className="h-10 w-10 object-contain" src="/logo.png" alt="Logo" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">{t("customerDashboard.title")}</h1>
              <p className="mt-1 text-sm text-night/60">{t("customerDashboard.subtitle")}</p>
              <div className="mt-2 text-sm text-night/70">
                {t("common.hello")} {customerName || t("common.user")}
              </div>
            </div>
          </div>
          <button
            className="rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-2 text-sm text-emerald-700 hover:border-emerald-300"
            type="button"
            onClick={async () => {
              try {
                await apiRequest("/api/v1/auth/logout", { method: "POST" });
              } finally {
                clearAccessToken();
                window.location.href = "/customer/login";
              }
            }}
          >
            {t("auth.logout")}
          </button>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -right-10 bottom-6 h-28 w-28 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-emerald-300/70 bg-emerald-100/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{t("points.title")}</h2>
                  <p className="mt-1 text-sm text-night/60">{t("points.subtitle")}</p>
                </div>
                <Button type="button" variant="ghost" className="border-emerald-200 text-emerald-700 hover:border-emerald-300" onClick={() => refreshPoints(true)}>
                  {t("points.refresh")}
                </Button>
                <div className="text-3xl font-semibold text-emerald-800">{pointsBalance}</div>
              </div>
              <div className="mt-4 text-xs text-night/60">{t("points.rate")}</div>
            </div>
            <div className="rounded-2xl border border-emerald-300/70 bg-emerald-100/80 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t("points.rewardsTitle")}</h3>
                  <p className="mt-1 text-xs text-night/60">{t("points.rewardsHint")}</p>
                </div>
                <label className="text-xs text-night/70">
                  <span className="sr-only">{t("points.filterLabel")}</span>
                  <select
                    className="rounded-xl border border-emerald-200/70 bg-white px-3 py-2 text-xs text-night"
                    value={rewardStoreFilter}
                    onChange={(event) => setRewardStoreFilter(event.target.value)}
                  >
                    <option value="all">{t("points.filterAll")}</option>
                    {Array.from(
                      new Map(rewards.map((reward) => [reward.store_name || t("points.unknownStore"), reward.store_name || t("points.unknownStore")]))
                    ).map(([storeName]) => (
                      <option key={storeName} value={storeName}>
                        {storeName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {rewards.length === 0 ? (
                <div className="mt-3 text-xs text-night/60">{t("points.rewardsEmpty")}</div>
              ) : (
                <div className="mt-4 space-y-4">
                  {Array.from(
                    rewards.reduce((acc, reward) => {
                      const key = reward.store_name || t("points.unknownStore");
                      const list = acc.get(key) || [];
                      list.push(reward);
                      acc.set(key, list);
                      return acc;
                    }, new Map<string, RewardItem[]>())
                  )
                    .filter(([storeName]) => rewardStoreFilter === "all" || storeName === rewardStoreFilter)
                    .map(([storeName, items]) => (
                      <div key={storeName} className="space-y-3">
                        <div className="text-xs font-semibold text-night/70">{storeName}</div>
                        {items.map((reward) => (
                          <div key={reward.id} className="rounded-xl border border-emerald-300/70 bg-emerald-100/70 p-4 text-xs">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-sm font-semibold text-night">{reward.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-semibold text-emerald-800">
                                  {reward.value_amount} {reward.currency}
                                </div>
                                <div className="text-night/50">
                                  {reward.points_cost} {t("points.pointsLabel")}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button
                                type="button"
                                className="bg-emerald-700 text-white hover:bg-emerald-800"
                                onClick={() => handleRedeem(reward.id)}
                                disabled={redeemLoading || pointsBalance < reward.points_cost}
                              >
                                {redeemLoading ? t("points.redeemLoading") : t("points.redeemCta")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
              {redeemMessage && (
                <p className="mt-3 text-xs text-night/70">{redeemMessage}</p>
              )}
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-300/70 bg-emerald-100/80 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{t("points.historyTitle")}</h3>
              <span className="text-xs text-night/50">{t("points.historyNote")}</span>
            </div>
            {pointsHistory.length === 0 ? (
              <div className="mt-3 text-xs text-night/60">{t("points.historyEmpty")}</div>
            ) : (
              <div className="mt-4 space-y-3">
                {pointsHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-emerald-300/70 bg-emerald-100/70 px-4 py-3 text-xs">
                    <div>
                      <div className="font-semibold text-night">
                        {item.type === "earn" ? t("points.historyEarn") : t("points.historyRedeem")}
                      </div>
                      <div className="text-night/60">{new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-base font-semibold text-emerald-800">
                      {item.type === "earn" ? "+" : "-"}{item.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-300/70 bg-emerald-100/80 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{t("points.vouchersTitle")}</h3>
              <span className="text-xs text-night/50">{t("points.vouchersNote")}</span>
            </div>
            {vouchers.length === 0 ? (
              <div className="mt-3 text-xs text-night/60">{t("points.vouchersEmpty")}</div>
            ) : (
              <div className="mt-4 space-y-3">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/70 bg-emerald-100/70 px-4 py-3 text-xs">
                    <div>
                      <div className="font-semibold text-night">{voucher.reward_name}</div>
                      <div className="text-night/50">{voucher.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-emerald-800">
                        {voucher.value_amount} {voucher.currency}
                      </div>
                      <div className="text-night/50">
                        {t("points.voucherExpires")}: {new Date(voucher.expires_at).toLocaleDateString()}
                      </div>
                      <div className="text-night/50">
                        {t("points.voucherRemaining")}: {Math.max(0, Math.ceil((new Date(voucher.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {t("points.days")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="glass rounded-3xl border border-emerald-300/70 bg-emerald-100/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold text-ink">{t("customerDashboard.issueTitle")}</h2>
          <p className="mt-2 text-sm text-night/60">{t("customerDashboard.issueSubtitle")}</p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <select
              className="min-w-[240px] rounded-2xl border border-emerald-300/70 bg-emerald-50/80 px-4 py-3 text-sm text-night"
              value={selectedStore}
              onChange={(event) => setSelectedStore(event.target.value)}
            >
              <option value="">{t("customerDashboard.selectStore")}</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name_ar || store.name_en}
                </option>
              ))}
            </select>
            <Button type="button" className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={issueCard}>
              {t("customerDashboard.issueButton")}
            </Button>
          </div>
        </section>

        {card && (
          <section className="glass rounded-3xl border border-emerald-100/70 bg-white/90 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-ink">{t("customerDashboard.cardTitle")}</h3>
            <p className="mt-2 text-sm text-night/60">{t("customerDashboard.cardSubtitle")}</p>
            {otp?.qr_token ? (
              <div className="mt-6 rounded-2xl border border-emerald-400/70 bg-emerald-100/80 px-4 py-6 text-sm text-night/60">
                <span>{t("customerOtp.qrToken")}: {otp.qr_token}</span>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-400/70 bg-emerald-100/80 px-4 py-6 text-sm text-night/60">
                <span>{t("customerOtp.notReady")}</span>
              </div>
            )}
            {otp?.qr_token && (
              <div className="mx-auto mt-4 w-72 rounded-2xl border border-emerald-300/70 bg-white/80 p-4">
                <div className="mb-2 text-xs text-night/60">{t("customerOtp.barcodeLabel")}</div>
                <svg ref={barcodeRef} className="h-16 w-full" />
              </div>
            )}
            {otp?.qr_svg && (
              <div className="mx-auto mt-4 w-48 rounded-2xl border border-emerald-300/70 bg-white/80 p-4">
                <div className="mb-2 text-xs text-night/60">{t("customerOtp.qrLabel")}</div>
                <img src={toSvgDataUrl(otp.qr_svg)} alt="QR" className="mx-auto h-32 w-32" />
              </div>
            )}
            <div className="mt-4 text-sm text-night">
              <div>{t("customerDashboard.cardNumber")}: {card.card_number}</div>
              {otp?.qr_token && (
                <div className="mt-1 break-all">
                  {t("customerOtp.qrToken")}: {otp.qr_token}
                </div>
              )}
              {otp?.expires_at && (
                <div className="mt-1">
                  {t("customerOtp.expiresAt")}: {new Date(otp.expires_at).toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button type="button" className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => generateOtp(card.id)} disabled={isOtpLoading}>
                {isOtpLoading ? t("customerOtp.generating") : t("customerOtp.generate")}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
