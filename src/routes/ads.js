import { Router } from "express";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const adsRouter = Router();
const publicAdsRouter = Router();
const uploadsDir = path.resolve("uploads", "ads");
fs.mkdirSync(uploadsDir, { recursive: true });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

async function uploadToSupabase(filePath, fileName) {
  if (!supabaseUrl || !supabaseKey || !supabaseBucket) return null;
  const buffer = await fs.promises.readFile(filePath);
  const objectPath = `ads/${fileName}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      "Content-Type": "application/octet-stream"
    },
    body: buffer
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw httpError(500, "errors.internal", [{ field: "image", message: text || "upload failed" }]);
  }

  return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${objectPath}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 8) || ".png";
    const stamp = Date.now();
    const rand = crypto.randomBytes(4).toString("hex");
    cb(null, `ad_${req.params.id || "new"}_${stamp}_${rand}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

adsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      title: z.string().min(2, req.t("validation.required")),
      body: z.string().min(4, req.t("validation.required")),
      link_url: z.string().url().optional().nullable(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const ad = await prisma.ad.create({
      data: {
        title: payload.title,
        body: payload.body,
        link_url: payload.link_url || null,
        image_url: null,
        is_active: payload.is_active ?? true
      }
    });
    ok(res, req.t("ads.created"), ad);
  })
);

adsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.ad.findMany({ orderBy: { created_at: "desc" } });
    ok(res, req.t("ads.listed"), items);
  })
);

adsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      title: z.string().min(2, req.t("validation.required")).optional(),
      body: z.string().min(4, req.t("validation.required")).optional(),
      link_url: z.string().url().optional().nullable(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const ad = await prisma.ad.update({ where: { id: req.params.id }, data: payload });
    ok(res, req.t("ads.updated"), ad);
  })
);

adsRouter.post(
  "/:id/image",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file || !req.file.mimetype.startsWith("image/")) {
      throw httpError(400, "errors.validation", [{ field: "image", message: "validation.required" }]);
    }

    let imageUrl = `/uploads/ads/${req.file.filename}`;
    if (process.env.NODE_ENV === "production") {
      if (!supabaseUrl || !supabaseKey || !supabaseBucket) {
        throw httpError(500, "errors.internal", [{ field: "image", message: "storage.notConfigured" }]);
      }
      imageUrl = await uploadToSupabase(req.file.path, req.file.filename);
      await fs.promises.unlink(req.file.path).catch(() => null);
    }

    const ad = await prisma.ad.update({
      where: { id: req.params.id },
      data: { image_url: imageUrl }
    });

    ok(res, req.t("ads.updated"), ad);
  })
);

adsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const ad = await prisma.ad.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });
    ok(res, req.t("ads.deleted"), ad);
  })
);

publicAdsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.ad.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" }
    });
    ok(res, req.t("ads.listed"), items);
  })
);

export { adsRouter, publicAdsRouter };
