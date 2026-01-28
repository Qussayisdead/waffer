import { prisma } from "../db/prisma.js";

export async function logAudit({ req, action, entity, entityId, meta, storeId }) {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: req.user?.sub || null,
        actor_role: req.user?.role || null,
        store_id: storeId || req.user?.store_id || null,
        action,
        entity,
        entity_id: entityId || null,
        meta: meta || null
      }
    });
  } catch {
    // Avoid breaking main flow on audit failures.
  }
}
