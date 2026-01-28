import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const reportsRouter = Router();

function parseDateRange(input) {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = input.from ? new Date(input.from) : defaultFrom;
  const to = input.to ? new Date(input.to) : now;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw httpError(400, "errors.validation", [
      { field: "date", message: "invalid" }
    ]);
  }

  return { from, to };
}

reportsRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const { from, to } = parseDateRange(payload);

    const rows = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COUNT(*) AS invoice_count
      FROM "Invoice"
      WHERE created_at >= ${from} AND created_at < ${to}
    `;

    const summary = rows[0] || { total_sales: 0, discounts_given: 0, invoice_count: 0 };

    ok(res, req.t("reports.fetched"), {
      metrics: [
        {
          key: "totalSales",
          value: Number(summary.total_sales),
          currency: "SAR",
          labelKey: "reports.totalSales",
          label: req.t("reports.totalSales")
        },
        {
          key: "discountsGiven",
          value: Number(summary.discounts_given),
          currency: "SAR",
          labelKey: "reports.discounts",
          label: req.t("reports.discounts")
        },
        {
          key: "invoiceCount",
          value: Number(summary.invoice_count),
          labelKey: "reports.invoiceCount",
          label: req.t("reports.invoiceCount")
        }
      ]
    });
  })
);

reportsRouter.get(
  "/store-breakdown",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      sort: z.enum(["totalSales", "discountsGiven", "invoiceCount"]).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const { from, to } = parseDateRange(payload);
    const limit = payload.limit ? Number(payload.limit) : 50;
    const sortField = payload.sort || "totalSales";

    const sortSql =
      sortField === "discountsGiven"
        ? Prisma.sql`discounts_given`
        : sortField === "invoiceCount"
          ? Prisma.sql`invoice_count`
          : Prisma.sql`total_sales`;

    const rows = await prisma.$queryRaw`
      SELECT
        s.id AS store_id,
        s.name_ar AS store_name_ar,
        COALESCE(SUM(i.total), 0) AS total_sales,
        COALESCE(SUM(i.discount_amount), 0) AS discounts_given,
        COUNT(i.id) AS invoice_count
      FROM "Store" s
      LEFT JOIN "Invoice" i
        ON i.store_id = s.id
        AND i.created_at >= ${from} AND i.created_at < ${to}
      GROUP BY s.id, s.name_ar
      ORDER BY ${sortSql} DESC
      LIMIT ${limit}
    `;

    const data = rows.map((row) => ({
      storeId: row.store_id,
      storeNameAr: row.store_name_ar,
      totalSales: Number(row.total_sales),
      discountsGiven: Number(row.discounts_given),
      invoiceCount: Number(row.invoice_count)
    }));

    ok(res, req.t("reports.fetched"), { storeBreakdown: data });
  })
);

reportsRouter.get(
  "/time-series",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      granularity: z.enum(["day", "week", "month", "year"]).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const { from, to } = parseDateRange(payload);
    const granularity = payload.granularity || "day";

    const rows = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${granularity}, created_at) AS bucket,
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given
      FROM "Invoice"
      WHERE created_at >= ${from} AND created_at < ${to}
      GROUP BY bucket
      ORDER BY bucket
    `;

    const series = rows.map((row) => ({
      bucket: row.bucket,
      totalSales: Number(row.total_sales),
      discountsGiven: Number(row.discounts_given)
    }));

    ok(res, req.t("reports.fetched"), { series });
  })
);

reportsRouter.get(
  "/monthly-statement",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      store_id: z.string().uuid(),
      month: z.string().regex(/^\d{1,2}$/),
      year: z.string().regex(/^\d{4}$/)
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const month = Number(payload.month);
    const year = Number(payload.year);
    if (month < 1 || month > 12) {
      throw httpError(400, "errors.validation", [{ field: "month", message: "invalid" }]);
    }

    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));

    const store = await prisma.store.findUnique({
      where: { id: payload.store_id },
      select: { id: true, name_ar: true, name_en: true }
    });
    if (!store) throw httpError(404, "store.notFound");

    const summaryRows = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(subtotal), 0) AS subtotal_sum,
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COALESCE(SUM(commission_amount), 0) AS commissions_total,
        COUNT(*) AS invoice_count,
        COALESCE(AVG(discount_percent_applied), 0) AS avg_discount_percent
      FROM "Invoice"
      WHERE store_id = ${store.id}
        AND created_at >= ${from} AND created_at < ${to}
    `;

    const summary = summaryRows[0] || {
      subtotal_sum: 0,
      total_sales: 0,
      discounts_given: 0,
      invoice_count: 0,
      avg_discount_percent: 0
    };

    const dailyRows = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', created_at) AS bucket,
        COALESCE(SUM(subtotal), 0) AS subtotal_sum,
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COALESCE(SUM(commission_amount), 0) AS commissions_total,
        COUNT(*) AS invoice_count
      FROM "Invoice"
      WHERE store_id = ${store.id}
        AND created_at >= ${from} AND created_at < ${to}
      GROUP BY bucket
      ORDER BY bucket
    `;

    const invoiceCount = Number(summary.invoice_count);
    const averageTicket = invoiceCount > 0 ? Number(summary.total_sales) / invoiceCount : 0;

    ok(res, req.t("reports.fetched"), {
      store,
      period: { year, month, from, to },
      currency: "ILS",
      summary: {
        subtotal: Number(summary.subtotal_sum),
        totalSales: Number(summary.total_sales),
        discountsGiven: Number(summary.discounts_given),
        commissionsTotal: Number(summary.commissions_total),
        invoiceCount,
        averageTicket,
        averageDiscountPercent: Number(summary.avg_discount_percent)
      },
      daily: dailyRows.map((row) => ({
        bucket: row.bucket,
        subtotal: Number(row.subtotal_sum),
        totalSales: Number(row.total_sales),
        discountsGiven: Number(row.discounts_given),
        commissionsTotal: Number(row.commissions_total),
        invoiceCount: Number(row.invoice_count)
      }))
    });
  })
);

export { reportsRouter };
