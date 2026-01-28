-- Fix Arabic reward name for default voucher
UPDATE "RewardItem"
SET "name_ar" = '????? ?????? 10 ????'
WHERE "store_id" IS NULL AND "points_cost" = 100 AND "value_amount" = 10;
