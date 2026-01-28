-- Delete the previously seeded default reward (if present).
DELETE FROM "RewardItem"
WHERE "store_id" IS NULL
  AND "points_cost" = 100
  AND "value_amount" = 10
  AND "name_en" = 'Voucher 10 ILS';
