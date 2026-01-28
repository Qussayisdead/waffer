"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { apiRequest } from "../../lib/api";
import { useI18n } from "../../i18n";
import { PageHeader } from "../../components/PageHeader";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { DataTable } from "../../components/DataTable";
import { ErrorBanner } from "../../components/ErrorBanner";

type Customer = {
  id: string;
  name_ar: string;
  phone?: string | null;
  default_discount_percent: number;
};

type Store = {
  id: string;
  name_ar: string;
  name_en?: string | null;
};

type Card = {
  id: string;
  card_number: string;
  qr_token: string;
  status: string;
  issued_at: string;
  customer_name: string | null;
  store_name: string | null;
};

export default function CustomersCardsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Customer[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [cardResult, setCardResult] = useState<{ card_number: string; qr_token: string } | null>(
    null
  );
  const [qrPng, setQrPng] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name_ar: "",
    name_en: "",
    phone: "",
    email: "",
    default_discount_percent: 5
  });
  const [cardForm, setCardForm] = useState({
    customer_id: "",
    store_id: ""
  });

  const loadCustomers = async () => {
    try {
      setError(null);
      const response = await apiRequest<Customer[]>("/api/v1/customers");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const loadCards = async () => {
    try {
      const query = storeFilter ? `?store_id=${storeFilter}` : "";
      const response = await apiRequest<Card[]>(`/api/v1/cards${query}`);
      setCards(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const loadStores = async () => {
    try {
      const response = await apiRequest<Store[]>("/api/v1/stores");
      setStores(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadCustomers();
    loadStores();
    loadCards();
  }, []);

  useEffect(() => {
    loadCards();
  }, [storeFilter]);

  const createCustomer = async () => {
    try {
      setError(null);
      await apiRequest<Customer>("/api/v1/customers", {
        method: "POST",
        body: JSON.stringify({
          ...customerForm,
          default_discount_percent: Number(customerForm.default_discount_percent)
        })
      });
      setCustomerForm({
        name_ar: "",
        name_en: "",
        phone: "",
        email: "",
        default_discount_percent: 5
      });
      await loadCustomers();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const updateCustomer = async () => {
    if (!editing) return;
    try {
      setError(null);
      await apiRequest<Customer>(`/api/v1/customers/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...customerForm,
          default_discount_percent: Number(customerForm.default_discount_percent)
        })
      });
      setEditing(null);
      setCustomerForm({
        name_ar: "",
        name_en: "",
        phone: "",
        email: "",
        default_discount_percent: 5
      });
      await loadCustomers();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    try {
      setError(null);
      await apiRequest(`/api/v1/customers/${id}`, { method: "DELETE" });
      await loadCustomers();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const issueCard = async () => {
    try {
      setError(null);
      const response = await apiRequest<{ card_number: string; qr_token: string }>(
        "/api/v1/cards/issue",
        {
          method: "POST",
          body: JSON.stringify(cardForm)
        }
      );
      setCardResult({
        card_number: response.data.card_number,
        qr_token: response.data.qr_token
      });
      setCardForm({ customer_id: "", store_id: "" });
      await loadCards();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    const generateQr = async () => {
      if (!cardResult) {
        setQrPng(null);
        setQrSvg(null);
        return;
      }
      const png = await QRCode.toDataURL(cardResult.qr_token, { width: 220, margin: 1 });
      const svg = await QRCode.toString(cardResult.qr_token, { type: "svg", margin: 1 });
      setQrPng(png);
      setQrSvg(svg);
    };
    generateQr();
  }, [cardResult]);

  const downloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "card-qr.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const printCard = () => {
    if (!qrPng || !cardResult) return;
    const printWindow = window.open("", "_blank", "width=420,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>Card</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; margin: 24px; }
            .card { border: 1px solid #ddd; border-radius: 16px; padding: 16px; text-align: center; }
            .title { font-size: 16px; margin-bottom: 8px; }
            .meta { font-size: 12px; color: #444; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${t("cards.issuedCard")}</div>
            <img src="${qrPng}" width="220" height="220" />
            <div class="meta">${t("cards.cardNumber")}: ${cardResult.card_number}</div>
            <div class="meta">${t("cards.qrToken")}: ${cardResult.qr_token}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t("customers.title")} />
      <ErrorBanner message={error} />
      <div className="glass rounded-2xl border border-white/60 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label={t("customers.nameAr")}
            value={customerForm.name_ar}
            onChange={(event) => setCustomerForm({ ...customerForm, name_ar: event.target.value })}
          />
          <Input
            label={t("customers.nameEn")}
            value={customerForm.name_en}
            onChange={(event) => setCustomerForm({ ...customerForm, name_en: event.target.value })}
          />
          <Input
            label={t("customers.phone")}
            value={customerForm.phone}
            onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })}
          />
          <Input
            label={t("customers.email")}
            value={customerForm.email}
            onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
          />
          <Input
            label={t("customers.discount")}
            type="number"
            value={customerForm.default_discount_percent}
            onChange={(event) =>
              setCustomerForm({
                ...customerForm,
                default_discount_percent: Number(event.target.value)
              })
            }
          />
        </div>
        <div className="mt-4 flex gap-3">
          {!editing ? (
            <Button type="button" onClick={createCustomer}>
              {t("actions.create")}
            </Button>
          ) : (
            <>
              <Button type="button" onClick={updateCustomer}>
                {t("actions.update")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t("actions.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name_ar", label: t("customers.nameAr") },
          { key: "phone", label: t("customers.phone") },
          { key: "default_discount_percent", label: t("customers.discount") }
        ]}
        rows={rows}
        renderActions={(row) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(row);
                setCustomerForm({
                  name_ar: row.name_ar,
                  name_en: "",
                  phone: row.phone || "",
                  email: "",
                  default_discount_percent: row.default_discount_percent
                });
              }}
            >
              {t("actions.edit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => deleteCustomer(row.id)}>
              {t("actions.delete")}
            </Button>
          </div>
        )}
      />

      <div className="glass rounded-2xl border border-white/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">{t("cards.issue")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("cards.customerId")}
            value={cardForm.customer_id}
            onChange={(event) => setCardForm({ ...cardForm, customer_id: event.target.value })}
          />
          <Input
            label={t("cards.storeId")}
            value={cardForm.store_id}
            onChange={(event) => setCardForm({ ...cardForm, store_id: event.target.value })}
          />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={issueCard}>
            {t("cards.issue")}
          </Button>
        </div>
      {cardResult && (
        <div className="mt-4 rounded-xl border border-white/60 bg-white/60 p-4 text-sm text-ink">
            <div>
              {t("cards.cardNumber")}: {cardResult.card_number}
            </div>
            <div>
              {t("cards.qrToken")}: {cardResult.qr_token}
            </div>
            {qrPng && (
              <div className="mt-4 flex flex-col gap-3">
                <img src={qrPng} alt="QR" className="h-40 w-40 rounded-xl border" />
                <div className="flex flex-wrap gap-2">
                  <a
                    className="rounded-xl border border-dusk/20 px-4 py-2 text-sm text-dusk"
                    href={qrPng}
                    download="card-qr.png"
                  >
                    {t("cards.downloadPng")}
                  </a>
                  <button
                    type="button"
                    className="rounded-xl border border-dusk/20 px-4 py-2 text-sm text-dusk"
                    onClick={downloadSvg}
                  >
                    {t("cards.downloadSvg")}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-dusk/20 px-4 py-2 text-sm text-dusk"
                    onClick={printCard}
                  >
                    {t("cards.printPdf")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">{t("cards.title")}</h2>
        <label className="block max-w-sm space-y-2 text-sm">
          <span className="text-dusk/80">{t("cards.filterStore")}</span>
          <select
            className="w-full rounded-xl border border-dusk/20 bg-white/80 px-4 py-3 text-ink outline-none focus:border-clay/60"
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
          >
            <option value="">{t("actions.all")}</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name_ar || store.name_en}
              </option>
            ))}
          </select>
        </label>
        <DataTable
          columns={[
            { key: "card_number", label: t("cards.cardNumber") },
            { key: "customer_name", label: t("cards.holder") },
            { key: "store_name", label: t("cards.store") },
            { key: "status", label: t("cards.statusLabel") }
          ]}
          rows={cards}
        />
      </div>
    </div>
  );
}
