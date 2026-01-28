# Store Terminal UI (Arabic-first)

## Features
- RTL layout with Arabic labels by default.
- QR scan component using browser camera + `BarcodeDetector`.
- Simple invoice calculator for store employees.
- English-ready dictionaries in `src/i18n`.

## Usage
1) Install dependencies:
   - `npm install`
2) Run:
   - `npm run dev` (http://localhost:3001)

## API base
Set `NEXT_PUBLIC_API_BASE` in `store-ui/.env.local` if your backend is not `http://localhost:4000`.

## QR payload format
The scanner accepts JSON QR payloads like:
```json
{"customer_name":"أحمد سالم","discount_percent":12}
```
If the QR is not JSON, the UI will fall back to a default customer and discount.
