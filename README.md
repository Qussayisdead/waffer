# Smart Savings Card Backend (Arabic-first)

This is a minimal Express + Prisma + PostgreSQL backend foundation with Arabic as the primary language and English as an easy extension.

## Localization
- Translations live in `src/locales/ar.json` (default) and `src/locales/en.json`.
- Language is resolved by `?lang=ar|en` or `Accept-Language` header.
- Use `req.t("key.path")` to return localized messages.

## Database
- PostgreSQL stores UTF-8 by default, which supports Arabic text.
- Prisma models live in `prisma/schema.prisma`.

## Endpoints

Stores
- `POST /api/v1/stores`
  - Body: `name_ar` (required), `name_en?`, `max_discount_percent` (0-100), `is_active?`
- `GET /api/v1/stores`
- `GET /api/v1/stores/:id`
- `PATCH /api/v1/stores/:id`
- `DELETE /api/v1/stores/:id` (soft delete sets `is_active=false`)

Customers
- `POST /api/v1/customers`
  - Body: `name_ar` (required), `name_en?`, `phone?`, `email?`, `default_discount_percent` (0-100), `preferred_lang?`
- `GET /api/v1/customers`
- `GET /api/v1/customers/:id`
- `PATCH /api/v1/customers/:id`
- `DELETE /api/v1/customers/:id`

Cards
- `POST /api/v1/cards/issue`
  - Body: `customer_id`, `store_id`
- `GET /api/v1/cards/:id`
- `PATCH /api/v1/cards/:id/status`
  - Body: `status` in `active|blocked|expired`

Invoices
- `POST /api/v1/invoices/scan`
  - Body: `qr_token`, `subtotal`, `currency?`
  - Discount: `min(customer.default_discount_percent, store.max_discount_percent)`

Reports
- `GET /api/v1/reports/summary?from&to`
- `GET /api/v1/reports/store-breakdown?from&to&limit&sort`
- `GET /api/v1/reports/time-series?from&to&granularity`
- `GET /api/v1/reports/monthly-statement?store_id&month&year`

Auth
- `POST /api/v1/auth/register` (bootstrap admin when no users exist)
- `POST /api/v1/auth/login`

Users
- `GET /api/v1/users`
- `POST /api/v1/users` (admin creates store/admin users)

Store
- `POST /api/v1/store/cards/lookup`

## Example response shape
```json
{
  "success": true,
  "message": "تم إنشاء العميل بنجاح",
  "data": {},
  "errors": []
}
```

## Setup
1) Set `DATABASE_URL` in your environment.
2) Run Prisma:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
3) Set `JWT_SECRET` in `.env`
4) Start server: `npm run dev`

## Reporting indexes
Optional SQL to add reporting indexes lives in `sql/reporting-indexes.sql`.
