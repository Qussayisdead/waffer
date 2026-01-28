import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";

const auditLogsRouter = Router();

auditLogsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const storeId = typeof req.query.store_id === "string" ? req.query.store_id : null;

    const logs = await prisma.auditLog.findMany({
      where: storeId ? { store_id: storeId } : undefined,
      include: { actor: { select: { name: true, email: true, role: true } } },
      orderBy: { created_at: "desc" },
      take: 200
    });

    const items = logs.map((log) => ({
      id: log.id,
      actor_name: log.actor?.name || null,
      actor_email: log.actor?.email || null,
      actor_role: log.actor?.role || log.actor_role || null,
      store_id: log.store_id,
      action: log.action,
      entity: log.entity,
      entity_id: log.entity_id,
      created_at: log.created_at,
      meta: log.meta || null
    }));

    ok(res, req.t("reward.listed"), items);
  })
);

export { auditLogsRouter };
