# Project Setup Checklist

## 1) Backend (API)
1. `cd saving-card`
2. `npm install`
3. Set `DATABASE_URL` and `JWT_SECRET` in `.env`
4. `npm run prisma:generate`
5. `npm run prisma:migrate`
6. `npm run dev`
7. Create the first admin user (works only when no users exist):
   - `POST http://localhost:4000/api/v1/auth/register`
   - Body: `{"name":"Admin","email":"admin@example.com","password":"1234","role":"admin"}`

## 2) Admin Dashboard
1. `cd admin`
2. `npm install`
3. Ensure `admin/.env.local` contains:
   - `NEXT_PUBLIC_API_BASE=http://localhost:4000`
4. `npm run dev` (http://localhost:3000)
5. Login using the admin account created above

## 3) Store UI (POS Terminal)
1. `cd store-ui`
2. `npm install`
3. `npm run dev` (http://localhost:3001)
4. Login using a store user (create from Admin -> Users)
