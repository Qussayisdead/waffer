-- Fix corrupted Arabic reward names.
-- 1) If it's the default voucher, restore proper Arabic.
-- 2) Otherwise, fallback to name_en when available.
UPDATE "RewardItem"
SET "name_ar" = CASE
  WHEN "name_en" ILIKE 'Voucher 10 ILS%' THEN 'قسيمة شرائية 10 شيكل'
  WHEN "name_en" IS NOT NULL THEN "name_en"
  ELSE "name_ar"
END
WHERE "name_ar" LIKE '%?%';
