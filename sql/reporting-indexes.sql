CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON "Invoice" (created_at);
CREATE INDEX IF NOT EXISTS invoices_store_id_created_at_idx ON "Invoice" (store_id, created_at);
CREATE INDEX IF NOT EXISTS invoices_store_id_idx ON "Invoice" (store_id);
